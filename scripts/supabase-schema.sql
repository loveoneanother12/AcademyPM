-- ============================================================
-- AcademyPM v2 — Supabase 스키마 SQL
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- students 테이블
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  grade         text,
  school        text,
  subjects      text[],      -- '{수학,영어}' 배열
  teacher       text,
  parent_phone  text,
  student_phone text,
  status        text default 'active',  -- 'active' | 'inactive'
  gender        text,                   -- '남' | '여'
  notes         text,
  created_at    timestamp with time zone default now()
);

-- classes 테이블
create table if not exists classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  subject      text,          -- '수학' | '영어' | '국어' | '과학'
  teacher      text,
  grade        text,
  time         text,          -- '20-22' 형식
  days         text[],        -- '{월,수,금}' 배열
  detail_memo  text,          -- 수업 상세 메모 (교재, 진도 등)
  is_clinic    boolean default false,  -- 클리닉 수업 여부
  sub_teacher  text,                  -- 보조강사
  created_at   timestamp with time zone default now()
);

-- class_students 연결 테이블 (학생-수업 다대다 관계)
create table if not exists class_students (
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  primary key (class_id, student_id)
);

-- attendance 테이블
-- date 타입 사용 (timestamp 절대 금지 — timezone 이슈)
create table if not exists attendance (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  class_id      uuid references classes(id) on delete cascade,
  student_id    uuid references students(id) on delete cascade,
  status        text,            -- 'present' | 'late' | 'absent'
  homework_pct  integer default 0,  -- 0~100
  is_na         boolean default false,  -- 클리닉 수업에서 해당없음 처리
  unique(date, class_id, student_id)
);

-- class_memos 테이블
create table if not exists class_memos (
  id        uuid primary key default gen_random_uuid(),
  date      date not null,
  class_id  uuid references classes(id) on delete cascade,
  memo      text,
  unique(date, class_id)
);

-- test_scores 테이블
create table if not exists test_scores (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  score       integer,   -- 0~100
  unique(date, class_id, student_id)
);

-- student_memos 테이블
create table if not exists student_memos (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references students(id) on delete cascade,
  memo        text,
  unique(date, class_id, student_id)
);

-- ============================================================
-- RLS 비활성화 (anon key로 전체 접근 허용)
-- 추후 인증 추가 시 활성화 필요
-- ============================================================

alter table students        disable row level security;
alter table classes         disable row level security;
alter table class_students  disable row level security;
alter table attendance      disable row level security;
alter table class_memos     disable row level security;
alter table test_scores     disable row level security;
alter table student_memos   disable row level security;

-- ============================================================
-- 인덱스 (조회 성능 최적화)
-- ============================================================

create index if not exists idx_attendance_date on attendance(date);
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_attendance_class on attendance(class_id);
create index if not exists idx_test_scores_date on test_scores(date);
create index if not exists idx_test_scores_student on test_scores(student_id);
create index if not exists idx_class_memos_date on class_memos(date);
create index if not exists idx_student_memos_student on student_memos(student_id);
create index if not exists idx_class_students_class on class_students(class_id);
create index if not exists idx_class_students_student on class_students(student_id);

-- ============================================================
-- 마이그레이션 (기존 DB에 컬럼 추가 시 실행)
-- ============================================================

alter table classes    add column if not exists is_clinic   boolean default false;
alter table classes    add column if not exists sub_teacher text;
alter table attendance add column if not exists is_na       boolean default false;
