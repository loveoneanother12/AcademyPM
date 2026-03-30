(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const c of s)if(c.type==="childList")for(const d of c.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function a(s){const c={};return s.integrity&&(c.integrity=s.integrity),s.referrerPolicy&&(c.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?c.credentials="include":s.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function n(s){if(s.ep)return;s.ep=!0;const c=a(s);fetch(s.href,c)}})();const Pe=[{id:"s1",name:"김민준",grade:"고1",school:"성남고",subjects:"수학,영어",teacher:"현재T",parent_phone:"010-1234-5678",student_phone:"010-9876-5432",status:"active",notes:""},{id:"s2",name:"이서연",grade:"고2",school:"분당고",subjects:"수학",teacher:"현재T",parent_phone:"010-2345-6789",student_phone:"010-8765-4321",status:"active",notes:""},{id:"s3",name:"박지호",grade:"중3",school:"구암중",subjects:"국어,영어,수학",teacher:"현재T",parent_phone:"010-3456-7890",student_phone:"010-7654-3210",status:"inactive",notes:"잠시 휴원"},{id:"s4",name:"최유진",grade:"고1",school:"성남고",subjects:"수학",teacher:"현재T",parent_phone:"010-4567-8901",student_phone:"010-6543-2109",status:"active",notes:""},{id:"s5",name:"정하은",grade:"중3",school:"구암중",subjects:"국어",teacher:"지현T",parent_phone:"010-5678-9012",student_phone:"010-5432-1098",status:"active",notes:""}],Oe=[{id:"c1",name:"고1 수학",subject:"수학",teacher:"현재T",grade:"고1",time:"20-22",days:"월,수,금",student_ids:"s1,s4"},{id:"c2",name:"고2 수학",subject:"수학",teacher:"현재T",grade:"고2",time:"18-20",days:"화,목",student_ids:"s2"},{id:"c3",name:"중등 국어",subject:"국어",teacher:"지현T",grade:"중3",time:"16-18",days:"월,목",student_ids:"s3,s5"}];function T(e,t){const a=[],n=new Date;for(n.setHours(0,0,0,0);a.length<t;)n.setDate(n.getDate()-1),e.includes(n.getDay())&&a.push(n.toISOString().slice(0,10));return a.reverse()}function Re(){const e=[];let t=1;const a=(p,i,o,y,r)=>e.push({id:`a${t++}`,date:p,class_id:i,student_id:o,status:y,homework_pct:r}),n=T([1,3,5],17),s=["present","present","late","present","present","present","absent","present","present","present","late","present","present","present","present","present","present"],c=["present","present","present","late","present","absent","present","present","present","present","present","late","present","present","present","present","present"];n.forEach((p,i)=>{a(p,"c1","s1",s[i]||"present",80),a(p,"c1","s4",c[i]||"present",75)});const d=T([2,4],12),m=["present","present","present","absent","present","present","late","present","present","present","present","present"];d.forEach((p,i)=>a(p,"c2","s2",m[i]||"present",90));const v=T([1,4],12),u=["absent","present","present","absent","present","present","present","absent","present","present","present","present"],l=["present","present","late","present","present","present","present","present","late","present","present","present"];return v.forEach((p,i)=>{a(p,"c3","s3",u[i]||"present",60),a(p,"c3","s5",l[i]||"present",85)}),e}function Fe(){const e=[];let t=1;const a=(n,s,c,d)=>e.push({id:`t${t++}`,date:n,class_id:s,student_id:c,score:d});return T([5],4).forEach((n,s)=>{a(n,"c1","s1",[85,78,92,88][s]),a(n,"c1","s4",[72,68,75,80][s])}),T([4],3).forEach((n,s)=>a(n,"c2","s2",[91,95,88][s])),T([1],4).forEach((n,s)=>a(n,"c3","s5",[65,70,62,75][s])),T([1],2).forEach((n,s)=>a(n,"c3","s3",[45,55][s])),e}function Ne(){const e=[];let t=1;const a=(d,m,v)=>e.push({id:`m${t++}`,date:d,class_id:m,memo:v}),n=T([1,3,5],5);a(n[0],"c1","교과서 3단원 마무리. 김민준 집중도 좋음."),a(n[1],"c1","인수분해 심화 문제 풀이. 최유진 오답 많음 → 복습 필요."),a(n[2],"c1","중간고사 대비 모의고사. 전체적으로 잘 따라옴."),a(n[3],"c1","시험 피드백 및 오답 정리."),a(n[4],"c1","4단원 시작. 집합 개념 설명.");const s=T([2,4],3);a(s[0],"c2","수열 파트 완료. 이서연 이해도 높음."),a(s[1],"c2","극한 개념 도입. 질문 많았음."),a(s[2],"c2","극한 연습 문제. 속도 올리기 숙제 부여.");const c=T([1,4],4);return a(c[0],"c3","독서 지문 분석 연습."),a(c[1],"c3","박지호 결석. 정하은만 수업 — 문학 파트."),a(c[2],"c3","논술 기초. 개요 작성법 설명."),a(c[3],"c3","비문학 2지문 풀이. 전체적으로 시간 부족."),e}JSON.parse(JSON.stringify(Pe)),JSON.parse(JSON.stringify(Oe)),Re(),Ne(),Fe();const Ie="https://script.google.com/macros/s/AKfycbwBQTGa54lNqX8NvCmYs0w1TrsPN3eXpHb86LrzJofj4RQ0vG1JRurmbFvn0Nd6NdX9Vg/exec";async function be(e){const t={...e,_t:Date.now()},a=new URLSearchParams(t).toString(),n=await fetch(`${Ie}?${a}`,{redirect:"follow",cache:"no-store"});if(!n.ok)throw new Error(`HTTP ${n.status}`);return await n.json()}async function O(e){try{return await be({action:"read",...e})}catch(t){return console.error("[api] GET 실패:",t),{success:!1,error:t.message}}}async function ce({action:e,sheet:t,id:a,data:n}){try{const s={action:e,sheet:t};return a!=null&&(s.id=a),n!=null&&(s.data=JSON.stringify(n)),await be(s)}catch(s){return console.error("[api] WRITE 실패:",s),{success:!1,error:s.message}}}const U=()=>O({sheet:"students"}),G=()=>O({sheet:"classes"}),Ye=e=>O({sheet:"attendance",student_id:e}),We=e=>O({sheet:"test_scores",student_id:e}),K=e=>O({sheet:"class_memos",class_id:e}),le=e=>O({sheet:"attendance",class_id:e}),ie=e=>O({sheet:"test_scores",class_id:e}),N=(e,t)=>ce({action:"insert",sheet:e,data:t}),oe=(e,t,a)=>ce({action:"update",sheet:e,id:t,data:a}),ge=(e,t)=>ce({action:"delete",sheet:e,id:t}),D=document.getElementById("modal-overlay");let F=null,J=null,B=null;function W(){F&&(F.style.animation="slideUp 0.25s cubic-bezier(0.32,0.72,0,1) reverse",F.addEventListener("animationend",()=>{B&&(D.removeEventListener("click",B),B=null),D.classList.add("hidden"),D.innerHTML="",F=null,J&&(J(),J=null)},{once:!0}))}function A({title:e,body:t,footer:a,onClose:n}={}){J=n||null;const s=document.createElement("div");s.className="bottom-sheet",s.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <span class="sheet-title">${e||""}</span>
      <button class="sheet-close" aria-label="닫기">✕</button>
    </div>
    <div class="sheet-scroll"></div>
    <div class="sheet-footer-slot"></div>
  `;const c=s.querySelector(".sheet-scroll"),d=s.querySelector(".sheet-footer-slot"),m=(l,p)=>{p&&(typeof p=="string"?l.innerHTML=p:p instanceof Node&&l.appendChild(p))};m(c,t),m(d,a),s.querySelector(".sheet-close").addEventListener("click",W);const v=s.querySelector(".sheet-handle");let u=0;return v.addEventListener("touchstart",l=>{u=l.touches[0].clientY,s.style.transition="none"},{passive:!0}),v.addEventListener("touchmove",l=>{const p=l.touches[0].clientY-u;p>0&&(s.style.transform=`translateY(${p}px)`)},{passive:!0}),v.addEventListener("touchend",l=>{const p=l.changedTouches[0].clientY-u;s.style.transition="",p>80?(s.style.transform="",W()):s.style.transform="",u=0}),B&&D.removeEventListener("click",B),B=l=>{l.target===D&&W()},D.addEventListener("click",B),D.innerHTML="",D.appendChild(s),D.classList.remove("hidden"),F=s,{el:s,close:W}}const Je=document.getElementById("toast-container");function E(e,t="default"){const a=document.createElement("div");a.className=`toast${t!=="default"?` toast-${t}`:""}`,a.textContent=e,Je.appendChild(a),setTimeout(()=>{a.classList.add("hiding"),a.addEventListener("animationend",()=>a.remove(),{once:!0})},2200)}const ze=["중1","중2","중3","고1","고2","고3"],Ue=["수학","영어","국어","과학"],$e={수학:"badge-math",영어:"badge-eng",국어:"badge-korean",과학:"badge-sci"};function ye(e){return`<span class="badge ${$e[e]||"badge-etc"}">${e}</span>`}function M(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ge(e){const t=(e.subjects||"").split(",").filter(Boolean);return`
    <div class="student-card" data-id="${e.id}">
      <div class="student-avatar">${e.name[0]}</div>
      <div class="student-info" style="padding-right:12px">
        <div class="flex items-center gap-8">
          <span class="student-name">${e.name}</span>
        </div>
        <div class="student-meta">${[e.grade,e.school].filter(Boolean).join(" · ")}</div>
        ${t.length?`<div class="student-subjects">${t.map(ye).join("")}</div>`:""}
      </div>
    </div>`}function we(e={}){const t=ze.map(n=>`<option value="${n}"${e.grade===n?" selected":""}>${n}</option>`).join(""),a=Ue.map(n=>{const s=(e.subjects||"").split(",").includes(n)?"checked":"";return`
      <div class="checkbox-chip">
        <input type="checkbox" id="f-subj-${n}" name="subjects" value="${n}" ${s}>
        <label for="f-subj-${n}">${n}</label>
      </div>`}).join("");return`
    <div class="sheet-body">
      <div class="form-group">
        <label class="form-label">이름 *</label>
        <input class="input" name="name" placeholder="학생 이름" value="${M(e.name||"")}">
      </div>
      <div class="flex gap-12" style="align-items:flex-start">
        <div class="form-group" style="flex:1">
          <label class="form-label">학년</label>
          <select class="select" name="grade">
            <option value="">선택</option>${t}
          </select>
        </div>
        <div class="form-group" style="flex:2">
          <label class="form-label">학교</label>
          <input class="input" name="school" placeholder="학교명" value="${M(e.school||"")}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">과목</label>
        <div class="checkbox-group">${a}</div>
      </div>
      <div class="form-group">
        <label class="form-label">학부모 연락처</label>
        <input class="input" name="parent_phone" placeholder="010-0000-0000"
          value="${M(e.parent_phone||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">학생 연락처</label>
        <input class="input" name="student_phone" placeholder="010-0000-0000"
          value="${M(e.student_phone||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">비고</label>
        <textarea class="textarea" name="notes" placeholder="메모...">${M(e.notes||"")}</textarea>
      </div>
    </div>`}function Se(e){return`
    <div class="sheet-footer">
      ${e?'<button class="btn btn-danger btn-sm" id="btn-del">삭제</button>':""}
      <button class="btn btn-primary btn-full" id="btn-save">
        ${e?"수정 저장":"학생 추가"}
      </button>
    </div>`}function Le(e){const t=n=>e.querySelector(`[name="${n}"]`)?.value?.trim()||"",a=[...e.querySelectorAll('[name="subjects"]:checked')].map(n=>n.value).join(",");return{name:t("name"),grade:t("grade"),school:t("school"),parent_phone:t("parent_phone"),student_phone:t("student_phone"),notes:t("notes"),subjects:a}}function Ke(e){const{el:t,close:a}=A({title:"새 학생 추가",body:we(),footer:Se(!1)});t.querySelector("#btn-save").addEventListener("click",async()=>{const n=Le(t);if(!n.name){E("이름을 입력해주세요","error");return}const s=t.querySelector("#btn-save");s.disabled=!0,s.textContent="추가 중...";const c=await N("students",n);c.success?(E(`${n.name} 추가됐어요`,"success"),a(),e()):(E(c.error||"추가 실패","error"),s.disabled=!1,s.textContent="학생 추가")})}function Xe(e,t,a){let n=!1;const{el:s,close:c}=A({title:"학생 정보 수정",body:we(e),footer:Se(!0),onClose:()=>{n||a?.(e)}});s.querySelector("#btn-save").addEventListener("click",async()=>{const d=Le(s);if(!d.name){E("이름을 입력해주세요","error");return}const m=s.querySelector("#btn-save");m.disabled=!0,m.textContent="저장 중...";const v=await oe("students",e.id,d);v.success?(E("수정됐어요","success"),n=!0,c(),a?.(v.data||{...e,...d})):(E(v.error||"저장 실패","error"),m.disabled=!1,m.textContent="수정 저장")}),s.querySelector("#btn-del")?.addEventListener("click",async()=>{if(!confirm(`${e.name} 학생을 삭제할까요?`))return;const d=await ge("students",e.id);d.success?(E("삭제됐어요"),n=!0,c(),t()):E(d.error||"삭제 실패","error")})}function Qe(e,t,a,n){const s=new Date;s.setHours(0,0,0,0);const c=new Date(+s-28*864e5).toISOString().slice(0,10),d=a.filter(h=>h.class_id===e.id&&h.student_id===t),m=new Map;d.forEach(h=>{m.has(h.date)||m.set(h.date,h)});const u=[...m.values()].filter(h=>h.date>=c),l={present:u.filter(h=>h.status==="present").length,late:u.filter(h=>h.status==="late").length,absent:u.filter(h=>h.status==="absent").length},p=u.filter(h=>h.homework_pct!=null&&h.homework_pct!=="").map(h=>Number(h.homework_pct)),i=p.length?Math.round(p.reduce((h,g)=>h+g,0)/p.length):null,o=n.filter(h=>h.class_id===e.id&&h.student_id===t&&h.score!=null&&h.score!==""),y=new Map;o.forEach(h=>{y.has(h.date)||y.set(h.date,h)});const b=[...y.values()].sort((h,g)=>h.date<g.date?-1:1).slice(-5),$=5-b.length,w=Array.from({length:5},(h,g)=>b[g-$]??{score:0,date:null});return{w4:l,hwAvg:i,scores:w}}function Ee(e,t,a,n){const s=e+t+a;return s?Math.round((e+(n?.5:1)*t)/s*100)+"%":"-"}function Ve(e){const u=e.length-1,l=b=>22+(u?b/u*230:230/2),p=b=>16+72*(1-Math.max(0,Math.min(b,100))/100),i=b=>b>=90?"#5ee8a0":b>=70?"#6cb8f0":b>=50?"#f7c96c":"#f06c6c";let o='<svg viewBox="0 0 260 108" class="test-chart-svg" xmlns="http://www.w3.org/2000/svg">';[[90,100,"#5ee8a0","A"],[70,90,"#6cb8f0","B"],[50,70,"#f7c96c","C"],[0,50,"#f06c6c","D"]].forEach(([b,$,w,h])=>{const g=p($),L=p(b)-p($);o+=`<rect x="22" y="${g.toFixed(1)}" width="230" height="${L.toFixed(1)}" fill="${w}" fill-opacity="0.07"/>`,o+=`<text x="${19 .toFixed(1)}" y="${(g+L/2+3.5).toFixed(1)}" font-size="7" fill="#5a5a72" text-anchor="end">${h}</text>`}),[50,70,90].forEach(b=>o+=`<line x1="22" y1="${p(b).toFixed(1)}" x2="${252 .toFixed(1)}" y2="${p(b).toFixed(1)}" stroke="#2e2e3e" stroke-width="0.5" stroke-dasharray="3,4"/>`);const y=e.map((b,$)=>({x:l($),y:p(b.score),has:!!b.date}));let r="";return y.forEach((b,$)=>{$===0?r+=`M${b.x.toFixed(1)},${b.y.toFixed(1)}`:r+=`L${b.x.toFixed(1)},${b.y.toFixed(1)}`}),o+=`<path d="${r}" fill="none" stroke="#7c6ef7" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`,e.forEach((b,$)=>{const w=l($).toFixed(1),h=p(b.score).toFixed(1),g=!!b.date,L=g?i(b.score):"#3a3a50";o+=`<circle cx="${w}" cy="${h}" r="${g?4:3}" fill="${L}" stroke="#0f0f12" stroke-width="1.5"/>`,o+=`<text x="${w}" y="${(+h-7).toFixed(1)}" font-size="9" fill="${g?L:"#5a5a72"}" text-anchor="middle" font-weight="${g?600:400}">${g?b.score:"-"}</text>`;const x=b.date?b.date.slice(5).replace("-","/"):"-";o+=`<text x="${w}" y="${106 .toFixed(1)}" font-size="7.5" fill="#5a5a72" text-anchor="middle">${x}</text>`}),o+"</svg>"}function Ze(e,t,a,n){const s=(e.subjects||"").split(",").filter(Boolean),c=[];s.length&&c.push({lbl:"과목",html:s.map(ye).join("")}),e.parent_phone&&c.push({lbl:"학부모",text:e.parent_phone}),e.student_phone&&c.push({lbl:"학생",text:e.student_phone}),e.notes&&c.push({lbl:"비고",text:e.notes});const d=`
    <div class="sd-info-card">
      <div class="sd-info-hd">
        <div class="sd-avatar">${e.name[0]}</div>
        <div>
          <div class="sd-name-row">
            <span class="sd-name">${M(e.name)}</span>
          </div>
          <div class="sd-sub">${[e.grade,e.school].filter(Boolean).map(M).join(" · ")}</div>
        </div>
      </div>
      ${c.length?`
        <div class="sd-fields">
          ${c.map(u=>`
            <div class="sd-field-row">
              <span class="sd-field-lbl">${u.lbl}</span>
              <span class="sd-field-val">${u.html??M(u.text||"")}</span>
            </div>`).join("")}
        </div>`:""}
    </div>`;if(!t.length)return`<div class="sheet-body">${d}<p class="sd-no-class">등록된 수업이 없어요</p></div>`;const m=n?"지각 1회가 출석 0.5회로 계산됩니다":"지각 1회가 출석 1회로 계산됩니다",v=t.map(u=>{const{w4:l,hwAvg:p,scores:i}=a[u.id],o=l.present+l.late+l.absent,y=p==null?"var(--text3)":p>=80?"var(--green)":p>=50?"var(--yellow)":"var(--red)",r=p!=null?`${p}%`:"-";return`
      <div class="sd-class-card"
        data-p4="${l.present}" data-l4="${l.late}" data-a4="${l.absent}">
        <div class="sd-class-hd">
          <span class="sd-class-nm">${M(u.name)}</span>
          <span class="badge ${$e[u.subject]||"badge-etc"}">${M(u.subject||"")}</span>
        </div>
        <div class="sd-class-sch">${(u.days||"").replace(/,/g,"·")} ${u.time||""}</div>
        <div class="sd-divider"></div>

        <div class="sd-att-counts">
          <div class="sd-att-item"><span class="sd-att-num" style="color:var(--green)">${l.present}</span><span class="sd-att-lbl">출석</span></div>
          <div class="sd-att-item"><span class="sd-att-num" style="color:var(--yellow)">${l.late}</span><span class="sd-att-lbl">지각</span></div>
          <div class="sd-att-item"><span class="sd-att-num" style="color:var(--red)">${l.absent}</span><span class="sd-att-lbl">결석</span></div>
          <div class="sd-att-item"><span class="sd-att-num" style="color:var(--text2)">${o}</span><span class="sd-att-lbl">총수업</span></div>
        </div>

        <div class="sd-rates">
          <div class="sd-rate-item">
            <span class="sd-rate-lbl">4주 출석률</span>
            <span class="sd-rate-val js-rate-4w">${Ee(l.present,l.late,l.absent,n)}</span>
          </div>
          <div class="sd-rate-sep"></div>
          <div class="sd-rate-item">
            <span class="sd-rate-lbl">4주 과제 평균</span>
            <span class="sd-rate-val" style="color:${y}">${r}</span>
          </div>
        </div>

        <div class="sd-divider"></div>
        <div class="sd-test-title">테스트 결과 최근 5회</div>
        ${Ve(i)}
      </div>`}).join("");return`
    <div class="sheet-body">
      ${d}
      <div class="sd-stats-section">
        <div class="sd-stats-hd">
          <span class="sd-section-ttl">수업별 현황</span>
          <div class="sd-late-ctrl">
            <span class="sd-late-lbl">지각 반영</span>
            <button class="sd-toggle${n?" on":""}" id="late-toggle" aria-pressed="${n}">
              <span class="sd-toggle-knob"></span>
            </button>
          </div>
        </div>
        <p class="sd-late-hint" id="late-hint">${m}</p>
        ${v}
      </div>
    </div>`}async function xe(e,t){const{el:a}=A({title:e.name,body:`<div style="display:flex;align-items:center;justify-content:center;min-height:200px">
             <div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>
           </div>`,footer:`<div class="sheet-footer">
               <button class="btn btn-primary btn-full" id="btn-edit" disabled>수정하기</button>
             </div>`,onClose:null}),[n,s,c]=await Promise.all([G(),Ye(e.id),We(e.id)]),d=(n.data||[]).filter(r=>(r.student_ids||"").split(",").map(b=>b.trim()).includes(String(e.id))),m=s.data||[],v=c.data||[],u={};d.forEach(r=>{u[r.id]=Qe(r,e.id,m,v)});let l=!0;const p=a.querySelector(".sheet-scroll");p.innerHTML=Ze(e,d,u,l);const i=a.querySelector("#btn-edit");i.disabled=!1,i.addEventListener("click",()=>{Xe(e,t,r=>{t(),xe(r,t)})});const o=p.querySelector("#late-toggle"),y=p.querySelector("#late-hint");o?.addEventListener("click",()=>{l=!l,o.classList.toggle("on",l),o.setAttribute("aria-pressed",String(l)),y.textContent=l?"지각 1회가 출석 0.5회로 계산됩니다":"지각 1회가 출석 1회로 계산됩니다",p.querySelectorAll(".sd-class-card").forEach(r=>{const b=+r.dataset.p4,$=+r.dataset.l4,w=+r.dataset.a4;r.querySelector(".js-rate-4w").textContent=Ee(b,$,w,l)})})}async function et(e){e.innerHTML=`
    <div class="page-header">
      <div class="search-bar" style="flex:1">
        <span class="search-icon">🔍</span>
        <input class="input" id="student-search" placeholder="이름 또는 학교 검색">
      </div>
      <button class="btn btn-primary btn-sm" id="btn-add">+ 추가</button>
    </div>
    <div id="student-count" style="padding:0 16px 8px;font-size:12px;color:var(--text3)"></div>
    <div id="student-list" class="page-list">
      <div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>
    </div>`;let t=[];const a=e.querySelector("#student-list"),n=e.querySelector("#student-count"),s=m=>m?t.filter(v=>v.name.includes(m)||(v.school||"").includes(m)):t,c=m=>{if(n.textContent=m.length?`총 ${m.length}명`:"",!m.length){a.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <div class="empty-title">학생이 없어요</div>
          <div class="empty-desc">+ 추가 버튼으로 학생을 등록하세요</div>
        </div>`;return}a.innerHTML=m.map(Ge).join(""),a.querySelectorAll(".student-card").forEach(v=>{v.addEventListener("click",()=>{const u=t.find(l=>l.id===v.dataset.id);u&&xe(u,d)})})},d=async()=>{a.innerHTML='<div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>',n.textContent="";const m=await U();if(!m.success){E(m.error||"불러오기 실패","error");return}t=m.data;const v=e.querySelector("#student-search").value.trim();c(s(v))};e.querySelector("#student-search").addEventListener("input",m=>c(s(m.target.value.trim()))),e.querySelector("#btn-add").addEventListener("click",()=>Ke(d)),await d()}const _e=["월","화","수","목","금","토","일"],tt=["수학","영어","국어","과학"],st=["중1","중2","중3","고1","고2","고3"],at={수학:"badge-math",영어:"badge-eng",국어:"badge-korean",과학:"badge-sci"};function ke(e){return`<span class="badge ${at[e]||"badge-etc"}">${e}</span>`}function qe(e){const t=new Set((e||"").split(",").filter(Boolean));return _e.map(a=>`<span class="day-chip${t.has(a)?" active":""}">${a}</span>`).join("")}function nt(e){return(e.student_ids||"").split(",").filter(Boolean).length}function j(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ct(e){const t=nt(e);return`
    <div class="class-card" data-id="${e.id}">
      <div class="class-card-top">
        <div style="min-width:0;flex:1">
          <div class="class-name">${j(e.name)}</div>
          <div class="class-teacher">${j(e.teacher||"")} · ${e.grade||""} · ${t}명</div>
        </div>
        ${ke(e.subject)}
      </div>
      <div class="class-card-bottom">
        ${qe(e.days)}
        <span class="class-time">${j(e.time||"")}</span>
      </div>
    </div>`}function je(e){return`
    <div class="sheet-footer">
      ${e?'<button class="btn btn-danger btn-sm" id="btn-del">삭제</button>':""}
      <button class="btn btn-primary btn-full" id="btn-save">
        ${e?"수정 저장":"수업 추가"}
      </button>
    </div>`}function de(e){if(!e)return"";const t=new Date(e),a=["일","월","화","수","목","금","토"];return`${t.getFullYear()}.${String(t.getMonth()+1).padStart(2,"0")}.${String(t.getDate()).padStart(2,"0")} (${a[t.getDay()]})`}function lt(e,t,a){const s=(e.student_ids||"").split(",").filter(Boolean).map(l=>t.find(p=>p.id===l)).filter(Boolean),c=[...a].sort((l,p)=>p.date.localeCompare(l.date)),d=c.slice(0,4),m=c.length>4,v=d.length?d.map(l=>`
        <div class="cd-memo-item">
          <span class="cd-memo-date">${de(l.date)}</span>
          <p class="cd-memo-text">${j(l.memo)}</p>
        </div>`).join(""):'<div class="cd-empty-hint">수업 메모가 없어요</div>',u=s.length?s.map(l=>`
          <div class="cd-student-row${l.status==="inactive"?" cd-student-inactive":""}">
            <div class="cd-avatar">${l.name.charAt(0)}</div>
            <div class="cd-student-info">
              <span class="cd-student-name">${j(l.name)}</span>
              <span class="cd-student-sub">${l.grade||""} · ${l.school||""}${l.status==="inactive"?" · 휴원":""}</span>
            </div>
          </div>`).join(""):'<div class="cd-empty-hint">수강 중인 학생이 없어요</div>';return`
    <div class="sheet-body">
      <!-- 수업 정보 카드 -->
      <div class="cd-info-card">
        <div class="cd-info-top">
          <div>
            <div class="cd-class-name">${j(e.name)}</div>
            <div class="cd-class-meta">${j(e.teacher||"")}${e.grade?" · "+e.grade:""}${e.time?" · "+e.time+"시":""}</div>
          </div>
          ${ke(e.subject)}
        </div>
        <div class="cd-day-row">${qe(e.days)}</div>
      </div>

      <!-- 최근 수업 메모 -->
      <div class="cd-section">
        <div class="cd-section-hd">
          <span class="cd-section-ttl">최근 수업 메모</span>
          ${m?'<button class="cd-more-btn" id="btn-history">더보기</button>':""}
        </div>
        <div class="cd-memo-list">${v}</div>
      </div>

      <!-- 수강 학생 -->
      <div class="cd-section">
        <div class="cd-section-hd">
          <span class="cd-section-ttl">수강 학생 <span class="cd-count">${s.length}명</span></span>
        </div>
        <div class="cd-roster">${u}</div>
      </div>
    </div>`}function z(e,t,a){let n=!1;const{el:s,close:c}=A({title:e.name,body:'<div class="sheet-body"><div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div></div>',footer:'<div class="sheet-footer"><button class="btn btn-primary btn-full" id="btn-edit" disabled>수정하기</button></div>',onClose:()=>{n||a()}}),d=s.querySelector(".sheet-scroll"),m=s.querySelector("#btn-edit");K(e.id).then(v=>{const u=v.success?v.data:[];d.innerHTML=lt(e,t,u),m.disabled=!1,s.querySelector("#btn-history")?.addEventListener("click",()=>{n=!0,c(),it(e,t,()=>{n=!1,z(e,t,a)})})}),m.addEventListener("click",()=>{n=!0,c(),rt(e,t,a,v=>{z(v,t,a)})})}async function it(e,t,a){const s=(e.student_ids||"").split(",").filter(Boolean).map($=>t.find(w=>w.id===$)).filter(Boolean),{el:c,close:d}=A({title:`${e.name} — 전체 기록`,body:'<div class="sheet-body"><div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div></div>',footer:'<div class="sheet-footer"><button class="btn btn-ghost btn-full" id="btn-back">← 뒤로가기</button></div>',onClose:a});c.querySelector("#btn-back").addEventListener("click",()=>{d()});const m=c.querySelector(".sheet-scroll"),[v,u,l]=await Promise.all([K(e.id),le(e.id),ie(e.id)]),p=v.success?v.data:[],i=u.success?u.data:[],o=l.success?l.data:[],r=[...new Set([...p.map($=>$.date),...i.map($=>$.date),...o.map($=>$.date)])].sort(($,w)=>w.localeCompare($));if(!r.length){m.innerHTML='<div class="sheet-body"><div class="cd-empty-hint" style="padding:32px 0">기록이 없어요</div></div>';return}const b=r.map($=>{const w=p.find(f=>f.date===$),h=o.filter(f=>f.date===$),g=i.filter(f=>f.date===$),L=s.map(f=>{const S=g.find(k=>k.student_id===f.id),_=S?S.status==="present"?"출":S.status==="late"?"지":"결":"—";return`<span class="${S?S.status==="present"?"hist-att-present":S.status==="late"?"hist-att-late":"hist-att-absent":"hist-att-none"}" title="${f.name}">${_}</span>`}).join(""),x=h.length?s.map(f=>{const S=h.find(C=>C.student_id===f.id);if(!S)return"";const _=S.score>=90?"A":S.score>=70?"B":S.score>=50?"C":"D";return`<span class="hist-score-item">${f.name.charAt(0)} <b>${S.score}</b><span class="hist-grade hist-grade-${_.toLowerCase()}">${_}</span></span>`}).filter(Boolean).join(""):"";return`
      <div class="hist-row">
        <div class="hist-row-hd">
          <span class="hist-date">${de($)}</span>
          <button class="hist-cal-btn" data-date="${$}" title="날짜별 상세">📅</button>
        </div>
        ${w?`<p class="hist-memo">${j(w.memo)}</p>`:""}
        ${s.length?`<div class="hist-att-row">${L}</div>`:""}
        ${x?`<div class="hist-score-row">${x}</div>`:""}
      </div>`}).join("");m.innerHTML=`<div class="sheet-body">${b}</div>`,m.querySelectorAll(".hist-cal-btn").forEach($=>{$.addEventListener("click",()=>{const w=$.dataset.date;d(),ot(w,e,t,p,i,o,()=>{z(e,t,()=>{})})})})}function ot(e,t,a,n,s,c,d){const v=(t.student_ids||"").split(",").filter(Boolean).map(r=>a.find(b=>b.id===r)).filter(Boolean),u=n.find(r=>r.date===e&&r.class_id===t.id),l=s.filter(r=>r.date===e&&r.class_id===t.id),p=c.filter(r=>r.date===e&&r.class_id===t.id),i=v.map(r=>{const b=l.find(f=>f.student_id===r.id),$=b?b.status:null,w=$?$==="present"?"출석":$==="late"?"지각":"결석":"기록없음",h=$?$==="present"?"date-att-present":$==="late"?"date-att-late":"date-att-absent":"",g=b?.homework_pct!=null?b.homework_pct+"%":"—",L=p.find(f=>f.student_id===r.id),x=L?L.score>=90?"A":L.score>=70?"B":L.score>=50?"C":"D":null;return`
      <div class="date-student-row">
        <div class="cd-avatar">${r.name.charAt(0)}</div>
        <div style="flex:1;min-width:0">
          <div class="cd-student-name">${j(r.name)}</div>
          <div class="cd-student-sub">${r.grade||""}</div>
        </div>
        <div class="date-badges">
          <span class="date-att-badge ${h}">${w}</span>
          <span class="date-hw-badge">과제 ${g}</span>
          ${L?`<span class="date-score-badge">점수 ${L.score}<span class="hist-grade hist-grade-${x.toLowerCase()}">${x}</span></span>`:""}
        </div>
      </div>`}).join(""),o=`
    <div class="sheet-body">
      <div class="cd-date-title">${de(e)}</div>
      ${u?`
        <div class="cd-section">
          <div class="cd-section-ttl" style="margin-bottom:8px">수업 메모</div>
          <p class="cd-memo-text cd-memo-box">${j(u.memo)}</p>
        </div>`:""}
      <div class="cd-section">
        <div class="cd-section-ttl" style="margin-bottom:8px">출결 · 점수</div>
        ${i||'<div class="cd-empty-hint">수강 학생이 없어요</div>'}
      </div>
    </div>`,{close:y}=A({title:t.name,body:o,footer:'<div class="sheet-footer"><button class="btn btn-ghost btn-full" id="btn-back">← 뒤로가기</button></div>',onClose:d});document.getElementById("btn-back")?.addEventListener("click",()=>y())}function dt(e,t){const a=new Set,{el:n,close:s}=A({title:"새 수업 추가",body:Ce({}),footer:je(!1)});function c(){const l=n.querySelector("#cs-enrolled");if(!a.size){l.innerHTML='<div class="cs-enrolled-empty">수강 학생 없음</div>';return}l.innerHTML=[...a].map(p=>{const i=e.find(o=>o.id===p);return i?`
        <div class="cs-chip">
          <span class="cs-chip-name">${j(i.name)}</span>
          <span class="cs-chip-sub">${i.grade||""}</span>
          <button class="cs-chip-remove" data-id="${p}" type="button">✕</button>
        </div>`:""}).filter(Boolean).join(""),l.querySelectorAll(".cs-chip-remove").forEach(p=>{p.addEventListener("click",()=>{a.delete(p.dataset.id),c()})})}c();const d=n.querySelector("#cs-search-input"),m=n.querySelector("#cs-search-btn"),v=n.querySelector("#cs-results");function u(){const l=d.value.trim().toLowerCase();if(!l){v.innerHTML="";return}const p=e.filter(i=>i.status==="active"&&((i.name||"").toLowerCase().includes(l)||(i.school||"").toLowerCase().includes(l)||(i.grade||"").toLowerCase().includes(l)||(i.teacher||"").toLowerCase().includes(l)));if(!p.length){v.innerHTML='<div class="cs-no-result">검색 결과가 없어요</div>';return}v.innerHTML=p.map(i=>`
      <button class="cs-result-item" data-id="${i.id}" type="button">
        <span class="cs-result-name">${j(i.name)}</span>
        <span class="cs-result-sub">${i.grade||""} · ${i.school||""} · ${i.teacher||""}</span>
      </button>`).join(""),v.querySelectorAll(".cs-result-item").forEach(i=>{i.addEventListener("click",()=>{if(a.has(i.dataset.id)){E("이미 추가된 학생이에요","error");return}a.add(i.dataset.id),c(),E("학생이 추가되었습니다","success")})})}m.addEventListener("click",u),d.addEventListener("keydown",l=>{l.key==="Enter"&&u()}),n.querySelector("#btn-save").addEventListener("click",async()=>{const l=r=>n.querySelector(`[name="${r}"]`)?.value?.trim()||"",p=[...n.querySelectorAll('[name="days"]:checked')].map(r=>r.value).join(","),i={name:l("name"),subject:l("subject"),grade:l("grade"),teacher:l("teacher"),time:l("time"),days:p,student_ids:[...a].join(",")};if(!i.name){E("수업명을 입력해주세요","error");return}if(!i.subject){E("과목을 선택해주세요","error");return}const o=n.querySelector("#btn-save");o.disabled=!0,o.textContent="추가 중...";const y=await N("classes",i);y.success?(E(`${i.name} 추가됐어요`,"success"),s(),t()):(E(y.error||"추가 실패","error"),o.disabled=!1,o.textContent="수업 추가")})}function Ce(e={}){const t=tt.map(s=>`<option value="${s}"${e.subject===s?" selected":""}>${s}</option>`).join(""),a=st.map(s=>`<option value="${s}"${e.grade===s?" selected":""}>${s}</option>`).join(""),n=_e.map(s=>{const c=(e.days||"").split(",").includes(s)?"checked":"";return`
      <div class="checkbox-chip">
        <input type="checkbox" id="f-day-${s}" name="days" value="${s}" ${c}>
        <label for="f-day-${s}">${s}</label>
      </div>`}).join("");return`
    <div class="sheet-body">
      <div class="form-group">
        <label class="form-label">수업명 *</label>
        <input class="input" name="name" placeholder="예: 고1 수학" value="${j(e.name||"")}">
      </div>
      <div class="flex gap-12" style="align-items:flex-start">
        <div class="form-group" style="flex:1">
          <label class="form-label">과목 *</label>
          <select class="select" name="subject">
            <option value="">선택</option>${t}
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">대상 학년</label>
          <select class="select" name="grade">
            <option value="">선택</option>${a}
          </select>
        </div>
      </div>
      <div class="flex gap-12" style="align-items:flex-start">
        <div class="form-group" style="flex:1">
          <label class="form-label">담당 강사</label>
          <input class="input" name="teacher" placeholder="홍길동T" value="${j(e.teacher||"")}">
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">수업 시간</label>
          <input class="input" name="time" placeholder="예: 20-22" value="${j(e.time||"")}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">요일</label>
        <div class="checkbox-group">${n}</div>
      </div>
      <div class="form-group">
        <label class="form-label">수강 학생</label>
        <div class="cs-enrolled" id="cs-enrolled"></div>
        <div class="cs-search-row">
          <input class="input cs-search-input" id="cs-search-input" placeholder="이름 · 학교 · 학년 · 강사로 검색">
          <button class="btn cs-search-btn" id="cs-search-btn" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="cs-results" id="cs-results"></div>
      </div>
    </div>`}function rt(e,t,a,n){let s=!1;const c=new Set((e.student_ids||"").split(",").filter(Boolean)),{el:d,close:m}=A({title:"수업 정보 수정",body:Ce(e),footer:je(!0),onClose:()=>{s||n?.(e)}});function v(){const o=d.querySelector("#cs-enrolled");if(!c.size){o.innerHTML='<div class="cs-enrolled-empty">수강 학생 없음</div>';return}o.innerHTML=[...c].map(y=>{const r=t.find(b=>b.id===y);return r?`
        <div class="cs-chip">
          <span class="cs-chip-name">${j(r.name)}</span>
          <span class="cs-chip-sub">${r.grade||""}</span>
          <button class="cs-chip-remove" data-id="${y}" type="button">✕</button>
        </div>`:""}).filter(Boolean).join(""),o.querySelectorAll(".cs-chip-remove").forEach(y=>{y.addEventListener("click",()=>{c.delete(y.dataset.id),v()})})}v();const u=d.querySelector("#cs-search-input"),l=d.querySelector("#cs-search-btn"),p=d.querySelector("#cs-results");function i(){const o=u.value.trim().toLowerCase();if(!o){p.innerHTML="";return}const y=t.filter(r=>r.status==="active"&&((r.name||"").toLowerCase().includes(o)||(r.school||"").toLowerCase().includes(o)||(r.grade||"").toLowerCase().includes(o)||(r.teacher||"").toLowerCase().includes(o)));if(!y.length){p.innerHTML='<div class="cs-no-result">검색 결과가 없어요</div>';return}p.innerHTML=y.map(r=>`
      <button class="cs-result-item" data-id="${r.id}" type="button">
        <span class="cs-result-name">${j(r.name)}</span>
        <span class="cs-result-sub">${r.grade||""} · ${r.school||""} · ${r.teacher||""}</span>
      </button>`).join(""),p.querySelectorAll(".cs-result-item").forEach(r=>{r.addEventListener("click",()=>{if(c.has(r.dataset.id)){E("이미 수강 중인 학생이에요","error");return}c.add(r.dataset.id),v(),E("학생이 추가되었습니다","success")})})}l.addEventListener("click",i),u.addEventListener("keydown",o=>{o.key==="Enter"&&i()}),d.querySelector("#btn-save").addEventListener("click",async()=>{const o=w=>d.querySelector(`[name="${w}"]`)?.value?.trim()||"",y=[...d.querySelectorAll('[name="days"]:checked')].map(w=>w.value).join(","),r={name:o("name"),subject:o("subject"),grade:o("grade"),teacher:o("teacher"),time:o("time"),days:y,student_ids:[...c].join(",")};if(!r.name){E("수업명을 입력해주세요","error");return}if(!r.subject){E("과목을 선택해주세요","error");return}const b=d.querySelector("#btn-save");b.disabled=!0,b.textContent="저장 중...";const $=await oe("classes",e.id,r);$.success?(E("수정됐어요","success"),s=!0,m(),n?.({...e,...r})):(E($.error||"저장 실패","error"),b.disabled=!1,b.textContent="수정 저장")}),d.querySelector("#btn-del")?.addEventListener("click",async()=>{if(!confirm(`"${e.name}" 수업을 삭제할까요?`))return;const o=await ge("classes",e.id);o.success?(E("삭제됐어요"),s=!0,m(),a()):E(o.error||"삭제 실패","error")})}async function ut(e){e.innerHTML=`
    <div class="page-header">
      <div>
        <div style="font-size:16px;font-weight:700;color:var(--text)">수업 목록</div>
        <div id="class-count" style="font-size:12px;color:var(--text3);margin-top:2px"></div>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-add">+ 추가</button>
    </div>
    <div id="class-list" class="page-list">
      <div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>
    </div>`;let t=[],a=[];const n=e.querySelector("#class-list"),s=e.querySelector("#class-count"),c=m=>{if(s.textContent=m.length?`총 ${m.length}개 반`:"",!m.length){n.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <div class="empty-title">수업이 없어요</div>
          <div class="empty-desc">+ 추가 버튼으로 수업을 등록하세요</div>
        </div>`;return}n.innerHTML=m.map(ct).join(""),n.querySelectorAll(".class-card").forEach(v=>{v.addEventListener("click",()=>{const u=t.find(l=>l.id===v.dataset.id);u&&z(u,a,d)})})},d=async()=>{n.innerHTML='<div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>',s.textContent="";const[m,v]=await Promise.all([G(),U()]);if(!m.success){E("수업 불러오기 실패","error");return}t=m.data,a=v.success?v.data:[],c(t)};e.querySelector("#btn-add").addEventListener("click",()=>dt(a,d)),await d()}function P(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function I(e){const[t,a,n]=e.split("-").map(Number);return new Date(t,a-1,n)}function pt(e){const t=new Date(e),a=(t.getDay()+6)%7;return t.setDate(t.getDate()-a),t}function V(e,t){const a=new Date(e);return a.setDate(a.getDate()+t),a}const vt=["일","월","화","수","목","금","토"],mt=["월","화","수","목","금","토","일"];function Z(e){return vt[e.getDay()]}function pe(e){const t=I(e);return{main:`${t.getMonth()+1}월 ${t.getDate()}일`,sub:`${t.getFullYear()} · ${Z(t)}요일`,dow:Z(t)}}const ft={수학:"badge-math",영어:"badge-eng",국어:"badge-korean",과학:"badge-sci"};function re(e){if(e===""||e==null)return"";const t=Number(e);return t>=90?"A":t>=70?"B":t>=50?"C":"D"}function ve(e){const t=Number(e.value),a=t>=80?"var(--green)":t>=50?"var(--yellow)":"var(--red)";e.style.background=`linear-gradient(to right, ${a} ${t}%, var(--border) ${t}%)`}function ht(e){if(!e)return"";const t=String(e);if(t.length===10)return t;const a=new Date(t);return isNaN(a)?t.slice(0,10):P(a)}const ee={};function Me(e,t){return`${e}__${t}`}async function bt(e,t){const a=Me(e,t),[n,s,c]=await Promise.all([le(e),K(e),ie(e)]),d=l=>l.filter(p=>ht(p.date)===t),m=d(n.success?n.data:[]),v=d(s.success?s.data:[]),u=d(c.success?c.data:[]);return ee[a]={attendance:m,memo:v.length?v[0]:null,scores:u},ee[a]}function gt(e,t){return ee[Me(e,t)]||{attendance:[],memo:null,scores:[]}}function $t(e,t,a){let n=0,s=0,c=0;t.forEach(d=>{const m=a[d.id];m==="present"?n++:m==="late"?s++:m==="absent"&&c++}),e.querySelector(".pill-present").textContent=`${n}출`,e.querySelector(".pill-late").textContent=`${s}지`,e.querySelector(".pill-absent").textContent=`${c}결`}function me(e,t,a){const n=e.querySelector(`[data-panel="${t}"]`),s=n?.querySelector("span:last-child");if(!s)return;const c=t==="memo"?"수업 메모":"테스트 결과";s.textContent=a?`${c} ✦`:c,n.classList.toggle("has-data",a)}function Te(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function De(e,t){if(!t.length)return"";const a=Object.fromEntries(t.map(s=>[s.student_id,s])),n=e.map(s=>{const c=a[s.id];if(!c||!c.status)return"";const[d,m]=c.status==="present"?["출석","svd-present"]:c.status==="late"?["지각","svd-late"]:["결석","svd-absent"],v=c.homework_pct!=null&&c.homework_pct!==""?`<span class="svd-hw">과제 ${c.homework_pct}%</span>`:"";return`
      <div class="svd-att-row">
        <div class="s-avatar svd-avatar">${s.name[0]}</div>
        <span class="svd-name">${s.name}</span>
        <span class="svd-badge ${m}">${d}</span>
        ${v}
      </div>`}).filter(Boolean).join("");return n?`<div class="svd-hd">저장된 출결</div><div class="svd-list">${n}</div><div class="svd-divider"></div>`:""}function He(e,t){if(!t.length)return"";const a=Object.fromEntries(t.map(s=>[s.student_id,s])),n=e.map(s=>{const c=a[s.id];if(c==null)return"";const d=re(c.score);return`
      <div class="svd-score-row">
        <span class="svd-name">${s.name}</span>
        <span class="svd-score-val">${c.score}점</span>
        <span class="grade-badge grade-${d}">${d||"—"}</span>
      </div>`}).filter(Boolean).join("");return n?`<div class="svd-hd">저장된 점수</div><div class="svd-list">${n}</div><div class="svd-divider"></div>`:""}function yt(e,t,a){const{attendance:n,memo:s,scores:c}=a,d=Object.fromEntries(n.map(o=>[o.student_id,o])),m=Object.fromEntries(c.map(o=>[o.student_id,o]));let v=0,u=0,l=0;t.forEach(o=>{const y=d[o.id]?.status;y==="present"?v++:y==="late"?u++:y==="absent"&&l++});const p=t.length?t.map(o=>{const y=d[o.id],r=y?.status??null,b=y?.homework_pct??0,$=[["present","출석"],["late","지각"],["absent","결석"]].map(([w,h])=>`<button class="att-btn${r===w?" selected":""}" data-status="${w}" data-sid="${o.id}">${h}</button>`).join("");return`
          <div class="s-row" data-sid="${o.id}">
            <div class="s-avatar">${o.name[0]}</div>
            <div class="s-info">
              <div class="s-name">${o.name}</div>
              <div class="s-meta">${o.grade||""}${o.school?" · "+o.school:""}</div>
            </div>
            <div class="s-controls">
              <div class="att-btn-group">${$}</div>
              <div class="hw-row">
                <span class="hw-label">과제</span>
                <input type="range" class="hw-slider" min="0" max="100" step="5"
                  value="${b}" data-sid="${o.id}">
                <span class="hw-pct" data-sid="${o.id}">${b}%</span>
              </div>
            </div>
          </div>`}).join(""):'<div class="no-students">수강 학생이 없어요</div>',i=t.map(o=>{const y=m[o.id]?.score??"",r=re(y);return`
      <div class="score-row">
        <span class="score-name">${o.name}</span>
        <div class="score-input-wrap">
          <input type="number" class="score-input" min="0" max="100"
            placeholder="—" value="${y}" data-sid="${o.id}">
          <span class="score-unit">점</span>
        </div>
        <span class="grade-badge grade-${r}" data-sid="${o.id}">${r||"—"}</span>
      </div>`}).join("");return`
    <div class="ac-item" data-cid="${e.id}">
      <div class="ac-header">
        <div class="ac-info">
          <span class="ac-name">${e.name}</span>
          <span class="ac-time">${e.time||""}</span>
        </div>
        <div class="ac-right">
          <span class="badge ${ft[e.subject]||"badge-etc"}">${e.subject}</span>
          <div class="att-pill">
            <span class="pill-present">${v}출</span>
            <span class="pill-sep">·</span>
            <span class="pill-late">${u}지</span>
            <span class="pill-sep">·</span>
            <span class="pill-absent">${l}결</span>
          </div>
          <span class="ac-chevron">›</span>
        </div>
      </div>
      <div class="ac-body">
        <div class="ac-action-bar">
          <button class="ac-action-btn${s?" has-data":""}" data-panel="memo">
            <span class="ac-action-icon">📝</span>
            <span>수업 메모${s?" ✦":""}</span>
          </button>
          <button class="ac-action-btn${c.length?" has-data":""}" data-panel="test">
            <span class="ac-action-icon">📊</span>
            <span>테스트 결과${c.length?" ✦":""}</span>
          </button>
        </div>
        <div class="ac-panel" data-name="memo">
          <div class="ac-panel-inner">
            <div class="memo-saved-wrap">${s?`<div class="svd-hd">저장된 메모</div><div class="svd-memo-box">${Te(s.memo||"")}</div><div class="svd-divider"></div>`:""}</div>
            <textarea class="textarea memo-ta" rows="3"
              placeholder="오늘 수업 내용, 특이사항 등...">${s?.memo||""}</textarea>
            <button class="btn btn-secondary btn-sm memo-save-btn">저장/수정</button>
          </div>
        </div>
        <div class="ac-panel" data-name="test">
          <div class="ac-panel-inner">
            <div class="test-saved-wrap">${He(t,c)}</div>
            <div class="score-rows">${i}</div>
            <button class="btn btn-secondary btn-sm test-save-btn">저장/수정</button>
          </div>
        </div>
        <div class="att-saved-wrap">${De(t,n)}</div>
        <div class="s-list">${p}</div>
        ${t.length?'<div class="att-save-wrap"><button class="btn btn-secondary btn-sm att-save-btn">출결 저장/수정</button></div>':""}
      </div>
    </div>`}function wt(e,t,a,n){const s=t.id,c=gt(s,n),d={},m={},v={},u={};let l=c.memo?.id??null;c.attendance.forEach(f=>{d[f.student_id]=f.status,m[f.student_id]=Number(f.homework_pct)||0,v[f.student_id]=f.id}),c.scores.forEach(f=>{u[f.student_id]=f.id});const p=e.querySelector(".ac-header"),i=e.querySelector(".ac-body");let o=!1;function y(f){o=f,e.classList.toggle("open",f),i.style.maxHeight=f?i.scrollHeight+"px":"0",f||$()}function r(){o&&(i.style.maxHeight=i.scrollHeight+"px")}p.addEventListener("click",()=>y(!o));const b={};e.querySelectorAll(".ac-panel").forEach(f=>{b[f.dataset.name]=f});function $(){Object.values(b).forEach(f=>{f.style.maxHeight="0",f.classList.remove("open")}),e.querySelectorAll(".ac-action-btn").forEach(f=>f.classList.remove("active"))}function w(f,S){const _=b[f],C=!_.classList.contains("open");$(),C&&(_.classList.add("open"),_.style.maxHeight=_.scrollHeight+"px",S.classList.add("active")),setTimeout(r,320)}e.querySelectorAll(".ac-action-btn").forEach(f=>{f.addEventListener("click",S=>{S.stopPropagation(),o?w(f.dataset.panel,f):(y(!0),setTimeout(()=>w(f.dataset.panel,f),50))})}),e.querySelectorAll(".att-btn").forEach(f=>{f.addEventListener("click",S=>{S.stopPropagation();const _=f.dataset.sid,C=f.dataset.status,k=d[_]===C?null:C;d[_]=k,f.closest(".att-btn-group").querySelectorAll(".att-btn").forEach(q=>q.classList.toggle("selected",q.dataset.status===k))})}),e.querySelectorAll(".hw-slider").forEach(f=>{ve(f);const S=e.querySelector(`.hw-pct[data-sid="${f.dataset.sid}"]`);f.addEventListener("input",()=>{ve(f),S&&(S.textContent=`${f.value}%`),m[f.dataset.sid]=Number(f.value)})});const h=e.querySelector(".att-save-btn");h&&h.addEventListener("click",async f=>{f.stopPropagation(),h.disabled=!0,h.textContent="저장 중...",await Promise.all(Object.values(v).filter(Boolean).map(k=>deleteRow("attendance",k))),Object.keys(v).forEach(k=>delete v[k]);const S=[],C=(await Promise.all(a.filter(k=>d[k.id]!=null).map(async k=>{const q=await N("attendance",{date:n,class_id:s,student_id:k.id,status:d[k.id],homework_pct:m[k.id]??0});return q.success&&(v[k.id]=q.data.id,S.push({student_id:k.id,status:d[k.id],homework_pct:m[k.id]??0})),q}))).filter(k=>!k.success);C.length?E(`${C.length}개 저장 실패`,"error"):(E("출결 저장됐어요","success"),e.querySelector(".att-saved-wrap").innerHTML=De(a,S),$t(e,a,d),r()),h.disabled=!1,h.textContent="출결 저장/수정"});const g=e.querySelector(".memo-ta"),L=e.querySelector(".memo-save-btn");L.addEventListener("click",async()=>{const f=g.value.trim();L.disabled=!0,L.textContent="저장 중...";const S=l?await oe("class_memos",l,{memo:f}):await N("class_memos",{date:n,class_id:s,memo:f});if(S.success){l||(l=S.data?.id),E("메모 저장됐어요","success"),me(e,"memo",!!f);const _=e.querySelector(".memo-saved-wrap");_.innerHTML=f?`<div class="svd-hd">저장된 메모</div><div class="svd-memo-box">${Te(f)}</div><div class="svd-divider"></div>`:"",r()}else E("저장 실패 — "+(S.error||""),"error");L.disabled=!1,L.textContent="저장/수정"});const x=e.querySelector(".test-save-btn");x.addEventListener("click",async()=>{const S=[...e.querySelectorAll(".score-input")].filter(q=>q.value.trim()!=="");if(!S.length){E("점수를 하나 이상 입력해주세요","error");return}x.disabled=!0,x.textContent="저장 중...",await Promise.all(Object.values(u).filter(Boolean).map(q=>deleteRow("test_scores",q))),Object.keys(u).forEach(q=>delete u[q]);const _=[],k=(await Promise.all(S.map(async q=>{const R=q.dataset.sid,ue=Math.min(100,Math.max(0,Number(q.value))),X=await N("test_scores",{date:n,class_id:s,student_id:R,score:ue});return X.success&&(u[R]=X.data?.id,_.push({student_id:R,score:ue})),X}))).filter(q=>!q.success);k.length?E(`${k.length}개 저장 실패`,"error"):(E("점수 저장됐어요","success"),me(e,"test",!0),e.querySelector(".test-saved-wrap").innerHTML=He(a,_),r()),x.disabled=!1,x.textContent="저장/수정"}),e.querySelectorAll(".score-input").forEach(f=>{f.addEventListener("input",()=>{const S=re(f.value),_=e.querySelector(`.grade-badge[data-sid="${f.dataset.sid}"]`);_&&(_.className=`grade-badge grade-${S}`,_.textContent=S||"—")})})}function te(e,t,a,n,s){const c=P(new Date),d=new Date(t,a-1,1),m=new Date(t,a,0),v=(d.getDay()+6)%7,u=[];for(let i=0;i<v;i++)u.push(null);for(let i=1;i<=m.getDate();i++)u.push(i);for(;u.length%7!==0;)u.push(null);const l=["월","화","수","목","금","토","일"],p=u.map(i=>{if(i===null)return'<span class="cp-cell cp-empty"></span>';const o=`${t}-${String(a).padStart(2,"0")}-${String(i).padStart(2,"0")}`;return`<button class="${["cp-cell",o===n?"cp-sel":"",o===c?"cp-tdy":""].filter(Boolean).join(" ")}" data-date="${o}">${i}</button>`}).join("");e.innerHTML=`
    <div class="cp-hd">
      <button class="cp-nav" id="cp-prev">‹</button>
      <span class="cp-title">${t}년 ${a}월</span>
      <button class="cp-nav" id="cp-next">›</button>
    </div>
    <div class="cp-grid">
      ${l.map(i=>`<span class="cp-dow">${i}</span>`).join("")}
      ${p}
    </div>`,e.querySelectorAll(".cp-cell[data-date]").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation(),s(i.dataset.date)})}),e.querySelector("#cp-prev").addEventListener("click",i=>{i.stopPropagation();const o=new Date(t,a-2,1);te(e,o.getFullYear(),o.getMonth()+1,n,s)}),e.querySelector("#cp-next").addEventListener("click",i=>{i.stopPropagation();const o=new Date(t,a,1);te(e,o.getFullYear(),o.getMonth()+1,n,s)})}function St(e,t,a,n){const s=pt(I(t)),c=P(new Date);e.innerHTML=mt.map((d,m)=>{const v=V(s,m),u=P(v),l=a(Z(v)).length>0;return`
      <button class="ws-day${u===t?" sel":""}${u===c?" tdy":""}" data-date="${u}">
        <span class="ws-label">${d}</span>
        <span class="ws-num">${v.getDate()}</span>
        <span class="ws-dot${l?"":" invisible"}"></span>
      </button>`}).join(""),e.querySelectorAll(".ws-day").forEach(d=>d.addEventListener("click",()=>n(d.dataset.date)))}async function Lt(e){let t=P(new Date),a=[],n={};e.innerHTML=`
    <div class="att-top">
      <div class="date-nav">
        <button class="date-nav-btn" id="btn-prev">◀</button>
        <div class="date-display">
          <div class="date-main" id="date-main"></div>
          <div class="date-sub"  id="date-sub"></div>
        </div>
        <button class="date-cal-btn" id="btn-cal" title="날짜 선택">📅</button>
        <button class="date-nav-btn" id="btn-next">▶</button>
      </div>
      <div id="cal-popup" class="cal-popup hidden"></div>
      <div class="week-strip" id="week-strip"></div>
    </div>
    <div id="acc-list" class="acc-list">
      <div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>
    </div>`;const s=e.querySelector("#acc-list"),c=e.querySelector("#week-strip"),d=e.querySelector("#date-main"),m=e.querySelector("#date-sub");function v(g){return a.filter(L=>(L.days||"").split(",").includes(g))}async function u(g){s.innerHTML='<div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>';const L=pe(g).dow,x=v(L);if(!x.length){s.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">${L}요일 수업 없음</div>
          <div class="empty-desc">이 날은 예정된 수업이 없어요</div>
        </div>`;return}const f=await Promise.all(x.map(S=>bt(S.id,g)));s.innerHTML=x.map((S,_)=>{const k=(S.student_ids||"").split(",").filter(Boolean).map(q=>n[q]).filter(Boolean);return yt(S,k,f[_])}).join(""),s.querySelectorAll(".ac-item").forEach((S,_)=>{const C=x[_],q=(C.student_ids||"").split(",").filter(Boolean).map(R=>n[R]).filter(Boolean);wt(S,C,q,g)})}async function l(g){t=g;const{main:L,sub:x}=pe(g);d.textContent=L,m.textContent=x,St(c,g,v,l),await u(g)}const[p,i]=await Promise.all([G(),U()]);a=p.success?p.data:[];const o=i.success?i.data:[];n=Object.fromEntries(o.map(g=>[g.id,g])),e.querySelector("#btn-prev").addEventListener("click",()=>l(P(V(I(t),-1)))),e.querySelector("#btn-next").addEventListener("click",()=>l(P(V(I(t),1))));const y=e.querySelector("#btn-cal"),r=e.querySelector("#cal-popup");let b=!1,$=null;function w(){r.classList.add("hidden"),b=!1,$&&(document.removeEventListener("click",$),$=null)}function h(){const g=I(t);te(r,g.getFullYear(),g.getMonth()+1,t,L=>{w(),l(L)}),r.classList.remove("hidden"),b=!0,setTimeout(()=>{$=L=>{!r.contains(L.target)&&L.target!==y&&w()},document.addEventListener("click",$)},0)}y.addEventListener("click",g=>{g.stopPropagation(),b?w():h()}),await l(t)}function H(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function Y(e){const[t,a,n]=e.split("-").map(Number);return new Date(t,a-1,n)}function Et(e){const t=new Date(e),a=(t.getDay()+6)%7;return t.setDate(t.getDate()-a),t}function se(e,t){const a=new Date(e);return a.setDate(a.getDate()+t),a}const xt=["일","월","화","수","목","금","토"],_t=["월","화","수","목","금","토","일"];function ae(e){return xt[e.getDay()]}function fe(e){const t=Y(e);return{main:`${t.getMonth()+1}월 ${t.getDate()}일`,sub:`${t.getFullYear()} · ${ae(t)}요일`,dow:ae(t)}}const kt={수학:"badge-math",영어:"badge-eng",국어:"badge-korean",과학:"badge-sci"};function qt(e){if(e===""||e==null)return"";const t=Number(e);return t>=90?"A":t>=70?"B":t>=50?"C":"D"}function jt(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ct(e,t,a){const{attendance:n,memo:s,scores:c}=a,d=Object.fromEntries(n.map(w=>[w.student_id,w])),m=Object.fromEntries(c.map(w=>[w.student_id,w]));let v=0,u=0,l=0;t.forEach(w=>{const h=d[w.id]?.status;h==="present"?v++:h==="late"?u++:h==="absent"&&l++});const p=s||n.length||c.length,i=t.map(w=>{const h=d[w.id],g=h?.status==="present"?["출석","res-present"]:h?.status==="late"?["지각","res-late"]:h?.status==="absent"?["결석","res-absent"]:["—","res-none"],[L,x]=g,f=h?.homework_pct!=null&&h?.homework_pct!==""?`<span class="res-hw">과제 ${h.homework_pct}%</span>`:"";return`
      <div class="res-att-row">
        <div class="s-avatar res-avatar">${w.name[0]}</div>
        <span class="res-name">${w.name}</span>
        <span class="res-badge ${x}">${L}</span>
        ${f}
      </div>`}).join(""),o=t.map(w=>{const h=m[w.id];if(!h||h.score==null||h.score==="")return"";const g=qt(h.score);return`
      <div class="res-score-row">
        <div class="s-avatar res-avatar">${w.name[0]}</div>
        <span class="res-name">${w.name}</span>
        <span class="res-score-val">${h.score}점</span>
        <span class="grade-badge grade-${g}">${g||"—"}</span>
      </div>`}).filter(Boolean).join(""),y=s?`<div class="res-section">
        <div class="res-section-title">📝 수업 메모</div>
        <div class="res-memo-box">${jt(s.memo||"")}</div>
       </div>`:"",r=i?`<div class="res-section">
        <div class="res-section-title">출결 현황</div>
        <div class="res-att-list">${i}</div>
       </div>`:"",b=o?`<div class="res-section">
        <div class="res-section-title">📊 테스트 결과</div>
        <div class="res-score-list">${o}</div>
       </div>`:"",$=!y&&!r&&!b?'<div class="res-empty">저장된 데이터가 없어요</div>':"";return`
    <div class="ac-item res-ac-item" data-cid="${e.id}">
      <div class="ac-header">
        <div class="ac-info">
          <span class="ac-name">${e.name}</span>
          <span class="ac-time">${e.time||""}</span>
        </div>
        <div class="ac-right">
          <span class="badge ${kt[e.subject]||"badge-etc"}">${e.subject}</span>
          <div class="att-pill${p?"":" res-pill-empty"}">
            <span class="pill-present">${v}출</span>
            <span class="pill-sep">·</span>
            <span class="pill-late">${u}지</span>
            <span class="pill-sep">·</span>
            <span class="pill-absent">${l}결</span>
          </div>
          <span class="ac-chevron">›</span>
        </div>
      </div>
      <div class="ac-body">
        ${y}
        ${r}
        ${b}
        ${$}
      </div>
    </div>`}async function Mt(e,t){const[a,n,s]=await Promise.all([le(e),K(e),ie(e)]),c=a.success?a.data:[],d=n.success?n.data:[],m=s.success?s.data:[],v=i=>{if(!i)return"";if(i instanceof Date)return H(i);const o=String(i);if(o.length===10)return o;const y=new Date(o);return isNaN(y)?o.slice(0,10):H(y)},u=c.filter(i=>v(i.date)===t),l=d.filter(i=>v(i.date)===t),p=m.filter(i=>v(i.date)===t);return console.log(`[results] cid=${e} date=${t}`),console.log(`[results] allAtt(${c.length}):`,c.slice(0,3)),console.log(`[results] filtered att(${u.length}):`,u),console.log(`[results] memos(${l.length}):`,l),console.log(`[results] scores(${p.length}):`,p),{attendance:u,memo:l.length?l[0]:null,scores:p}}function ne(e,t,a,n,s){const c=H(new Date),d=new Date(t,a-1,1),m=new Date(t,a,0),v=(d.getDay()+6)%7,u=[];for(let i=0;i<v;i++)u.push(null);for(let i=1;i<=m.getDate();i++)u.push(i);for(;u.length%7!==0;)u.push(null);const l=["월","화","수","목","금","토","일"],p=u.map(i=>{if(i===null)return'<span class="cp-cell cp-empty"></span>';const o=`${t}-${String(a).padStart(2,"0")}-${String(i).padStart(2,"0")}`;return`<button class="${["cp-cell",o===n?"cp-sel":"",o===c?"cp-tdy":""].filter(Boolean).join(" ")}" data-date="${o}">${i}</button>`}).join("");e.innerHTML=`
    <div class="cp-hd">
      <button class="cp-nav" id="cp-prev">‹</button>
      <span class="cp-title">${t}년 ${a}월</span>
      <button class="cp-nav" id="cp-next">›</button>
    </div>
    <div class="cp-grid">
      ${l.map(i=>`<span class="cp-dow">${i}</span>`).join("")}
      ${p}
    </div>`,e.querySelectorAll(".cp-cell[data-date]").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation(),s(i.dataset.date)})}),e.querySelector("#cp-prev").addEventListener("click",i=>{i.stopPropagation();const o=new Date(t,a-2,1);ne(e,o.getFullYear(),o.getMonth()+1,n,s)}),e.querySelector("#cp-next").addEventListener("click",i=>{i.stopPropagation();const o=new Date(t,a,1);ne(e,o.getFullYear(),o.getMonth()+1,n,s)})}function Tt(e,t,a,n){const s=Et(Y(t)),c=H(new Date);e.innerHTML=_t.map((d,m)=>{const v=se(s,m),u=H(v),l=a(ae(v)).length>0;return`
      <button class="ws-day${u===t?" sel":""}${u===c?" tdy":""}" data-date="${u}">
        <span class="ws-label">${d}</span>
        <span class="ws-num">${v.getDate()}</span>
        <span class="ws-dot${l?"":" invisible"}"></span>
      </button>`}).join(""),e.querySelectorAll(".ws-day").forEach(d=>d.addEventListener("click",()=>n(d.dataset.date)))}function Dt(e){const t=e.querySelector(".ac-header"),a=e.querySelector(".ac-body");let n=!1;function s(c){n=c,e.classList.toggle("open",c),a.style.maxHeight=c?a.scrollHeight+"px":"0"}t.addEventListener("click",()=>s(!n))}async function Ht(e){let t=H(new Date),a=[],n={};e.innerHTML=`
    <div class="att-top">
      <div class="date-nav">
        <button class="date-nav-btn" id="btn-prev">◀</button>
        <div class="date-display">
          <div class="date-main" id="date-main"></div>
          <div class="date-sub"  id="date-sub"></div>
        </div>
        <button class="date-cal-btn" id="btn-cal" title="날짜 선택">📅</button>
        <button class="date-nav-btn" id="btn-next">▶</button>
      </div>
      <div id="cal-popup" class="cal-popup hidden"></div>
      <div class="week-strip" id="week-strip"></div>
    </div>
    <div id="res-list" class="acc-list">
      <div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>
    </div>`;const s=e.querySelector("#res-list"),c=e.querySelector("#week-strip"),d=e.querySelector("#date-main"),m=e.querySelector("#date-sub");function v(g){return a.filter(L=>(L.days||"").split(",").includes(g))}async function u(g){s.innerHTML='<div class="loading-wrap"><div class="spinner"></div><span>불러오는 중...</span></div>';const L=fe(g).dow,x=v(L);if(!x.length){s.innerHTML=`
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">${L}요일 수업 없음</div>
          <div class="empty-desc">이 날은 예정된 수업이 없어요</div>
        </div>`;return}const f=await Promise.all(x.map(S=>Mt(S.id,g)));s.innerHTML=x.map((S,_)=>{const k=(S.student_ids||"").split(",").filter(Boolean).map(q=>n[q]).filter(Boolean);return Ct(S,k,f[_])}).join(""),s.querySelectorAll(".res-ac-item").forEach(S=>Dt(S))}async function l(g){t=g;const{main:L,sub:x}=fe(g);d.textContent=L,m.textContent=x,Tt(c,g,v,l),await u(g)}const[p,i]=await Promise.all([G(),U()]);a=p.success?p.data:[];const o=i.success?i.data:[];n=Object.fromEntries(o.map(g=>[g.id,g])),e.querySelector("#btn-prev").addEventListener("click",()=>l(H(se(Y(t),-1)))),e.querySelector("#btn-next").addEventListener("click",()=>l(H(se(Y(t),1))));const y=e.querySelector("#btn-cal"),r=e.querySelector("#cal-popup");let b=!1,$=null;function w(){r.classList.add("hidden"),b=!1,$&&(document.removeEventListener("click",$),$=null)}function h(){const g=Y(t);ne(r,g.getFullYear(),g.getMonth()+1,t,L=>{w(),l(L)}),r.classList.remove("hidden"),b=!0,setTimeout(()=>{$=L=>{!r.contains(L.target)&&L.target!==y&&w()},document.addEventListener("click",$)},0)}y.addEventListener("click",g=>{g.stopPropagation(),b?w():h()}),await l(t)}const Q=document.getElementById("page-container"),Ae=document.querySelectorAll(".nav-item"),At={students:et,classes:ut,attendance:Lt,results:Ht};let he=null;async function Be(e){if(e===he&&Q.children.length>0)return;he=e,Ae.forEach(a=>{a.classList.toggle("active",a.dataset.tab===e)}),Q.innerHTML="";const t=At[e];t&&await t(Q)}Ae.forEach(e=>{e.addEventListener("click",()=>Be(e.dataset.tab))});Be("students");
