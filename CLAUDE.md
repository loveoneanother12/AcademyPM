# AcademyPM v2 — Claude Code 컨텍스트

## 프로젝트 개요
학원 원장/강사가 모바일에서 편하게 쓰는 학원 관리 웹앱.
Vite + Vanilla JS + Supabase 기반. GitHub Pages 정적 배포.
Next.js, React, Vue 사용 금지. 빌드 결과는 반드시 정적 파일.

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

- 페이지 파일은 `api.js`의 공개 함수만 호출
- 페이지에서 supabase 클라이언트 직접 호출 금지

## 파일 구조

```
academypm-v2/
├── CLAUDE.md
├── index.html
├── src/
│   ├── main.js
│   ├── lib/supabase.js
│   ├── api.js
│   ├── pages/
│   │   ├── students.js
│   │   ├── classes.js
│   │   ├── attendance.js
│   │   ├── results.js
│   │   └── report.js        ← 공유 링크용 학생 리포트 페이지
│   ├── components/
│   │   ├── modal.js
│   │   └── toast.js
│   └── styles/main.css
├── scripts/supabase-schema.sql
└── .github/workflows/
    ├── deploy.yml
    └── ping.yml
```

---

## DB 스키마

정본: `scripts/supabase-schema.sql`

테이블 목록: `students`, `classes`, `class_students`, `attendance`, `class_memos`, `test_scores`, `student_memos`, `student_tokens`

주요 컬럼 메모:
- `classes`: `is_clinic boolean`, `sub_teacher text` 포함
- `attendance`: `is_na boolean` 포함 (클리닉 수업 해당없음)
- `student_tokens`: 공유 링크 토큰 (`token`, `expires_at`, `data_from`, `data_to`)
- `class_students`: 학생-수업 다대다 연결 테이블
- 모든 날짜 컬럼은 `date` 타입 (`timestamp` 금지)
- RLS 전체 비활성화 (anon key로 전체 접근)

---

## 날짜/시간 처리 원칙 (절대 규칙)

```js
// ✅ 유일한 표준
const today = new Date().toLocaleDateString('sv-KR') // → '2026-04-01'

// ❌ 절대 사용 금지
new Date().toISOString()          // timezone offset → 날짜 밀림
new Date().toLocaleDateString()   // 로케일마다 포맷 다름
date.toISOString().slice(0, 10)   // UTC 기준이라 KST에서 날짜 밀림
```

KST(UTC+9)에서 `timestamp` 쓰면 날짜가 하루 밀리는 버그 발생. `date` 타입은 timezone 영향 없어 안전.

---

## api.js 공개 함수 명세

```js
// 조회
getStudents()
getClasses()                              // class_students join 포함
getAttendance(date, classId?)
getClassMemo(date, classId)
getTestScores(date, classId)
getStudentMemos(date?, classId?, studentId?)
getStudentAttendance(studentId)
getStudentTestScores(studentId)
getAllClassMemos(classId)
getAllClassAttendance(classId)
getAllClassTestScores(classId)
getStudentToken(token)                    // 공유 링크 토큰 조회
getStudentReportData(studentId, from, to) // 리포트 페이지용

// 쓰기
insertRow(sheet, data)
updateRow(sheet, id, data)
deleteRow(sheet, id)
syncClassStudents(classId, studentIds)    // 수업 수강생 일괄 동기화

// upsert
upsertAttendance(date, classId, studentId, data)
upsertClassMemo(date, classId, memo)
upsertTestScore(date, classId, studentId, score)
upsertStudentMemo(date, classId, studentId, memo)
upsertStudentToken(studentId, token, expiresAt, dataFrom, dataTo)
```

오프라인 모드: `VITE_SUPABASE_URL`이 없으면 샘플 데이터 반환.

---

## 디자인 시스템

### 색상 변수
```css
--bg: #0f0f12
--bg2: #17171c
--bg3: #1e1e26
--card: #21212c
--border: #2e2e3e
--accent: #7c6ef7
--text: #e8e8f0
--text2: #9090aa
--text3: #5a5a72
--red: #f06c6c
--green: #5ee8a0
--yellow: #f7c96c
```

### 공통 패턴
- 폰트: Noto Sans KR (본문), DM Mono (숫자/코드)
- 카드: border-radius 16px, border 1px
- 모달: 하단 바텀시트, 위로 슬라이드, 핸들 드래그 다운으로 닫기
- 토스트: 하단 중앙, 2.2초
- max-width: 420px, margin: 0 auto

---

## 기능 명세

### 탭 1: 학생 관리
- 학생 목록 카드, 이름/학교/과목 실시간 검색
- 추가/수정/삭제 바텀시트
- 학생 상세: 수업별 출석·과제 통계, 테스트 점수 그래프+목록, 4주 개인 메모
- 공유 링크/QR 생성: 데이터 기간 선택 + 링크 유효기간 선택 → 토큰 발급

### 탭 2: 수업 관리
- 수업 목록 카드, 수업명/강사/과목 실시간 검색
- 추가/수정: 과목, 강사, 보조강사(토글), 학년, 시간, 요일, 클리닉 수업(토글), 수강생 태그 선택
- 수업 상세: 수업 메모, 최근 수업 일지, 수강생 목록

### 탭 3: 출석
- 날짜 이동 + 캘린더 팝업, 주간 스트립
- 반별 아코디언: 수업 메모 / 테스트 결과 / 출결 각각 저장 버튼 분리
- 클리닉 수업: 학생별 "해당없음" 토글
- 학생 행: 출결 버튼(출석/지각/결석) + 과제 슬라이더 + 개인 메모

### 탭 4: 결과
- 날짜별 수업별 요약, 해당 요일 수업만 표시
- 출결 현황, 수업 메모, 학생별 메모 조회

### 공유 리포트 페이지 (?report=TOKEN)
- 앱 UI 숨기고 리포트만 표시
- 토큰 유효성·만료 검사
- 수업별: 출결 통계, 테스트 그래프+목록, 강사 메모 (결석 시 "(결석)", 메모 없음 시 "(특이사항 없음)")

---

## 주의사항

1. **날짜는 반드시 `toLocaleDateString('sv-KR')`** — 다른 방식 절대 금지
2. **DB 날짜 컬럼은 `date` 타입** — `timestamp` 사용 금지
3. **학생-수업 관계는 `class_students` 테이블** — 콤마 문자열 방식 금지
4. **저장은 반드시 upsert** — 삭제 후 재삽입 방식 금지
5. **모든 DB 접근은 `api.js` 경유** — 페이지에서 supabase 직접 호출 금지
6. **오프라인 모드는 항상 유지** — 환경변수 없어도 샘플 데이터로 동작
7. **학년 선택지는 중1~고3만** — 초등 제외

---

## Supabase 무료 플랜

### 7일 비활성 정지 방지 — GitHub Actions ping
```yaml
# .github/workflows/ping.yml
on:
  schedule:
    - cron: '0 0 */6 * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl ${{ secrets.VITE_SUPABASE_URL }}/rest/v1/students?select=id&limit=1
               -H "apikey: ${{ secrets.VITE_SUPABASE_ANON_KEY }}"
```

### 용량 여유
학생 150명, 주 75세션 기준 연간 ~37MB 증가 → 500MB 한도까지 약 13년.
