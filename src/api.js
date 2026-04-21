/**
 * AcademyPM v2 — 데이터 레이어
 * 모든 DB 접근은 이 파일 경유.
 * 페이지 파일에서 supabase 직접 호출 금지.
 */

import { supabase, isOnline } from './lib/supabase.js'

// ========================================
// 샘플 데이터 (오프라인 모드용)
// ========================================

const SAMPLE_STUDENTS = [
  { id: 's1', name: '김민준', grade: '고1', school: '성남고', subjects: ['수학', '영어'], teacher: '현재T', parent_phone: '010-1234-5678', student_phone: '010-9876-5432', status: 'active', gender: '남', notes: '' },
  { id: 's2', name: '이서연', grade: '고2', school: '분당고', subjects: ['수학'], teacher: '현재T', parent_phone: '010-2345-6789', student_phone: '010-8765-4321', status: 'active', gender: '여', notes: '' },
  { id: 's3', name: '박지호', grade: '중3', school: '구암중', subjects: ['국어', '영어', '수학'], teacher: '현재T', parent_phone: '010-3456-7890', student_phone: '010-7654-3210', status: 'inactive', gender: '남', notes: '잠시 휴원' },
  { id: 's4', name: '최유진', grade: '고1', school: '성남고', subjects: ['수학'], teacher: '현재T', parent_phone: '010-4567-8901', student_phone: '010-6543-2109', status: 'active', gender: '여', notes: '' },
  { id: 's5', name: '정하은', grade: '중3', school: '구암중', subjects: ['국어'], teacher: '지현T', parent_phone: '010-5678-9012', student_phone: '010-5432-1098', status: 'active', gender: '여', notes: '' },
]

const SAMPLE_CLASSES = [
  { id: 'c1', name: '고1 수학', subject: '수학', teacher: '현재T', sub_teacher: null, grade: '고1', time: '20-22', days: ['월', '수', '금'], detail_memo: '수학의 정석 2권 진행중. 미적분 단원', is_clinic: false, is_completed: false, students: ['s1', 's4'] },
  { id: 'c2', name: '고2 수학', subject: '수학', teacher: '현재T', sub_teacher: null, grade: '고2', time: '18-20', days: ['화', '목'], detail_memo: '수능 대비 기출 풀이 위주', is_clinic: false, is_completed: false, students: ['s2'] },
  { id: 'c3', name: '중등 국어', subject: '국어', teacher: '지현T', sub_teacher: null, grade: '중3', time: '16-18', days: ['월', '목'], detail_memo: '비문학 독해 강화 훈련', is_clinic: true, is_completed: false, students: ['s3', 's5'] },
]

// 오프라인 모드 인메모리 스토어
let offlineStudents = JSON.parse(JSON.stringify(SAMPLE_STUDENTS))
let offlineClasses = JSON.parse(JSON.stringify(SAMPLE_CLASSES))
let offlineAttendance = []
let offlineClassMemos = []
let offlineTestScores = []
let offlineStudentMemos = []

function genId() {
  return 'off_' + Math.random().toString(36).slice(2, 11)
}

// ========================================
// 헬퍼
// ========================================

function handleError(error, label) {
  console.error(`[api.js] ${label}:`, error)
  throw error
}

// ========================================
// 조회 함수
// ========================================

export async function getStudents() {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(offlineStudents))
  }
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getStudents')
  return data
}

export async function getClasses() {
  if (!isOnline) {
    // 오프라인: students 배열 포함 반환
    const students = await getStudents()
    return offlineClasses.map(cls => ({
      ...cls,
      students: cls.students.map(sid => students.find(s => s.id === sid)).filter(Boolean),
    }))
  }
  const { data, error } = await supabase
    .from('classes')
    .select('*, class_students(student_id, students(*))')
    .order('created_at', { ascending: true })
  if (error) handleError(error, 'getClasses')
  // class_students join 결과를 students 배열로 정리
  return (data || []).map(cls => ({
    ...cls,
    students: (cls.class_students || []).map(cs => cs.students).filter(Boolean),
  }))
}

export async function getAttendance(date, classId = null) {
  if (!isOnline) {
    let rows = offlineAttendance.filter(r => r.date === date)
    if (classId) rows = rows.filter(r => r.class_id === classId)
    return JSON.parse(JSON.stringify(rows))
  }
  let query = supabase.from('attendance').select('*').eq('date', date)
  if (classId) query = query.eq('class_id', classId)
  const { data, error } = await query
  if (error) handleError(error, 'getAttendance')
  return data
}

export async function getClassMemo(date, classId) {
  if (!isOnline) {
    const row = offlineClassMemos.find(r => r.date === date && r.class_id === classId)
    return row ? JSON.parse(JSON.stringify(row)) : null
  }
  const { data, error } = await supabase
    .from('class_memos')
    .select('*')
    .eq('date', date)
    .eq('class_id', classId)
    .maybeSingle()
  if (error) handleError(error, 'getClassMemo')
  return data
}

export async function getTestScores(date, classId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineTestScores.filter(r => r.date === date && r.class_id === classId)
    ))
  }
  const { data, error } = await supabase
    .from('test_scores')
    .select('*')
    .eq('date', date)
    .eq('class_id', classId)
  if (error) handleError(error, 'getTestScores')
  return data
}

export async function getStudentMemos(date = null, classId = null, studentId = null) {
  if (!isOnline) {
    let rows = offlineStudentMemos
    if (date) rows = rows.filter(r => r.date === date)
    if (classId) rows = rows.filter(r => r.class_id === classId)
    if (studentId) rows = rows.filter(r => r.student_id === studentId)
    return JSON.parse(JSON.stringify(rows))
  }
  let query = supabase.from('student_memos').select('*')
  if (date) query = query.eq('date', date)
  if (classId) query = query.eq('class_id', classId)
  if (studentId) query = query.eq('student_id', studentId)
  const { data, error } = await query.order('date', { ascending: false })
  if (error) handleError(error, 'getStudentMemos')
  return data
}

export async function getStudentAttendance(studentId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineAttendance.filter(r => r.student_id === studentId)
        .sort((a, b) => b.date.localeCompare(a.date))
    ))
  }
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getStudentAttendance')
  return data
}

export async function getStudentTestScores(studentId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineTestScores.filter(r => r.student_id === studentId)
        .sort((a, b) => b.date.localeCompare(a.date))
    ))
  }
  const { data, error } = await supabase
    .from('test_scores')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getStudentTestScores')
  return data
}

export async function getAllClassMemos(classId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineClassMemos.filter(r => r.class_id === classId)
        .sort((a, b) => b.date.localeCompare(a.date))
    ))
  }
  const { data, error } = await supabase
    .from('class_memos')
    .select('*')
    .eq('class_id', classId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getAllClassMemos')
  return data
}

export async function getAllClassAttendance(classId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineAttendance.filter(r => r.class_id === classId)
        .sort((a, b) => b.date.localeCompare(a.date))
    ))
  }
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getAllClassAttendance')
  return data
}

export async function getAllClassTestScores(classId) {
  if (!isOnline) {
    return JSON.parse(JSON.stringify(
      offlineTestScores.filter(r => r.class_id === classId)
        .sort((a, b) => b.date.localeCompare(a.date))
    ))
  }
  const { data, error } = await supabase
    .from('test_scores')
    .select('*')
    .eq('class_id', classId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getAllClassTestScores')
  return data
}

// ========================================
// 쓰기 함수
// ========================================

export async function insertRow(sheet, data) {
  if (!isOnline) {
    const row = { ...data, id: genId() }
    if (sheet === 'students') {
      offlineStudents.unshift(row)
    } else if (sheet === 'classes') {
      offlineClasses.push({ ...row, students: [] })
    } else if (sheet === 'class_students') {
      // class_students는 별도 처리
      const cls = offlineClasses.find(c => c.id === data.class_id)
      if (cls && !cls.students.includes(data.student_id)) {
        cls.students.push(data.student_id)
      }
    }
    return row
  }
  const { data: result, error } = await supabase
    .from(sheet)
    .insert(data)
    .select()
    .single()
  if (error) handleError(error, `insertRow(${sheet})`)
  return result
}

export async function updateRow(sheet, id, data) {
  if (!isOnline) {
    if (sheet === 'students') {
      const idx = offlineStudents.findIndex(r => r.id === id)
      if (idx !== -1) offlineStudents[idx] = { ...offlineStudents[idx], ...data }
    } else if (sheet === 'classes') {
      const idx = offlineClasses.findIndex(r => r.id === id)
      if (idx !== -1) offlineClasses[idx] = { ...offlineClasses[idx], ...data }
    }
    return { id, ...data }
  }
  const { data: result, error } = await supabase
    .from(sheet)
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) handleError(error, `updateRow(${sheet})`)
  return result
}

export async function deleteRow(sheet, id) {
  if (!isOnline) {
    if (sheet === 'students') {
      offlineStudents = offlineStudents.filter(r => r.id !== id)
      // class_students 연결도 제거
      offlineClasses.forEach(cls => {
        cls.students = cls.students.filter(sid => sid !== id)
      })
    } else if (sheet === 'classes') {
      offlineClasses = offlineClasses.filter(r => r.id !== id)
    }
    return true
  }
  const { error } = await supabase.from(sheet).delete().eq('id', id)
  if (error) handleError(error, `deleteRow(${sheet})`)
  return true
}

// class_students 특수 처리 (수업에서 학생 추가/제거)
export async function addStudentToClass(classId, studentId) {
  if (!isOnline) {
    const cls = offlineClasses.find(c => c.id === classId)
    if (cls && !cls.students.includes(studentId)) {
      cls.students.push(studentId)
    }
    return true
  }
  const { error } = await supabase
    .from('class_students')
    .insert({ class_id: classId, student_id: studentId })
  if (error) handleError(error, 'addStudentToClass')
  return true
}

export async function removeStudentFromClass(classId, studentId) {
  if (!isOnline) {
    const cls = offlineClasses.find(c => c.id === classId)
    if (cls) {
      cls.students = cls.students.filter(sid => sid !== studentId)
    }
    return true
  }
  const { error } = await supabase
    .from('class_students')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)
  if (error) handleError(error, 'removeStudentFromClass')
  return true
}

export async function syncClassStudents(classId, studentIds) {
  if (!isOnline) {
    const cls = offlineClasses.find(c => c.id === classId)
    if (cls) cls.students = [...studentIds]
    return true
  }
  // 온라인: 기존 전부 삭제 후 재삽입 (class_students만 예외적으로 허용)
  const { error: delErr } = await supabase
    .from('class_students')
    .delete()
    .eq('class_id', classId)
  if (delErr) handleError(delErr, 'syncClassStudents delete')

  if (studentIds.length > 0) {
    const rows = studentIds.map(sid => ({ class_id: classId, student_id: sid }))
    const { error: insErr } = await supabase.from('class_students').insert(rows)
    if (insErr) handleError(insErr, 'syncClassStudents insert')
  }
  return true
}

// ========================================
// upsert 함수
// ========================================

export async function upsertAttendance(date, classId, studentId, data) {
  if (!isOnline) {
    const idx = offlineAttendance.findIndex(
      r => r.date === date && r.class_id === classId && r.student_id === studentId
    )
    if (idx !== -1) {
      offlineAttendance[idx] = { ...offlineAttendance[idx], ...data }
    } else {
      offlineAttendance.push({ id: genId(), date, class_id: classId, student_id: studentId, ...data })
    }
    return true
  }
  const { error } = await supabase
    .from('attendance')
    .upsert(
      { date, class_id: classId, student_id: studentId, ...data },
      { onConflict: 'date,class_id,student_id' }
    )
  if (error) handleError(error, 'upsertAttendance')
  return true
}

export async function upsertClassMemo(date, classId, memo) {
  if (!isOnline) {
    const idx = offlineClassMemos.findIndex(r => r.date === date && r.class_id === classId)
    if (idx !== -1) {
      offlineClassMemos[idx].memo = memo
    } else {
      offlineClassMemos.push({ id: genId(), date, class_id: classId, memo })
    }
    return true
  }
  const { error } = await supabase
    .from('class_memos')
    .upsert(
      { date, class_id: classId, memo },
      { onConflict: 'date,class_id' }
    )
  if (error) handleError(error, 'upsertClassMemo')
  return true
}

export async function upsertTestScore(date, classId, studentId, score, testName = null, testSlot = 0) {
  if (!isOnline) {
    const idx = offlineTestScores.findIndex(
      r => r.date === date && r.class_id === classId && r.student_id === studentId && (r.test_slot ?? 0) === testSlot
    )
    if (idx !== -1) {
      offlineTestScores[idx].score = score
      offlineTestScores[idx].test_name = testName
    } else {
      offlineTestScores.push({ id: genId(), date, class_id: classId, student_id: studentId, score, test_name: testName, test_slot: testSlot })
    }
    return true
  }
  const { error } = await supabase
    .from('test_scores')
    .upsert(
      { date, class_id: classId, student_id: studentId, score, test_name: testName, test_slot: testSlot },
      { onConflict: 'date,class_id,student_id,test_slot' }
    )
  if (error) handleError(error, 'upsertTestScore')
  return true
}

// ========================================
// 학생 토큰 (공유 링크)
// ========================================

export async function upsertStudentToken(studentId, token, expiresAt, dataFrom, dataTo) {
  if (!isOnline) return { token }
  const { error } = await supabase
    .from('student_tokens')
    .insert({ student_id: studentId, token, expires_at: expiresAt, data_from: dataFrom, data_to: dataTo })
  if (error) handleError(error, 'upsertStudentToken')
  return { token }
}

export async function getStudentToken(token) {
  if (!isOnline) return null
  const { data, error } = await supabase
    .from('student_tokens')
    .select('*, students(*)')
    .eq('token', token)
    .maybeSingle()
  if (error) handleError(error, 'getStudentToken')
  return data
}

export async function getStudentReportData(studentId, dataFrom, dataTo) {
  if (!isOnline) return { attendance: [], testScores: [], memos: [], classes: [], pastClasses: [] }
  const [attRes, scoreRes, memoRes, classRes] = await Promise.all([
    supabase.from('attendance').select('*')
      .eq('student_id', studentId)
      .gte('date', dataFrom).lte('date', dataTo),
    supabase.from('test_scores').select('*')
      .eq('student_id', studentId)
      .gte('date', dataFrom).lte('date', dataTo)
      .order('date', { ascending: false }),
    supabase.from('student_memos').select('*')
      .eq('student_id', studentId)
      .gte('date', dataFrom).lte('date', dataTo)
      .order('date', { ascending: false }),
    supabase.from('classes')
      .select('*, class_students!inner(student_id)')
      .eq('class_students.student_id', studentId),
  ])
  if (attRes.error) handleError(attRes.error, 'getStudentReportData/attendance')
  if (scoreRes.error) handleError(scoreRes.error, 'getStudentReportData/scores')
  if (memoRes.error) handleError(memoRes.error, 'getStudentReportData/memos')
  if (classRes.error) handleError(classRes.error, 'getStudentReportData/classes')

  // 현재 미수강이지만 기간 내 데이터가 있는 이전 수업
  const enrolledIds = new Set((classRes.data || []).map(c => c.id))
  const historicalIds = new Set([
    ...(attRes.data || []).map(r => r.class_id),
    ...(scoreRes.data || []).map(r => r.class_id),
    ...(memoRes.data || []).map(r => r.class_id),
  ])
  const pastIds = [...historicalIds].filter(id => !enrolledIds.has(id))

  let pastClasses = []
  if (pastIds.length > 0) {
    const { data: pastData, error: pastErr } = await supabase
      .from('classes').select('*').in('id', pastIds)
    if (pastErr) handleError(pastErr, 'getStudentReportData/pastClasses')
    pastClasses = pastData || []
  }

  return {
    attendance: attRes.data || [],
    testScores: scoreRes.data || [],
    memos: memoRes.data || [],
    classes: classRes.data || [],
    pastClasses,
  }
}

export async function upsertStudentMemo(date, classId, studentId, memo) {
  if (!isOnline) {
    const idx = offlineStudentMemos.findIndex(
      r => r.date === date && r.class_id === classId && r.student_id === studentId
    )
    if (idx !== -1) {
      offlineStudentMemos[idx].memo = memo
    } else {
      offlineStudentMemos.push({ id: genId(), date, class_id: classId, student_id: studentId, memo })
    }
    return true
  }
  const { error } = await supabase
    .from('student_memos')
    .upsert(
      { date, class_id: classId, student_id: studentId, memo },
      { onConflict: 'date,class_id,student_id' }
    )
  if (error) handleError(error, 'upsertStudentMemo')
  return true
}
