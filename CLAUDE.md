# AcademyPM v2 — Claude Code 컨텍스트

## 프로젝트 개요
학원 원장/강사가 모바일에서 편하게 쓰는 학원 관리 웹앱.
기존 Google Sheets + GAS 기반 v1을 Supabase 기반으로 재설계한 버전.
UI/UX는 v1을 참고하되, 데이터/백엔드 레이어는 새로 작성.

## 기술 스택
- **프론트엔드**: Vite + Vanilla JS
- **DB**: Supabase (PostgreSQL)
- **배포**: GitHub Pages (정적 파일)
- Next.js, React, Vue 사용 금지
- 빌드 결과는 반드시 정적 파일(index.html + assets)

## 환경변수
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
두 변수가 없으면 자동으로 오프라인(샘플 데이터) 모드로 동작.

---

## 아키텍처

```
Vite + Vanilla JS
      ↕
src/lib/supabase.js   (Supabase 클라이언트 초기화)
      ↕
src/api.js            (데이터 레이어 — 모든 DB 접근 중앙화)
      ↕
Supabase (PostgreSQL)
```

각 페이지 파일은 api.js의 공개 함수만 호출.
페이지 파일에서 supabase 클라이언트를 직접 호출하지 않음.

---

## DB 스키마

### students
```sql
create table students (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  grade         text,
  school        text,
  subjects      text,        -- '수학,영어' 콤마 문자열
  teacher       text,
  parent_phone  text,
  student_phone text,
  status        text default 'active',  -- 'active' | 'inactive'
  gender        text,                   -- '남' | '여'
  notes         text,
  created_at    timestamp with time zone default now()
);
```

### classes
```sql
create table classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  subject      text,          -- '수학' | '영어' | '국어' | '과학'
  teacher      text,
  grade        text,
  time         text,          -- '20-22' 형식
  days         text,          -- '월,수,금' 콤마 문자열
  detail_memo  text,          -- 수업 상세 메모 (교재, 진도 등)
  created_at   timestamp with time zone default now()
);
```

### class_students (연결 테이블 — 학생-수업 관계)
```sql
create table class_students (
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  primary key (class_id, student_id)
);
```
- v1의 `classes.student_ids` 콤마 문자열을 정규화한 구조
- 수업에 학생 추가/제거는 이 테이블에서 처리

### attendance
```sql
create table attendance (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,   -- 반드시 date 타입 (timestamp 아님)
  class_id      uuid references classes(id) on delete cascade,
  student_id    uuid references students(id) on delete cascade,
  status        text,            -- 'present' | 'late' | 'absent'
  homework_pct  integer default 0,  -- 0~100
  unique(date, class_id, student_id)
);
```

### class_memos
```sql
create table class_memos (
  id        uuid primary key default gen_random_uuid(),
  date      date not null,
  class_id  uuid references classes(id) on delete cascade,
  memo      text,
  unique(date, class_id)
);
```

### test_scores
```sql
create table test_scores (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  score       integer,   -- 0~100
  unique(date, class_id, student_id)
);
```

### student_memos
```sql
create table student_memos (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  memo        text,
  unique(date, class_id, student_id)
);
```

### RLS 설정
초기에는 모든 테이블 RLS 비활성화 (anon key로 전체 접근):
```sql
alter table students      disable row level security;
alter table classes       disable row level security;
alter table class_students disable row level security;
alter table attendance    disable row level security;
alter table class_memos   disable row level security;
alter table test_scores   disable row level security;
alter table student_memos disable row level security;
```

---

## 날짜/시간 처리 원칙 (절대 규칙)

### 핵심 규칙
- DB 컬럼: 반드시 `date` 타입 (timestamp, timestamptz 사용 금지)
- 프론트 표준 포맷: `YYYY-MM-DD` 문자열 고정

### 날짜 생성 — 반드시 이것만 사용
```js
// ✅ 유일한 표준
const today = new Date().toLocaleDateString('sv-KR') // → '2026-04-01'

// ❌ 절대 사용 금지
new Date().toISOString()          // timezone offset → 날짜 밀림
new Date().toLocaleDateString()   // 로케일마다 포맷 다름
date.toISOString().slice(0, 10)   // UTC 기준이라 KST에서 날짜 밀림
```

### Supabase 조회
```js
// date 컬럼 필터는 문자열 그대로 전달
.eq('date', '2026-04-01')  // ✅
```

### 이유
학원 앱은 "몇 시"가 아니라 "몇 월 며칠"이 핵심.
`timestamp`를 쓰면 KST(UTC+9)에서 날짜가 하루 밀리는 버그 재발 위험.
`date` 타입은 timezone 영향을 받지 않으므로 안전.

---

## 학생-수업 관계 처리 원칙

v1의 `student_ids` 콤마 문자열 방식 폐기.
`class_students` 연결 테이블로 정규화.

### 수업의 학생 목록 조회
```js
const { data } = await supabase
  .from('class_students')
  .select('student_id, students(*)')
  .eq('class_id', classId)
```

### 수업에 학생 추가
```js
await supabase
  .from('class_students')
  .insert({ class_id: classId, student_id: studentId })
```

### 수업에서 학생 제거
```js
await supabase
  .from('class_students')
  .delete()
  .eq('class_id', classId)
  .eq('student_id', studentId)
```

---

## 저장 로직 원칙

v1의 "삭제 후 재삽입" 방식 폐기.
Supabase `upsert`로 대체.

### attendance upsert
```js
await supabase
  .from('attendance')
  .upsert(
    { date, class_id, student_id, status, homework_pct },
    { onConflict: 'date,class_id,student_id' }
  )
```

### class_memos upsert
```js
await supabase
  .from('class_memos')
  .upsert(
    { date, class_id, memo },
    { onConflict: 'date,class_id' }
  )
```

### test_scores upsert
```js
await supabase
  .from('test_scores')
  .upsert(
    { date, class_id, student_id, score },
    { onConflict: 'date,class_id,student_id' }
  )
```

unique 제약이 DB에 반드시 존재해야 upsert가 동작함.

---

## api.js 공개 함수 명세

아래 함수 시그니처를 반드시 유지. 페이지 파일들이 이 함수를 호출함.

```js
// 조회
getStudents()
getClasses()                          // class_students join 포함
getAttendance(date, classId?)
getClassMemo(date, classId)
getTestScores(date, classId)
getStudentMemos(date?, classId?, studentId?)
getStudentAttendance(studentId)       // 학생 상세용 — 전체 기간
getStudentTestScores(studentId)       // 학생 상세용 — 전체 기간
getAllClassMemos(classId)             // 수업 상세용
getAllClassAttendance(classId)        // 수업 상세용
getAllClassTestScores(classId)        // 수업 상세용

// 쓰기
insertRow(sheet, data)               // sheet = 테이블명
updateRow(sheet, id, data)
deleteRow(sheet, id)

// upsert (출결/메모/점수 전용)
upsertAttendance(date, classId, studentId, data)
upsertClassMemo(date, classId, memo)
upsertTestScore(date, classId, studentId, score)
upsertStudentMemo(date, classId, studentId, memo)
```

오프라인 모드: `VITE_SUPABASE_URL`이 없으면 샘플 데이터 반환.

---

## 디자인 시스템 (v1 그대로 유지)

### 색상 변수
```css
--bg: #0f0f12
--bg2: #17171c
--bg3: #1e1e26
--card: #21212c
--border: #2e2e3e
--accent: #7c6ef7      /* 메인 퍼플 */
--accent2: #5ee8c0     /* 민트/초록 */
--accent3: #f78c6c     /* 주황 */
--text: #e8e8f0
--text2: #9090aa
--text3: #5a5a72
--red: #f06c6c
--green: #5ee8a0
--yellow: #f7c96c
--blue: #6cb8f0
```

### 폰트
- 본문: Noto Sans KR
- 숫자/코드: DM Mono

### 공통 패턴
- 카드: border-radius 16px, border 1px
- 모달: 하단 바텀시트, 위로 슬라이드
- 토스트: 하단 중앙, 2.2초
- 배지/pill: border-radius 100px
- 아코디언: max-height transition
- 슬라이더 트랙: 값에 따라 green/yellow/red

### 모바일 최적화
- max-width: 420px, margin: 0 auto
- 스크롤바 숨김
- tap highlight 제거

---

## 기능 명세

### 탭 1: 학생 관리
- 학생 목록 (카드): 이름, 성별 배지, 학년, 학교, 과목 태그
- 이름/학교 실시간 검색
- 새 학생 추가 바텀시트 (이름, 성별, 학년, 학교, 과목, 연락처, 비고)
- 학생 카드 탭 → 상세 바텀시트
  - 수업별 출석/과제 통계 (4주 기준)
  - 최근 테스트 점수 차트
  - 수정/삭제

### 탭 2: 수업 관리
- 수업 목록 (카드): 수업명, 과목 배지, 강사, 학년, 요일 칩, 시간, 인원
- 새 수업 추가 바텀시트 (수업명, 과목, 강사, 학년, 시간, 요일, 수강생, 수업 상세메모)
- 수업 카드 탭 → 상세 바텀시트
  - 수업 상세 메모 표시
  - 최근 수업 메모 목록
  - 수강 학생 목록
  - 수정/삭제

### 탭 3: 출석 (메인 기능)
- 날짜 이동 (◀ 날짜 ▶) + 캘린더 팝업
- 주간 스트립 (이번 주, 데이터 있는 날 점 표시)
- 해당일의 전체 수업 목록 (반별 아코디언)
  - 헤더: 수업명 / 시간 / 과목 배지 / 출석요약 pill (N출 N지 N결)
  - 펼치면:
    - [수업 메모] [테스트 결과] 버튼
    - 수업 메모 패널 (textarea + 저장, 저장 시 ✦ 표시)
    - 테스트 결과 패널 (학생별 점수 입력, 실시간 등급 A/B/C/D)
    - 학생 행: 아바타 / 이름+학교 / 출결 버튼 / 과제 슬라이더 (0-100%)
  - 출결 버튼은 클릭 즉시 자동 저장 (upsert)
  - 슬라이더는 조작 끝나면 자동 저장

### 탭 4: 결과
- 날짜별 수업별 요약 뷰
- 출결 현황, 수업 메모, 테스트 점수 조회

---

## 파일 구조 (목표)

```
academypm-v2/
├── CLAUDE.md
├── index.html
├── src/
│   ├── main.js
│   ├── lib/
│   │   └── supabase.js          ← Supabase 클라이언트
│   ├── api.js                   ← 데이터 레이어 (핵심)
│   ├── pages/
│   │   ├── students.js
│   │   ├── classes.js
│   │   ├── attendance.js
│   │   └── results.js
│   ├── components/
│   │   ├── modal.js             ← v1에서 복사
│   │   └── toast.js             ← v1에서 복사
│   └── styles/
│       └── main.css
├── scripts/
│   └── supabase-schema.sql      ← Supabase에서 실행할 SQL
├── .github/
│   └── workflows/
│       └── deploy.yml           ← GitHub Pages 자동 배포
├── vite.config.js
└── package.json
```

---

## Supabase 무료 플랜 고려사항

### 예상 사용량 (학생 120명, 수업 16개, 매일 운영)
- 하루 write: 약 250~300건
- 월 write: 약 7,500건
- DB 용량: 텍스트 중심이라 수년치도 50MB 이하 → 문제없음

### 병목 위험 항목
| 항목 | 위험도 | 대응 |
|---|---|---|
| DB 용량 (500MB) | 낮음 | 텍스트만이라 수년 운영 가능 |
| **7일 비활성 정지** | **높음** | **GitHub Actions ping 자동화 필수** |
| 동시 접속 | 낮음 | 강사 2~3명 수준 |
| 읽기 과부하 | 중간 | 탭 전환 시 중복 조회 → 캐싱 도입 권장 |

### 7일 비활성 정지 방지 — GitHub Actions ping
```yaml
# .github/workflows/ping.yml
on:
  schedule:
    - cron: '0 0 */6 * *'   # 6일마다 실행
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl ${{ secrets.VITE_SUPABASE_URL }}/rest/v1/students?select=id&limit=1 \
               -H "apikey: ${{ secrets.VITE_SUPABASE_ANON_KEY }}"
```

---

## 개발 순서 (Claude Code 작업 분해)

### 프롬프트 1: 프로젝트 초기화
```
CLAUDE.md를 읽고 프로젝트를 초기화해줘.
package.json, vite.config.js 생성.
index.html 기본 구조 (4개 탭 네비게이션, toast-container, modal-overlay).
src/main.js 탭 라우팅 구조.
```

### 프롬프트 2: Supabase 스키마 SQL
```
scripts/supabase-schema.sql 파일을 만들어줘.
CLAUDE.md의 DB 스키마대로 7개 테이블 생성 SQL.
unique 제약 포함.
RLS 비활성화 포함.
```

### 프롬프트 3: 데이터 레이어
```
src/lib/supabase.js 와 src/api.js 를 만들어줘.
CLAUDE.md의 api.js 공개 함수 명세 그대로.
VITE_SUPABASE_URL 없으면 오프라인 샘플 데이터 반환.
날짜는 toLocaleDateString('sv-KR') 만 사용.
```

### 프롬프트 4: UI 유틸
```
v1 코드를 참고해서 modal.js, toast.js, main.css 를 만들어줘.
디자인 시스템은 CLAUDE.md 그대로.
```

### 프롬프트 5: 학생 탭
```
src/pages/students.js 구현.
CLAUDE.md 기능 명세 참고.
api.js의 getStudents, insertRow, updateRow, deleteRow 사용.
```

### 프롬프트 6: 수업 탭
```
src/pages/classes.js 구현.
class_students 연결 테이블 구조 사용 (student_ids 콤마 문자열 방식 쓰지 않음).
```

### 프롬프트 7: 출석 탭 (핵심)
```
src/pages/attendance.js 구현.
날짜 이동, 주간 스트립, 반별 아코디언.
출결/과제/메모/테스트 입력 및 즉시 저장 (upsert).
```

### 프롬프트 8: 결과 탭
```
src/pages/results.js 구현.
날짜별 수업별 요약 조회.
```

### 프롬프트 9: 배포 설정
```
.github/workflows/deploy.yml — GitHub Pages 자동 배포.
.github/workflows/ping.yml — Supabase 비활성 방지 ping.
vite.config.js base 설정 ('/AcademyPM/').
```

---

## 샘플 데이터 (오프라인 모드용)

```js
const SAMPLE_STUDENTS = [
  { id:'s1', name:'김민준', grade:'고1', school:'성남고', subjects:'수학,영어', teacher:'현재T', parent_phone:'010-1234-5678', student_phone:'010-9876-5432', status:'active', gender:'남', notes:'' },
  { id:'s2', name:'이서연', grade:'고2', school:'분당고', subjects:'수학', teacher:'현재T', parent_phone:'010-2345-6789', student_phone:'010-8765-4321', status:'active', gender:'여', notes:'' },
  { id:'s3', name:'박지호', grade:'중3', school:'구암중', subjects:'국어,영어,수학', teacher:'현재T', parent_phone:'010-3456-7890', student_phone:'010-7654-3210', status:'inactive', gender:'남', notes:'잠시 휴원' },
  { id:'s4', name:'최유진', grade:'고1', school:'성남고', subjects:'수학', teacher:'현재T', parent_phone:'010-4567-8901', student_phone:'010-6543-2109', status:'active', gender:'여', notes:'' },
  { id:'s5', name:'정하은', grade:'중3', school:'구암중', subjects:'국어', teacher:'지현T', parent_phone:'010-5678-9012', student_phone:'010-5432-1098', status:'active', gender:'여', notes:'' },
]

const SAMPLE_CLASSES = [
  { id:'c1', name:'고1 수학', subject:'수학', teacher:'현재T', grade:'고1', time:'20-22', days:'월,수,금', detail_memo:'', students:['s1','s4'] },
  { id:'c2', name:'고2 수학', subject:'수학', teacher:'현재T', grade:'고2', time:'18-20', days:'화,목', detail_memo:'', students:['s2'] },
  { id:'c3', name:'중등 국어', subject:'국어', teacher:'지현T', grade:'중3', time:'16-18', days:'월,목', detail_memo:'', students:['s3','s5'] },
]
```

오프라인 모드에서 `classes`의 `students`는 `student_id` 배열로 관리.
온라인(Supabase)에서는 `class_students` 테이블 join으로 동일하게 제공.

---

## 주의사항 요약

1. **날짜는 반드시 `toLocaleDateString('sv-KR')`** — 다른 방식 절대 금지
2. **DB 날짜 컬럼은 `date` 타입** — `timestamp` 사용 금지
3. **학생-수업 관계는 `class_students` 테이블** — 콤마 문자열 방식 금지
4. **저장은 반드시 upsert** — 삭제 후 재삽입 방식 금지
5. **supabase 클라이언트는 `src/lib/supabase.js`에서만 초기화** — 페이지에서 직접 임포트 금지
6. **모든 DB 접근은 `api.js` 경유** — 페이지에서 supabase 직접 호출 금지
7. **오프라인 모드는 항상 유지** — 환경변수 없어도 샘플 데이터로 동작
