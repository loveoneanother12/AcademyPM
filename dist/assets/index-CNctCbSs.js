(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const Ct=[{id:"s1",name:"김민준",grade:"고1",school:"성남고",subjects:"수학,영어",teacher:"현재T",parent_phone:"010-1234-5678",student_phone:"010-9876-5432",status:"active",gender:"남",notes:""},{id:"s2",name:"이서연",grade:"고2",school:"분당고",subjects:"수학",teacher:"현재T",parent_phone:"010-2345-6789",student_phone:"010-8765-4321",status:"active",gender:"여",notes:""},{id:"s3",name:"박지호",grade:"중3",school:"구암중",subjects:"국어,영어,수학",teacher:"현재T",parent_phone:"010-3456-7890",student_phone:"010-7654-3210",status:"inactive",gender:"남",notes:"잠시 휴원"},{id:"s4",name:"최유진",grade:"고1",school:"성남고",subjects:"수학",teacher:"현재T",parent_phone:"010-4567-8901",student_phone:"010-6543-2109",status:"active",gender:"여",notes:""},{id:"s5",name:"정하은",grade:"중3",school:"구암중",subjects:"국어",teacher:"지현T",parent_phone:"010-5678-9012",student_phone:"010-5432-1098",status:"active",gender:"여",notes:""}],It=[{id:"c1",name:"고1 수학",subject:"수학",teacher:"현재T",grade:"고1",time:"20-22",days:"월,수,금",detail_memo:"수학의 정석 2권 진행중. 미적분 단원",students:["s1","s4"]},{id:"c2",name:"고2 수학",subject:"수학",teacher:"현재T",grade:"고2",time:"18-20",days:"화,목",detail_memo:"수능 대비 기출 풀이 위주",students:["s2"]},{id:"c3",name:"중등 국어",subject:"국어",teacher:"지현T",grade:"중3",time:"16-18",days:"월,목",detail_memo:"비문학 독해 강화 훈련",students:["s3","s5"]}];let L=JSON.parse(JSON.stringify(Ct)),h=JSON.parse(JSON.stringify(It)),D=[],B=[],C=[];function O(){return"off_"+Math.random().toString(36).slice(2,11)}async function H(){return JSON.parse(JSON.stringify(L))}async function W(){{const t=await H();return h.map(e=>({...e,students:e.students.map(s=>t.find(a=>a.id===s)).filter(Boolean)}))}}async function U(t,e=null){{let s=D.filter(a=>a.date===t);return e&&(s=s.filter(a=>a.class_id===e)),JSON.parse(JSON.stringify(s))}}async function ut(t,e){{const s=B.find(a=>a.date===t&&a.class_id===e);return s?JSON.parse(JSON.stringify(s)):null}}async function vt(t,e){return JSON.parse(JSON.stringify(C.filter(s=>s.date===t&&s.class_id===e)))}async function _t(t){return JSON.parse(JSON.stringify(D.filter(e=>e.student_id===t).sort((e,s)=>s.date.localeCompare(e.date))))}async function Mt(t){return JSON.parse(JSON.stringify(C.filter(e=>e.student_id===t).sort((e,s)=>s.date.localeCompare(e.date))))}async function Tt(t){return JSON.parse(JSON.stringify(B.filter(e=>e.class_id===t).sort((e,s)=>s.date.localeCompare(e.date))))}async function pt(t,e){{const s={...e,id:O()};if(t==="students")L.unshift(s);else if(t==="classes")h.push({...s,students:[]});else if(t==="class_students"){const a=h.find(n=>n.id===e.class_id);a&&!a.students.includes(e.student_id)&&a.students.push(e.student_id)}return s}}async function mt(t,e,s){{if(t==="students"){const a=L.findIndex(n=>n.id===e);a!==-1&&(L[a]={...L[a],...s})}else if(t==="classes"){const a=h.findIndex(n=>n.id===e);a!==-1&&(h[a]={...h[a],...s})}return{id:e,...s}}}async function ft(t,e){return t==="students"?(L=L.filter(s=>s.id!==e),h.forEach(s=>{s.students=s.students.filter(a=>a!==e)})):t==="classes"&&(h=h.filter(s=>s.id!==e)),!0}async function ot(t,e){{const s=h.find(a=>a.id===t);return s&&(s.students=[...e]),!0}}async function it(t,e,s,a){{const n=D.findIndex(o=>o.date===t&&o.class_id===e&&o.student_id===s);return n!==-1?D[n]={...D[n],...a}:D.push({id:O(),date:t,class_id:e,student_id:s,...a}),!0}}async function At(t,e,s){{const a=B.findIndex(n=>n.date===t&&n.class_id===e);return a!==-1?B[a].memo=s:B.push({id:O(),date:t,class_id:e,memo:s}),!0}}async function qt(t,e,s,a){{const n=C.findIndex(o=>o.date===t&&o.class_id===e&&o.student_id===s);return n!==-1?C[n].score=a:C.push({id:O(),date:t,class_id:e,student_id:s,score:a}),!0}}let T=null;function k(t,e=null){const s=document.getElementById("modal-overlay"),a=document.getElementById("modal-content");!s||!a||(a.innerHTML=t,s.classList.remove("hidden"),s.classList.add("visible"),T=e,s.onclick=n=>{n.target===s&&$()})}function $(){const t=document.getElementById("modal-overlay");t&&(t.classList.remove("visible"),t.classList.add("hidden"),typeof T=="function"&&(T(),T=null))}function f(t,e="info"){const s=document.getElementById("toast-container");if(!s)return;const a=document.createElement("div");a.className=`toast ${e}`,a.textContent=t,s.appendChild(a),setTimeout(()=>{a.classList.add("fade-out"),a.addEventListener("animationend",()=>a.remove(),{once:!0})},2200)}let Y=[],I="";const Nt=["수학","영어","국어","과학"],Pt=["초1","초2","초3","초4","초5","초6","중1","중2","중3","고1","고2","고3"];async function zt(t){t.innerHTML=`
    <div class="search-wrap">
      <input class="search-input" id="student-search" type="text" placeholder="이름 또는 학교 검색..." value="${I}" />
    </div>
    <div id="students-list-wrap" class="page-wrap">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    <div class="offline-banner">오프라인 모드 — 샘플 데이터</div>
  `,document.getElementById("header-actions").innerHTML="";let e=document.querySelector(".fab");e||(e=document.createElement("button"),e.className="fab",e.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',document.body.appendChild(e)),e.onclick=()=>Rt(),t.querySelector("#student-search").addEventListener("input",s=>{I=s.target.value.toLowerCase(),gt()}),await V()}async function V(){Y=await H(),gt()}function gt(){const t=document.getElementById("students-list-wrap");if(!t)return;const e=Y.filter(s=>s.name.toLowerCase().includes(I)||(s.school||"").toLowerCase().includes(I));if(e.length===0){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <div class="empty-state-text">${I?"검색 결과가 없습니다":"등록된 학생이 없습니다"}</div>
        <div class="empty-state-sub">+ 버튼으로 학생을 추가하세요</div>
      </div>
    `;return}t.innerHTML=`<div class="card-list">${e.map(s=>Ot(s)).join("")}</div>`,t.querySelectorAll(".card[data-student-id]").forEach(s=>{s.addEventListener("click",()=>{const a=Y.find(n=>n.id===s.dataset.studentId);a&&Ht(a)})})}function Ot(t){const e=t.status==="inactive"?"inactive":t.gender==="남"?"male":"female",s=t.name.charAt(0),a=(t.subjects||"").split(",").filter(Boolean);return`
    <div class="card student-card" data-student-id="${t.id}">
      <div class="student-avatar ${e}">${s}</div>
      <div class="student-info">
        <div class="student-name-row">
          <span class="student-name">${t.name}</span>
          ${t.gender?`<span class="badge ${t.gender==="남"?"badge-male":"badge-female"}">${t.gender}</span>`:""}
          ${t.status==="inactive"?'<span class="badge badge-inactive">휴원</span>':""}
        </div>
        <div class="student-meta">${t.grade||""} ${t.school?"· "+t.school:""}</div>
        <div class="student-tags">
          ${a.map(n=>`<span class="subject-tag ${n}">${n}</span>`).join("")}
        </div>
      </div>
    </div>
  `}async function Ht(t){const[e,s]=await Promise.all([_t(t.id),Mt(t.id)]),a=new Date().toLocaleDateString("sv-KR"),n=(()=>{const u=new Date;return u.setDate(u.getDate()-28),u.toLocaleDateString("sv-KR")})(),o=e.filter(u=>u.date>=n&&u.date<=a),i=o.filter(u=>u.status==="present").length,l=o.filter(u=>u.status==="late").length,c=o.filter(u=>u.status==="absent").length,d=o.length>0?Math.round(o.reduce((u,y)=>u+(y.homework_pct||0),0)/o.length):0,r=s.slice(0,8).reverse(),p=(t.subjects||"").split(",").filter(Boolean);k(`
    <h2 class="modal-title">학생 상세</h2>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <div class="student-avatar ${t.status==="inactive"?"inactive":t.gender==="남"?"male":"female"}" style="width:52px;height:52px;border-radius:16px;font-size:20px">
        ${t.name.charAt(0)}
      </div>
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px">${t.name}</div>
        <div style="font-size:13px;color:var(--text2)">${t.grade||""} ${t.school?"· "+t.school:""}</div>
        <div style="display:flex;gap:4px;margin-top:4px">
          ${p.map(u=>`<span class="subject-tag ${u}">${u}</span>`).join("")}
        </div>
      </div>
    </div>

    <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">최근 4주 출석</div>
    <div class="detail-stat-grid">
      <div class="detail-stat-box">
        <div class="detail-stat-value" style="color:var(--green)">${i}</div>
        <div class="detail-stat-label">출석</div>
      </div>
      <div class="detail-stat-box">
        <div class="detail-stat-value" style="color:var(--yellow)">${l}</div>
        <div class="detail-stat-label">지각</div>
      </div>
      <div class="detail-stat-box">
        <div class="detail-stat-value" style="color:var(--red)">${c}</div>
        <div class="detail-stat-label">결석</div>
      </div>
    </div>
    <div class="detail-stat-box" style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;padding:10px 14px">
      <span style="font-size:13px;color:var(--text2)">평균 과제 완성도</span>
      <span style="font-size:18px;font-weight:700;font-family:'DM Mono',monospace;color:${d>=80?"var(--green)":d>=50?"var(--yellow)":"var(--red)"}">${d}%</span>
    </div>

    ${r.length>0?`
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">최근 테스트 점수</div>
      <div class="score-chart">
        ${r.map(u=>{const y=u.score,j=y>=90?"var(--green)":y>=75?"var(--accent2)":y>=60?"var(--yellow)":"var(--red)";return`
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div class="score-bar-fill" style="height:${y}%;background:${j}"></div>
              </div>
              <div class="score-bar-label">${y}</div>
            </div>
          `}).join("")}
      </div>
      <div style="font-size:11px;color:var(--text3);text-align:center;margin-bottom:16px">최근 ${r.length}회 테스트</div>
    `:""}

    <div class="section-divider"></div>

    <div class="form-group">
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">연락처</div>
      <div style="font-size:13px;color:var(--text);font-family:'DM Mono',monospace">${t.parent_phone||"-"} (학부모)</div>
      <div style="font-size:13px;color:var(--text);font-family:'DM Mono',monospace;margin-top:2px">${t.student_phone||"-"} (학생)</div>
    </div>

    ${t.notes?`
      <div class="form-group">
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">비고</div>
        <div style="font-size:13px;color:var(--text2)">${t.notes}</div>
      </div>
    `:""}

    <div class="detail-action-row">
      <button class="btn btn-secondary" id="detail-edit-btn">수정</button>
      <button class="btn btn-danger" id="detail-delete-btn">삭제</button>
    </div>
  `),document.getElementById("detail-edit-btn").onclick=()=>Jt(t),document.getElementById("detail-delete-btn").onclick=()=>Kt(t)}function Rt(){k(yt("add"),null),bt("add",null)}function Jt(t){k(yt("edit",t),null),bt("edit",t)}function yt(t,e=null){const s=e||{},a=(s.subjects||"").split(",").filter(Boolean);return`
    <h2 class="modal-title">${t==="add"?"학생 추가":"학생 수정"}</h2>
    <div class="form-group">
      <label class="form-label">이름 *</label>
      <input class="form-input" id="sf-name" type="text" placeholder="이름" value="${s.name||""}" />
    </div>
    <div class="form-group">
      <label class="form-label">성별</label>
      <div class="gender-selector">
        <button class="gender-btn ${s.gender==="남"?"selected":""}" data-gender="남">남학생</button>
        <button class="gender-btn ${s.gender==="여"?"selected":""}" data-gender="여">여학생</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">학년</label>
        <select class="form-select" id="sf-grade">
          <option value="">선택</option>
          ${Pt.map(n=>`<option value="${n}" ${s.grade===n?"selected":""}>${n}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">학교</label>
        <input class="form-input" id="sf-school" type="text" placeholder="학교명" value="${s.school||""}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수강 과목</label>
      <div class="subject-selector" id="sf-subjects">
        ${Nt.map(n=>`
          <button class="subject-toggle ${a.includes(n)?"selected":""}" data-subject="${n}">${n}</button>
        `).join("")}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">담당 선생님</label>
      <input class="form-input" id="sf-teacher" type="text" placeholder="선생님 이름" value="${s.teacher||""}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">학부모 연락처</label>
        <input class="form-input" id="sf-parent-phone" type="tel" placeholder="010-0000-0000" value="${s.parent_phone||""}" />
      </div>
      <div class="form-group">
        <label class="form-label">학생 연락처</label>
        <input class="form-input" id="sf-student-phone" type="tel" placeholder="010-0000-0000" value="${s.student_phone||""}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">상태</label>
      <select class="form-select" id="sf-status">
        <option value="active" ${(s.status||"active")==="active"?"selected":""}>재원중</option>
        <option value="inactive" ${s.status==="inactive"?"selected":""}>휴원</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">비고</label>
      <textarea class="form-textarea" id="sf-notes" placeholder="메모...">${s.notes||""}</textarea>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="sf-cancel">취소</button>
      <button class="btn btn-primary" id="sf-submit">${t==="add"?"추가":"저장"}</button>
    </div>
  `}function bt(t,e){let s=(e==null?void 0:e.gender)||"";document.querySelectorAll(".gender-btn").forEach(a=>{a.onclick=()=>{s=a.dataset.gender,document.querySelectorAll(".gender-btn").forEach(n=>n.classList.remove("selected")),a.classList.add("selected")}}),document.querySelectorAll(".subject-toggle").forEach(a=>{a.onclick=()=>a.classList.toggle("selected")}),document.getElementById("sf-cancel").onclick=$,document.getElementById("sf-submit").onclick=async()=>{const a=document.getElementById("sf-name").value.trim();if(!a){f("이름을 입력하세요","error");return}const n=[...document.querySelectorAll(".subject-toggle.selected")].map(l=>l.dataset.subject).join(","),o={name:a,gender:s,grade:document.getElementById("sf-grade").value,school:document.getElementById("sf-school").value.trim(),subjects:n,teacher:document.getElementById("sf-teacher").value.trim(),parent_phone:document.getElementById("sf-parent-phone").value.trim(),student_phone:document.getElementById("sf-student-phone").value.trim(),status:document.getElementById("sf-status").value,notes:document.getElementById("sf-notes").value.trim()},i=document.getElementById("sf-submit");i.disabled=!0,i.textContent="저장 중...";try{t==="add"?(await pt("students",o),f("학생이 추가되었습니다","success")):(await mt("students",e.id,o),f("저장되었습니다","success")),$(),await V()}catch(l){f("저장 실패: "+l.message,"error"),i.disabled=!1,i.textContent=t==="add"?"추가":"저장"}}}async function Kt(t){k(`
    <h2 class="modal-title">학생 삭제</h2>
    <p style="font-size:14px;color:var(--text2);margin-bottom:20px;line-height:1.6">
      <strong style="color:var(--text)">${t.name}</strong> 학생을 삭제하시겠습니까?<br>
      관련 출결 기록도 모두 삭제됩니다.
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="del-cancel">취소</button>
      <button class="btn btn-danger" id="del-confirm">삭제</button>
    </div>
  `),document.getElementById("del-cancel").onclick=$,document.getElementById("del-confirm").onclick=async()=>{try{await ft("students",t.id),f("삭제되었습니다","success"),$(),await V()}catch(e){f("삭제 실패: "+e.message,"error")}}}let A=[],Q=[];const Ft=["수학","영어","국어","과학"],Yt=["초1","초2","초3","초4","초5","초6","중1","중2","중3","고1","고2","고3"],X=["월","화","수","목","금","토","일"];async function Gt(t){t.innerHTML=`
    <div id="classes-list-wrap" class="page-wrap">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    <div class="offline-banner">오프라인 모드 — 샘플 데이터</div>
  `;let e=document.querySelector(".fab");e||(e=document.createElement("button"),e.className="fab",e.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',document.body.appendChild(e)),e.onclick=()=>Qt(),await Z()}async function Z(){[A,Q]=await Promise.all([W(),H()]),Wt()}function Wt(){const t=document.getElementById("classes-list-wrap");if(t){if(A.length===0){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">등록된 수업이 없습니다</div>
        <div class="empty-state-sub">+ 버튼으로 수업을 추가하세요</div>
      </div>
    `;return}t.innerHTML=`<div class="card-list">${A.map(e=>Ut(e)).join("")}</div>`,t.querySelectorAll(".card[data-class-id]").forEach(e=>{e.addEventListener("click",()=>{const s=A.find(a=>a.id===e.dataset.classId);s&&Vt(s)})})}}function Ut(t){const e=t.students||[],s=(t.days||"").split(",").filter(Boolean);return`
    <div class="card" data-class-id="${t.id}">
      <div class="class-card-header">
        <div>
          <div class="class-card-name">${t.name}</div>
          <div class="class-card-meta">${t.teacher?t.teacher+" · ":""}${t.grade||""}</div>
        </div>
        <span class="subject-tag ${t.subject||""}">${t.subject||""}</span>
      </div>
      <div class="class-card-footer">
        <div class="class-card-days">
          ${X.map(a=>`<span class="day-chip ${s.includes(a)?"active":""}">${a}</span>`).join("")}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="time-badge">${t.time||"-"}</span>
          <span class="count-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${e.length}명
          </span>
        </div>
      </div>
    </div>
  `}async function Vt(t){const e=await Tt(t.id),s=t.students||[],a=(t.days||"").split(",").filter(Boolean);k(`
    <h2 class="modal-title">수업 상세</h2>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px">${t.name}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="subject-tag ${t.subject||""}">${t.subject||""}</span>
          <span class="time-badge">${t.time||"-"}</span>
          <span style="font-size:12px;color:var(--text2)">${t.teacher||""}</span>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:4px;margin-bottom:16px">
      ${X.map(n=>`<span class="day-chip ${a.includes(n)?"active":""}">${n}</span>`).join("")}
    </div>

    ${t.detail_memo?`
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">수업 메모</div>
      <div class="results-memo-box" style="margin-bottom:16px">${t.detail_memo}</div>
    `:""}

    <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
      수강생 (${s.length}명)
    </div>
    <div class="class-detail-students">
      ${s.length===0?'<div style="font-size:13px;color:var(--text3);padding:8px 0">수강생이 없습니다</div>':s.map(n=>{const o=typeof n=="object"?n:Q.find(l=>l.id===n);return o?`
            <div class="class-detail-student-row">
              <div class="student-avatar ${o.gender==="남"?"male":"female"}" style="width:34px;height:34px;border-radius:10px;font-size:13px">${o.name.charAt(0)}</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text)">${o.name}</div>
                <div style="font-size:11px;color:var(--text3)">${o.grade||""} ${o.school?"· "+o.school:""}</div>
              </div>
            </div>
          `:""}).join("")}
    </div>

    ${e.length>0?`
      <div class="section-divider"></div>
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">최근 수업 일지</div>
      <div class="memo-history-list">
        ${e.slice(0,5).map(n=>`
          <div class="memo-history-item">
            <div class="memo-history-date">${n.date}</div>
            <div class="memo-history-text">${n.memo}</div>
          </div>
        `).join("")}
      </div>
    `:""}

    <div class="detail-action-row">
      <button class="btn btn-secondary" id="cls-edit-btn">수정</button>
      <button class="btn btn-danger" id="cls-delete-btn">삭제</button>
    </div>
  `),document.getElementById("cls-edit-btn").onclick=()=>Xt(t),document.getElementById("cls-delete-btn").onclick=()=>Zt(t)}function Qt(){k(ht("add",null),null),$t("add",null)}function Xt(t){k(ht("edit",t),null),$t("edit",t)}function ht(t,e=null){const s=e||{},a=(s.days||"").split(",").filter(Boolean),n=(s.students||[]).map(o=>typeof o=="object"?o.id:o);return`
    <h2 class="modal-title">${t==="add"?"수업 추가":"수업 수정"}</h2>
    <div class="form-group">
      <label class="form-label">수업명 *</label>
      <input class="form-input" id="cf-name" type="text" placeholder="수업명" value="${s.name||""}" />
    </div>
    <div class="form-group">
      <label class="form-label">과목</label>
      <div class="subject-selector" id="cf-subjects">
        ${Ft.map(o=>`
          <button class="subject-toggle ${s.subject===o?"selected":""}" data-subject="${o}">${o}</button>
        `).join("")}
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">담당 강사</label>
        <input class="form-input" id="cf-teacher" type="text" placeholder="강사명" value="${s.teacher||""}" />
      </div>
      <div class="form-group">
        <label class="form-label">대상 학년</label>
        <select class="form-select" id="cf-grade">
          <option value="">선택</option>
          ${Yt.map(o=>`<option value="${o}" ${s.grade===o?"selected":""}>${o}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">수업 시간</label>
        <input class="form-input" id="cf-time" type="text" placeholder="예: 20-22" value="${s.time||""}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수업 요일</label>
      <div class="days-selector" id="cf-days">
        ${X.map(o=>`
          <button class="day-toggle ${a.includes(o)?"selected":""}" data-day="${o}">${o}</button>
        `).join("")}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">수업 상세 메모 (교재, 진도 등)</label>
      <textarea class="form-textarea" id="cf-detail-memo" placeholder="교재명, 현재 진도, 특이사항...">${s.detail_memo||""}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">수강생</label>
      <div class="student-checklist" id="cf-students">
        ${Q.filter(o=>o.status==="active").map(o=>`
          <label class="student-check-item">
            <input type="checkbox" value="${o.id}" ${n.includes(o.id)?"checked":""} />
            <div>
              <div class="student-check-name">${o.name}</div>
              <div class="student-check-meta">${o.grade||""} ${o.school?"· "+o.school:""}</div>
            </div>
          </label>
        `).join("")}
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cf-cancel">취소</button>
      <button class="btn btn-primary" id="cf-submit">${t==="add"?"추가":"저장"}</button>
    </div>
  `}function $t(t,e){document.querySelectorAll("#cf-subjects .subject-toggle").forEach(s=>{s.onclick=()=>{document.querySelectorAll("#cf-subjects .subject-toggle").forEach(a=>a.classList.remove("selected")),s.classList.add("selected")}}),document.querySelectorAll("#cf-days .day-toggle").forEach(s=>{s.onclick=()=>s.classList.toggle("selected")}),document.getElementById("cf-cancel").onclick=$,document.getElementById("cf-submit").onclick=async()=>{var c;const s=document.getElementById("cf-name").value.trim();if(!s){f("수업명을 입력하세요","error");return}const a=((c=document.querySelector("#cf-subjects .subject-toggle.selected"))==null?void 0:c.dataset.subject)||"",n=[...document.querySelectorAll("#cf-days .day-toggle.selected")].map(d=>d.dataset.day).join(","),o=[...document.querySelectorAll("#cf-students input[type=checkbox]:checked")].map(d=>d.value),i={name:s,subject:a,teacher:document.getElementById("cf-teacher").value.trim(),grade:document.getElementById("cf-grade").value,time:document.getElementById("cf-time").value.trim(),days:n,detail_memo:document.getElementById("cf-detail-memo").value.trim()},l=document.getElementById("cf-submit");l.disabled=!0,l.textContent="저장 중...";try{if(t==="add"){const d=await pt("classes",i);await ot(d.id,o),f("수업이 추가되었습니다","success")}else await mt("classes",e.id,i),await ot(e.id,o),f("저장되었습니다","success");$(),await Z()}catch(d){f("저장 실패: "+d.message,"error"),l.disabled=!1,l.textContent=t==="add"?"추가":"저장"}}}async function Zt(t){k(`
    <h2 class="modal-title">수업 삭제</h2>
    <p style="font-size:14px;color:var(--text2);margin-bottom:20px;line-height:1.6">
      <strong style="color:var(--text)">${t.name}</strong> 수업을 삭제하시겠습니까?<br>
      관련 출결/메모/점수 기록도 모두 삭제됩니다.
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="del-cancel">취소</button>
      <button class="btn btn-danger" id="del-confirm">삭제</button>
    </div>
  `),document.getElementById("del-cancel").onclick=$,document.getElementById("del-confirm").onclick=async()=>{try{await ft("classes",t.id),f("삭제되었습니다","success"),$(),await Z()}catch(e){f("삭제 실패: "+e.message,"error")}}}let m=new Date().toLocaleDateString("sv-KR"),_=[],g={},M={},E={},q=!1;const xt=["일","월","화","수","목","금","토"];async function te(t){t.innerHTML=`
    <div class="attendance-header">
      <div class="date-nav">
        <button class="date-nav-btn" id="att-prev-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="date-display" id="att-date-display">
          <span class="date-display-main" id="att-date-main"></span>
          <span class="date-display-sub" id="att-date-sub"></span>
        </div>
        <button class="date-nav-btn" id="att-next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="week-strip" id="att-week-strip"></div>
    </div>
    <div id="att-accordion-list" class="accordion-list">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    <div class="offline-banner" style="margin:0 16px 8px">오프라인 모드 — 샘플 데이터</div>
  `;const e=document.querySelector(".fab");e&&e.remove(),document.getElementById("att-prev-btn").onclick=()=>lt(-1),document.getElementById("att-next-btn").onclick=()=>lt(1),document.getElementById("att-date-display").onclick=()=>ce(),R(),J(),await K()}function R(){const t=new Date(m+"T00:00:00"),e=document.getElementById("att-date-main"),s=document.getElementById("att-date-sub");if(!e)return;const a=t.getMonth()+1,n=t.getDate(),o=xt[t.getDay()],i=new Date().toLocaleDateString("sv-KR");e.textContent=`${m.slice(0,4)}. ${String(a).padStart(2,"0")}. ${String(n).padStart(2,"0")}`,s.textContent=`${o}요일${m===i?" · 오늘":""}`}function J(){const t=document.getElementById("att-week-strip");if(!t)return;const e=new Date().toLocaleDateString("sv-KR"),s=new Date(m+"T00:00:00"),a=s.getDay(),n=new Date(s);n.setDate(s.getDate()-(a===0?6:a-1));const o=[];for(let i=0;i<7;i++){const l=new Date(n);l.setDate(n.getDate()+i),o.push(l)}t.innerHTML=o.map(i=>{const l=i.toLocaleDateString("sv-KR"),c=l===m,d=l===e,r=xt[i.getDay()],p=i.getDate();return`
      <div class="week-day ${c?"active":""} ${d?"today":""}" data-date="${l}">
        <span class="week-day-label">${r}</span>
        <span class="week-day-num">${p}</span>
        <span class="week-day-dot" id="dot-${l}"></span>
      </div>
    `}).join(""),t.querySelectorAll(".week-day").forEach(i=>{i.onclick=()=>{m=i.dataset.date,R(),J(),K()}}),ee(o.map(i=>i.toLocaleDateString("sv-KR")))}async function ee(t){for(const e of t){const s=await U(e),a=document.getElementById("dot-"+e);a&&s&&s.length>0&&a.classList.add("has-data")}}function lt(t){const e=new Date(m+"T00:00:00");e.setDate(e.getDate()+t),m=e.toLocaleDateString("sv-KR"),R(),J(),K()}async function K(){g={},M={},E={},_=await W(),(await U(m)).forEach(e=>{g[e.class_id]||(g[e.class_id]={}),g[e.class_id][e.student_id]={status:e.status,homework_pct:e.homework_pct||0}}),se()}function se(){const t=document.getElementById("att-accordion-list");if(t){if(_.length===0){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">등록된 수업이 없습니다</div>
        <div class="empty-state-sub">수업 탭에서 수업을 추가하세요</div>
      </div>
    `;return}t.innerHTML=_.map(e=>ae(e)).join(""),t.querySelectorAll(".accordion-header").forEach(e=>{e.onclick=()=>oe(e.closest(".accordion-item"))}),_.forEach(e=>{le(e)})}}function wt(t,e){const s=g[t]||{};let a=0,n=0,o=0;return e.forEach(i=>{var d;const l=typeof i=="object"?i.id:i,c=(d=s[l])==null?void 0:d.status;c==="present"?a++:c==="late"?n++:c==="absent"&&o++}),{present:a,late:n,absent:o}}function ae(t){const e=t.students||[],{present:s,late:a,absent:n}=wt(t.id,e),o=!!M[t.id];return`
    <div class="accordion-item" data-class-id="${t.id}">
      <div class="accordion-header">
        <div class="accordion-title-group">
          <div class="accordion-class-name">${t.name}</div>
          <div class="accordion-class-meta">${t.teacher||""} ${t.time?"· "+t.time:""}</div>
        </div>
        <div class="accordion-right">
          <span class="subject-tag ${t.subject||""}" style="font-size:10px">${t.subject||""}</span>
          <div class="attendance-summary-pill">
            <span class="att-present">${s}출</span>
            <span style="color:var(--border)">|</span>
            <span class="att-late">${a}지</span>
            <span style="color:var(--border)">|</span>
            <span class="att-absent">${n}결</span>
          </div>
          <div class="accordion-chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          <!-- 패널 탭 버튼 -->
          <div class="panel-tabs">
            <button class="panel-tab-btn" data-panel="memo">
              📝 수업 메모
              <span class="memo-saved-indicator" id="memo-ind-${t.id}" style="${o?"":"display:none"}">✦</span>
            </button>
            <button class="panel-tab-btn" data-panel="test">📊 테스트 결과</button>
          </div>

          <!-- 수업 메모 패널 -->
          <div class="panel" id="panel-memo-${t.id}">
            <textarea class="panel-textarea" id="memo-ta-${t.id}" placeholder="오늘 수업 메모를 입력하세요...">${M[t.id]||""}</textarea>
            <div class="panel-save-row">
              <button class="btn btn-primary btn-sm" id="memo-save-${t.id}">저장</button>
            </div>
          </div>

          <!-- 테스트 결과 패널 -->
          <div class="panel" id="panel-test-${t.id}">
            ${e.length===0?'<div style="font-size:13px;color:var(--text3);padding:4px 0">수강생이 없습니다</div>':e.map(i=>{var p;const l=typeof i=="object"?i.id:i,c=typeof i=="object"?i:{name:"?"},d=((p=E[t.id])==null?void 0:p[l])??"",r=tt(d);return`
                  <div class="test-student-row">
                    <div class="test-student-name">${c.name}</div>
                    <input class="test-score-input" type="number" min="0" max="100"
                      placeholder="점수" value="${d!==""?d:""}"
                      id="score-${t.id}-${l}" data-class-id="${t.id}" data-student-id="${l}" />
                    <div class="score-grade ${r}" id="grade-${t.id}-${l}">${r}</div>
                  </div>
                `}).join("")}
          </div>

          <!-- 학생 출결 행 -->
          <div id="student-rows-${t.id}">
            ${ne(t)}
          </div>
        </div>
      </div>
    </div>
  `}function ne(t){const e=t.students||[];return e.length===0?'<div style="font-size:13px;color:var(--text3);padding:8px 0">수강생이 없습니다</div>':e.map(s=>{var r;const a=typeof s=="object"?s.id:s,n=typeof s=="object"?s:{name:"?",gender:"",school:""},o=((r=g[t.id])==null?void 0:r[a])||{},i=o.status||"",l=o.homework_pct??0,c=n.gender==="남"?"male":"female",d=l>=80?"var(--green)":l>=50?"var(--yellow)":l>0?"var(--red)":"var(--border)";return`
      <div class="att-student-row" data-student-id="${a}" data-class-id="${t.id}">
        <div class="att-avatar ${c}">${n.name.charAt(0)}</div>
        <div class="att-student-info">
          <div class="att-student-name">${n.name}</div>
          <div class="att-student-school">${n.school||""}</div>
        </div>
        <div class="att-buttons">
          <button class="att-btn present ${i==="present"?"active":""}" data-status="present">출석</button>
          <button class="att-btn late ${i==="late"?"active":""}" data-status="late">지각</button>
          <button class="att-btn absent ${i==="absent"?"active":""}" data-status="absent">결석</button>
        </div>
        <div class="homework-slider-wrap">
          <div class="homework-slider-label">
            <span class="homework-label-text">과제</span>
            <span class="homework-pct-value" id="hw-val-${t.id}-${a}">${l}%</span>
          </div>
          <input class="homework-slider" type="range" min="0" max="100" step="10"
            value="${l}"
            style="background: linear-gradient(to right, ${d} ${l}%, var(--border) ${l}%)"
            id="hw-slider-${t.id}-${a}"
            data-class-id="${t.id}"
            data-student-id="${a}" />
        </div>
      </div>
    `}).join("")}function tt(t){if(t===""||t===null||t===void 0)return"none";const e=Number(t);return e>=90?"A":e>=75?"B":e>=60?"C":"D"}function oe(t){const e=t.classList.contains("open");if(document.querySelectorAll(".accordion-item.open").forEach(s=>s.classList.remove("open")),!e){t.classList.add("open");const s=t.dataset.classId;ie(s)}}async function ie(t){const e=await ut(m,t);if(e){M[t]=e.memo;const a=document.getElementById("memo-ta-"+t);a&&(a.value=e.memo||"");const n=document.getElementById("memo-ind-"+t);n&&(n.style.display=e.memo?"":"none")}const s=await vt(m,t);E[t]||(E[t]={}),s.forEach(a=>{E[t][a.student_id]=a.score;const n=document.getElementById(`score-${t}-${a.student_id}`);n&&(n.value=a.score);const o=document.getElementById(`grade-${t}-${a.student_id}`);if(o){const i=tt(a.score);o.textContent=i,o.className=`score-grade ${i}`}})}function le(t){const e=t.id,s=document.querySelector(`.accordion-item[data-class-id="${e}"]`);if(!s)return;s.querySelectorAll(".panel-tab-btn").forEach(n=>{n.onclick=o=>{o.stopPropagation();const i=n.dataset.panel,l=document.getElementById(`panel-${i}-${e}`),c=l==null?void 0:l.classList.contains("visible");s.querySelectorAll(".panel").forEach(d=>d.classList.remove("visible")),s.querySelectorAll(".panel-tab-btn").forEach(d=>d.classList.remove("active")),c||(l==null||l.classList.add("visible"),n.classList.add("active"))}});const a=document.getElementById(`memo-save-${e}`);a&&(a.onclick=async n=>{n.stopPropagation();const o=document.getElementById(`memo-ta-${e}`),i=(o==null?void 0:o.value.trim())||"";try{await At(m,e,i),M[e]=i;const l=document.getElementById(`memo-ind-${e}`);l&&(l.style.display=i?"":"none"),f("메모 저장 완료 ✦","success")}catch{f("저장 실패","error")}}),s.querySelectorAll(".test-score-input").forEach(n=>{n.addEventListener("input",o=>{o.stopPropagation();let i=parseInt(n.value);isNaN(i)?i="":i=Math.max(0,Math.min(100,i)),i!==""&&(n.value=i);const l=tt(i),c=document.getElementById(`grade-${n.dataset.classId}-${n.dataset.studentId}`);c&&(c.textContent=l==="none"?"-":l,c.className=`score-grade ${l}`)}),n.addEventListener("change",async o=>{o.stopPropagation();const i=n.value===""?null:parseInt(n.value);if(!(i!==null&&(i<0||i>100)))try{await qt(m,n.dataset.classId,n.dataset.studentId,i),E[e]||(E[e]={}),E[e][n.dataset.studentId]=i}catch{f("점수 저장 실패","error")}}),n.addEventListener("click",o=>o.stopPropagation())}),s.querySelectorAll(".att-btn").forEach(n=>{n.onclick=async o=>{var u,y;o.stopPropagation();const i=n.closest(".att-student-row"),l=i.dataset.studentId,c=i.dataset.classId,d=n.dataset.status,p=((y=(u=g[c])==null?void 0:u[l])==null?void 0:y.status)===d?"":d;i.querySelectorAll(".att-btn").forEach(j=>j.classList.remove("active")),p&&n.classList.add("active"),g[c]||(g[c]={}),g[c][l]={...g[c][l],status:p};try{await it(m,c,l,{status:p}),de(c)}catch{f("저장 실패","error")}}}),s.querySelectorAll(".homework-slider").forEach(n=>{n.addEventListener("input",o=>{o.stopPropagation();const i=n.dataset.classId,l=n.dataset.studentId,c=parseInt(n.value),d=document.getElementById(`hw-val-${i}-${l}`);d&&(d.textContent=c+"%");const r=c>=80?"var(--green)":c>=50?"var(--yellow)":c>0?"var(--red)":"var(--border)";n.style.background=`linear-gradient(to right, ${r} ${c}%, var(--border) ${c}%)`}),n.addEventListener("change",async o=>{var d;o.stopPropagation();const i=n.dataset.classId,l=n.dataset.studentId,c=parseInt(n.value);g[i]||(g[i]={}),g[i][l]={...g[i][l],homework_pct:c};try{await it(m,i,l,{homework_pct:c,status:((d=g[i][l])==null?void 0:d.status)||""})}catch{f("저장 실패","error")}}),n.addEventListener("click",o=>o.stopPropagation())})}function de(t){const e=_.find(c=>c.id===t);if(!e)return;const s=e.students||[],{present:a,late:n,absent:o}=wt(t,s),i=document.querySelector(`.accordion-item[data-class-id="${t}"]`);if(!i)return;const l=i.querySelector(".attendance-summary-pill");l&&(l.innerHTML=`
    <span class="att-present">${a}출</span>
    <span style="color:var(--border)">|</span>
    <span class="att-late">${n}지</span>
    <span style="color:var(--border)">|</span>
    <span class="att-absent">${o}결</span>
  `)}function ce(){const t=document.getElementById("calendar-popup");t&&(q?N():(q=!0,re(t),t.classList.remove("hidden"),setTimeout(()=>{document.addEventListener("click",St,{once:!0})},50)))}function St(t){const e=document.getElementById("calendar-popup");e&&!e.contains(t.target)?N():q&&document.addEventListener("click",St,{once:!0})}function N(){const t=document.getElementById("calendar-popup");t&&t.classList.add("hidden"),q=!1}function re(t){const e=new Date(m+"T00:00:00");let s=e.getFullYear(),a=e.getMonth();function n(){const o=new Date().toLocaleDateString("sv-KR"),i=new Date(s,a,1).getDay(),l=new Date(s,a+1,0).getDate(),c=[];for(let d=0;d<i;d++)c.push('<div class="cal-day"></div>');for(let d=1;d<=l;d++){const r=`${s}-${String(a+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,p=r===m,u=r===o;c.push(`
        <div class="cal-day ${p?"selected":""} ${u?"today":""}"
          data-date="${r}">${d}</div>
      `)}t.innerHTML=`
      <div class="cal-header">
        <button class="cal-nav-btn" id="cal-prev">◀</button>
        <span class="cal-month-label">${s}년 ${a+1}월</span>
        <button class="cal-nav-btn" id="cal-next">▶</button>
      </div>
      <div class="cal-week-labels">
        ${["일","월","화","수","목","금","토"].map(d=>`<div class="cal-week-label">${d}</div>`).join("")}
      </div>
      <div class="cal-grid">${c.join("")}</div>
      <button class="cal-close-btn" id="cal-close">닫기</button>
    `,t.querySelector("#cal-prev").onclick=d=>{d.stopPropagation(),a--,a<0&&(a=11,s--),n()},t.querySelector("#cal-next").onclick=d=>{d.stopPropagation(),a++,a>11&&(a=0,s++),n()},t.querySelector("#cal-close").onclick=d=>{d.stopPropagation(),N()},t.querySelectorAll(".cal-day[data-date]").forEach(d=>{d.onclick=r=>{r.stopPropagation(),m=d.dataset.date,R(),J(),K(),N()}})}n()}let b=new Date().toLocaleDateString("sv-KR"),P=!1;const ue=["일","월","화","수","목","금","토"];async function ve(t){t.innerHTML=`
    <div class="attendance-header">
      <div class="date-nav">
        <button class="date-nav-btn" id="res-prev-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="date-display" id="res-date-display" style="cursor:pointer">
          <span class="date-display-main" id="res-date-main"></span>
          <span class="date-display-sub" id="res-date-sub"></span>
        </div>
        <button class="date-nav-btn" id="res-next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
    <div id="results-content" style="padding:12px 16px">
      <div class="loading-screen"><div class="loading-spinner"></div></div>
    </div>
    <div class="offline-banner" style="margin:0 16px 8px">오프라인 모드 — 샘플 데이터</div>
  `;const e=document.querySelector(".fab");e&&e.remove(),document.getElementById("res-prev-btn").onclick=()=>dt(-1),document.getElementById("res-next-btn").onclick=()=>dt(1),document.getElementById("res-date-display").onclick=()=>pe(),et(),await st()}function et(){const t=new Date(b+"T00:00:00"),e=document.getElementById("res-date-main"),s=document.getElementById("res-date-sub");if(!e)return;const a=t.getMonth()+1,n=t.getDate(),o=ue[t.getDay()],i=new Date().toLocaleDateString("sv-KR");e.textContent=`${b.slice(0,4)}. ${String(a).padStart(2,"0")}. ${String(n).padStart(2,"0")}`,s.textContent=`${o}요일${b===i?" · 오늘":""}`}function dt(t){const e=new Date(b+"T00:00:00");e.setDate(e.getDate()+t),b=e.toLocaleDateString("sv-KR"),et(),st()}async function st(){const t=document.getElementById("results-content");if(!t)return;t.innerHTML='<div class="loading-screen"><div class="loading-spinner"></div></div>';const[e,s,a]=await Promise.all([W(),H(),U(b)]),n=new Set(a.map(l=>l.class_id)),o=n.size>0?e.filter(l=>n.has(l.id)):e;if(o.length===0){t.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-text">이 날의 기록이 없습니다</div>
        <div class="empty-state-sub">출석 탭에서 기록을 입력하세요</div>
      </div>
    `;return}const i=await Promise.all(o.map(async l=>{const[c,d]=await Promise.all([ut(b,l.id),vt(b,l.id)]),r=a.filter(p=>p.class_id===l.id);return{cls:l,memo:c,scores:d,att:r}}));t.innerHTML=i.map(({cls:l,memo:c,scores:d,att:r})=>{const p=l.students||[],u={};d.forEach(v=>{u[v.student_id]=v.score});const y={};r.forEach(v=>{y[v.student_id]=v});const j={present:"출석",late:"지각",absent:"결석"},kt={present:"var(--green)",late:"var(--yellow)",absent:"var(--red)"},Lt=r.filter(v=>v.status==="present").length,jt=r.filter(v=>v.status==="late").length,Dt=r.filter(v=>v.status==="absent").length;return`
      <div class="results-summary-card">
        <div class="results-class-header">
          <div class="results-class-name">${l.name}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="subject-tag ${l.subject||""}" style="font-size:10px">${l.subject||""}</span>
            <div class="attendance-summary-pill">
              <span class="att-present">${Lt}출</span>
              <span style="color:var(--border)">|</span>
              <span class="att-late">${jt}지</span>
              <span style="color:var(--border)">|</span>
              <span class="att-absent">${Dt}결</span>
            </div>
          </div>
        </div>

        ${p.length>0?`
          <div class="results-section-label">출결 현황</div>
          ${p.map(v=>{const x=typeof v=="object"?v.id:v,w=typeof v=="object"?v:s.find(Bt=>Bt.id===x);if(!w)return"";const S=y[x],at=(S==null?void 0:S.status)||"",nt=(S==null?void 0:S.homework_pct)??"-",F=u[x]!==void 0?u[x]:null;return`
              <div class="results-att-row">
                <span class="results-att-name">${w.name}</span>
                <span class="results-att-status" style="color:${kt[at]||"var(--text3)"}">
                  ${j[at]||"-"}
                </span>
                <span class="results-att-hw">과제 ${nt!=="-"?nt+"%":"-"}</span>
                ${F!==null?`<span class="score-grade ${ct(F)}" style="font-size:12px">${F}점</span>`:""}
              </div>
            `}).join("")}
        `:""}

        ${c!=null&&c.memo?`
          <div class="results-section-label">수업 메모</div>
          <div class="results-memo-box">${c.memo}</div>
        `:""}

        ${d.length>0?`
          <div class="results-section-label">테스트 점수</div>
          ${d.map(v=>{const x=s.find(S=>S.id===v.student_id),w=ct(v.score);return`
              <div class="results-score-row">
                <span class="results-score-name">${(x==null?void 0:x.name)||"?"}</span>
                <span class="results-score-val" style="color:${w==="A"?"var(--green)":w==="B"?"var(--accent2)":w==="C"?"var(--yellow)":"var(--red)"}">
                  ${v.score}점
                </span>
                <span class="score-grade ${w}">${w}</span>
              </div>
            `}).join("")}
        `:""}
      </div>
    `}).join("")}function ct(t){if(t==null||t==="")return"none";const e=Number(t);return e>=90?"A":e>=75?"B":e>=60?"C":"D"}function pe(){const t=document.getElementById("calendar-popup");t&&(P?z():(P=!0,me(t),t.classList.remove("hidden"),setTimeout(()=>{document.addEventListener("click",Et,{once:!0})},50)))}function Et(t){const e=document.getElementById("calendar-popup");e&&!e.contains(t.target)?z():P&&document.addEventListener("click",Et,{once:!0})}function z(){const t=document.getElementById("calendar-popup");t&&t.classList.add("hidden"),P=!1}function me(t){const e=new Date(b+"T00:00:00");let s=e.getFullYear(),a=e.getMonth();function n(){const o=new Date().toLocaleDateString("sv-KR"),i=new Date(s,a,1).getDay(),l=new Date(s,a+1,0).getDate(),c=[];for(let d=0;d<i;d++)c.push('<div class="cal-day"></div>');for(let d=1;d<=l;d++){const r=`${s}-${String(a+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,p=r===b,u=r===o;c.push(`
        <div class="cal-day ${p?"selected":""} ${u?"today":""}"
          data-date="${r}">${d}</div>
      `)}t.innerHTML=`
      <div class="cal-header">
        <button class="cal-nav-btn" id="cal-prev">◀</button>
        <span class="cal-month-label">${s}년 ${a+1}월</span>
        <button class="cal-nav-btn" id="cal-next">▶</button>
      </div>
      <div class="cal-week-labels">
        ${["일","월","화","수","목","금","토"].map(d=>`<div class="cal-week-label">${d}</div>`).join("")}
      </div>
      <div class="cal-grid">${c.join("")}</div>
      <button class="cal-close-btn" id="cal-close">닫기</button>
    `,t.querySelector("#cal-prev").onclick=d=>{d.stopPropagation(),a--,a<0&&(a=11,s--),n()},t.querySelector("#cal-next").onclick=d=>{d.stopPropagation(),a++,a>11&&(a=0,s++),n()},t.querySelector("#cal-close").onclick=d=>{d.stopPropagation(),z()},t.querySelectorAll(".cal-day[data-date]").forEach(d=>{d.onclick=r=>{r.stopPropagation(),b=d.dataset.date,et(),st(),z()}})}n()}let G="students";const fe={students:zt,classes:Gt,attendance:te,results:ve};async function rt(t){if(G===t)return;const e=document.querySelector(".fab");e&&e.remove(),G=t,document.querySelectorAll(".nav-item").forEach(a=>{a.classList.toggle("active",a.dataset.tab===t)});const s=document.getElementById("page-content");s.innerHTML='<div class="loading-screen"><div class="loading-spinner"></div></div>';try{await fe[t](s)}catch(a){console.error(`[main.js] navigateTo(${t}) error:`,a),s.innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">페이지 로드 중 오류가 발생했습니다</div>
        <div class="empty-state-sub">${a.message}</div>
      </div>
    `}}async function ge(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",()=>rt(t.dataset.tab))});{const t=document.querySelector(".logo-text");t&&(t.title="오프라인 모드")}G=null,await rt("attendance"),document.querySelectorAll(".nav-item").forEach(t=>{t.classList.toggle("active",t.dataset.tab==="attendance")})}ge();
