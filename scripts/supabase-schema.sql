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
  test_name   text,      -- 테스트명
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

-- student_tokens 테이블 (학생별 공유 링크 토큰)
create table if not exists student_tokens (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references students(id) on delete cascade,
  token       text unique not null,
  expires_at  timestamptz not null,
  data_from   date not null,
  data_to     date not null,
  created_at  timestamptz default now()
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
alter table student_tokens  disable row level security;

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

-- 기존 DB에 unique(student_id) 제약이 있는 경우 제거 (링크 다중 생성 허용)
alter table student_tokens drop constraint if exists student_tokens_student_id_key;
alter table test_scores    add column if not exists test_name text;

-- 단발성 수업
alter table classes add column if not exists is_oneday boolean default false;

-- 단기 기간 설정 (start_date/end_date)
alter table classes add column if not exists start_date date;
alter table classes add column if not exists end_date   date;

-- 하루에 테스트 여러 번 지원 (test_slot)
alter table test_scores    add column if not exists test_slot integer default 0;
alter table test_scores    drop constraint if exists test_scores_date_class_id_student_id_key;
alter table test_scores    drop constraint if exists test_scores_unique_slot;
alter table test_scores    add constraint test_scores_unique_slot unique(date, class_id, student_id, test_slot);

-- 완강 처리 (정규수업·기간한정 수업용)
alter table classes add column if not exists is_completed boolean default false;

-- ============================================================
-- SaaS 멀티테넌시 마이그레이션
-- 기존 스키마에 추가로 실행
-- ============================================================

-- 학원 테이블
create table if not exists academies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

-- 사용자-학원 프로필 테이블
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  academy_id  uuid references academies(id) on delete cascade,
  role        text not null default 'owner',  -- 'owner' | 'teacher' | 'superadmin'
  created_at  timestamptz default now()
);

-- 기존 테이블에 academy_id 컬럼 추가
alter table students       add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table classes        add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table attendance     add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table class_memos    add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table test_scores    add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table student_memos  add column if not exists academy_id uuid references academies(id) on delete cascade;
alter table student_tokens add column if not exists academy_id uuid references academies(id) on delete cascade;

-- ============================================================
-- RLS 활성화 (기존 disable → enable)
-- ============================================================

alter table academies       enable row level security;
alter table profiles        enable row level security;
alter table students        enable row level security;
alter table classes         enable row level security;
alter table class_students  enable row level security;
alter table attendance      enable row level security;
alter table class_memos     enable row level security;
alter table test_scores     enable row level security;
alter table student_memos   enable row level security;
alter table student_tokens  enable row level security;

-- ============================================================
-- 헬퍼 함수: 현재 유저의 academy_id 반환
-- ============================================================

create or replace function get_my_academy_id()
returns uuid language sql stable security definer
as $$ select academy_id from profiles where user_id = auth.uid() $$;

-- ============================================================
-- RLS 정책
-- ============================================================

-- profiles: 자신의 프로필만 조회
create policy "profiles_select" on profiles for select using (user_id = auth.uid());

-- academies: 자신의 학원만 조회
create policy "academies_select" on academies for select using (id = get_my_academy_id());

-- students
create policy "students_select" on students for select using (academy_id = get_my_academy_id());
create policy "students_insert" on students for insert with check (academy_id = get_my_academy_id());
create policy "students_update" on students for update using (academy_id = get_my_academy_id());
create policy "students_delete" on students for delete using (academy_id = get_my_academy_id());

-- classes
create policy "classes_select" on classes for select using (academy_id = get_my_academy_id());
create policy "classes_insert" on classes for insert with check (academy_id = get_my_academy_id());
create policy "classes_update" on classes for update using (academy_id = get_my_academy_id());
create policy "classes_delete" on classes for delete using (academy_id = get_my_academy_id());

-- class_students (academy_id 없음 — class_id로 간접 체크)
create policy "class_students_select" on class_students for select
  using (class_id in (select id from classes where academy_id = get_my_academy_id()));
create policy "class_students_insert" on class_students for insert
  with check (class_id in (select id from classes where academy_id = get_my_academy_id()));
create policy "class_students_delete" on class_students for delete
  using (class_id in (select id from classes where academy_id = get_my_academy_id()));

-- attendance
create policy "attendance_select" on attendance for select using (academy_id = get_my_academy_id());
create policy "attendance_insert" on attendance for insert with check (academy_id = get_my_academy_id());
create policy "attendance_update" on attendance for update using (academy_id = get_my_academy_id());

-- class_memos
create policy "class_memos_select" on class_memos for select using (academy_id = get_my_academy_id());
create policy "class_memos_insert" on class_memos for insert with check (academy_id = get_my_academy_id());
create policy "class_memos_update" on class_memos for update using (academy_id = get_my_academy_id());

-- test_scores
create policy "test_scores_select" on test_scores for select using (academy_id = get_my_academy_id());
create policy "test_scores_insert" on test_scores for insert with check (academy_id = get_my_academy_id());
create policy "test_scores_update" on test_scores for update using (academy_id = get_my_academy_id());

-- student_memos
create policy "student_memos_select" on student_memos for select using (academy_id = get_my_academy_id());
create policy "student_memos_insert" on student_memos for insert with check (academy_id = get_my_academy_id());
create policy "student_memos_update" on student_memos for update using (academy_id = get_my_academy_id());

-- student_tokens: 쓰기는 학원 소속, 읽기는 전체 허용 (토큰값이 사실상 비밀키 역할)
create policy "student_tokens_insert" on student_tokens for insert with check (academy_id = get_my_academy_id());
create policy "student_tokens_select" on student_tokens for select using (true);

-- ============================================================
-- 공유 리포트 RPC 함수 (비로그인 상태에서 토큰으로 데이터 조회)
-- SECURITY DEFINER 로 RLS 우회
-- ============================================================

create or replace function get_student_report(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token        student_tokens;
  v_student      students;
  v_att          json;
  v_scores       json;
  v_memos        json;
  v_classes      json;
  v_past_classes json;
  v_enrolled_ids uuid[];
  v_hist_ids     uuid[];
begin
  select * into v_token from student_tokens where token = p_token;
  if not found then
    return json_build_object('error', 'not_found');
  end if;
  if v_token.expires_at < now() then
    return json_build_object('error', 'expired');
  end if;

  select * into v_student from students where id = v_token.student_id;

  select json_agg(a.*) into v_att
  from attendance a
  where a.student_id = v_token.student_id
    and a.date >= v_token.data_from and a.date <= v_token.data_to;

  select json_agg(ts.* order by ts.date desc) into v_scores
  from test_scores ts
  where ts.student_id = v_token.student_id
    and ts.date >= v_token.data_from and ts.date <= v_token.data_to;

  select json_agg(sm.* order by sm.date desc) into v_memos
  from student_memos sm
  where sm.student_id = v_token.student_id
    and sm.date >= v_token.data_from and sm.date <= v_token.data_to;

  -- 현재 수강 수업
  select array_agg(cs.class_id) into v_enrolled_ids
  from class_students cs where cs.student_id = v_token.student_id;

  select json_agg(c.*) into v_classes
  from classes c where c.id = any(coalesce(v_enrolled_ids, array[]::uuid[]));

  -- 과거 수강 수업 (기간 내 데이터는 있지만 현재 미수강)
  select array_agg(distinct t.class_id) into v_hist_ids
  from (
    select class_id from attendance    where student_id = v_token.student_id and date >= v_token.data_from and date <= v_token.data_to
    union
    select class_id from test_scores   where student_id = v_token.student_id and date >= v_token.data_from and date <= v_token.data_to
    union
    select class_id from student_memos where student_id = v_token.student_id and date >= v_token.data_from and date <= v_token.data_to
  ) t;

  select json_agg(c.*) into v_past_classes
  from classes c
  where c.id = any(coalesce(v_hist_ids, array[]::uuid[]))
    and not (c.id = any(coalesce(v_enrolled_ids, array[]::uuid[])));

  return json_build_object(
    'token',        row_to_json(v_token),
    'student',      row_to_json(v_student),
    'attendance',   coalesce(v_att, '[]'::json),
    'test_scores',  coalesce(v_scores, '[]'::json),
    'memos',        coalesce(v_memos, '[]'::json),
    'classes',      coalesce(v_classes, '[]'::json),
    'past_classes', coalesce(v_past_classes, '[]'::json)
  );
end;
$$;

grant execute on function get_student_report(text) to anon, authenticated;

-- ============================================================
-- 기존 율에듀 데이터 마이그레이션 (아래 주석 해제 후 순서대로 실행)
-- ============================================================

-- 1단계: 율에듀 학원 생성 후 ID 확인
-- insert into academies (name) values ('율에듀') returning id;

-- 2단계: 위 ID를 복사해 아래 '학원_UUID' 자리에 붙여넣고 실행
-- update students       set academy_id = '학원_UUID' where academy_id is null;
-- update classes        set academy_id = '학원_UUID' where academy_id is null;
-- update attendance     set academy_id = '학원_UUID' where academy_id is null;
-- update class_memos    set academy_id = '학원_UUID' where academy_id is null;
-- update test_scores    set academy_id = '학원_UUID' where academy_id is null;
-- update student_memos  set academy_id = '학원_UUID' where academy_id is null;
-- update student_tokens set academy_id = '학원_UUID' where academy_id is null;

-- 3단계: 율에듀 계정 유저 ID 확인 (auth.users 테이블에서 확인)
-- insert into profiles (user_id, academy_id, role) values ('유저_UUID', '학원_UUID', 'owner');
