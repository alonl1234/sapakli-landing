// הדגמה מוקלטת – נתונים מ-docs/demo-results.md (28.10.2026). לא מחפש בזמן אמת.
const U='לא מאומת',SHIRTS=[
 ['Jiangxi Anka Clothing Co., Ltd.','₪15.5 ליח׳','לא ידוע'],
 ['Guangzhou Kangnai Apparel Co., Ltd.','₪7.91–₪18.98 ליח׳','100 יח׳'],
 ['Wuhan Nafu East Industry & Trade Co., Ltd.','₪4.75–₪6.3 ליח׳','200 יח׳']];
const log=document.getElementById('log'),chat=document.querySelector('.chat'),q=document.getElementById('q'),go=document.getElementById('go');let busy=false;
const slow=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
const dots=()=>{const d=el('a typing','<span></span><span></span><span></span>');d.setAttribute('aria-label','מקליד');return d};
const el=(c,h)=>{const d=document.createElement('div');d.className='m '+c;d.innerHTML=h;log.appendChild(d);return d};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(t){if(busy)return;busy=true;go.disabled=true;chat.setAttribute('aria-busy','true');
 try{chat.hidden=false;log.innerHTML='';el('u',esc(t));chat.scrollIntoView({behavior:slow?'smooth':'auto',block:'nearest'});let d=dots();await wait(slow);d.remove();
 const kind=/קופס|אריז/.test(t)?'box':/כסף|תכשיט|שרשר|925/.test(t)?'silver':/חולצ|טי|כותנה/.test(t)?'shirt':'other';
 el('a','לאן המשלוח, לישראל או למדינה אחרת?');await wait(slow);el('u','ישראל');d=dots();await wait(slow*1.4);d.remove();
 if(kind==='shirt'){
  el('a','הנה ספקים שמצאתי. המחיר לפני משלוח, מכס ומע"מ:<div class="cards">'+SHIRTS.map(s=>
   `<article class="card"><h3 dir="ltr">${s[0]}</h3><span class="tag">${U}</span><dl><dt>מחיר</dt><dd>${s[1]}</dd><dt>מינימום</dt><dd>${s[2]}</dd></dl></article>`).join('')+'</div>');
 }else if(kind==='other'){
  el('a','ההדגמה מוקלטת ויש בה רק דוגמת חולצות. החיפוש האמיתי על הבקשה שלכם ייפתח עם החיבור לצ׳אט.');
 }else el('a','עוד אין לנו ספקים מתאימים במאגר, ולא נמציא כאלה. נוסיף כשנמצא ספקים אמיתיים.');
 el('a cta','<a class="btn amber" href="#waitlist">רוצים את זה בצ׳אט שלכם? הצטרפו לרשימה</a> <button type="button" class="lnkb" id="again">חיפוש אחר</button>');
 document.getElementById('again').onclick=()=>{q.value='';q.focus()};
 }finally{busy=false;go.disabled=false;chat.removeAttribute('aria-busy')}
}
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();run(q.value.trim()||'חולצות כותנה לנשים, 500 יח׳')});
document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{q.value=b.dataset.q;run(b.dataset.q)});
if(new URLSearchParams(location.search).has('try'))run(document.querySelector('[data-q]').dataset.q);

// reveal on scroll + typing placeholder
if(!slow||new URLSearchParams(location.search).has('shot')){}else{
 document.documentElement.classList.add('js');
 const io=new IntersectionObserver(es=>es.forEach((e,i)=>{if(e.isIntersecting){e.target.style.transitionDelay=(i*60)+'ms';e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.r').forEach(n=>io.observe(n));
}
const tr=document.querySelector('.track');if(tr)tr.innerHTML+=tr.innerHTML.replace(/<li>/g,'<li aria-hidden="true">');

// רשימת המתנה: מייל + צ׳אט (לא חובה). honeypot. קוד ההזמנה = קוד תוכנית ההפניות.
(()=>{const f=document.getElementById('wlf');if(!f)return;const m=document.getElementById('wlm'),box=document.getElementById('wli'),lnk=document.getElementById('lnk');
 const ref=new URLSearchParams(location.search).get('invite');
 f.addEventListener('submit',async e=>{e.preventDefault();const em=f.email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){m.textContent=em?'כתובת המייל לא נראית תקינה. למשל: name@gmail.com':'כתבו כתובת מייל כדי להצטרף.';m.className='wlm err';f.email.setAttribute('aria-invalid','true');f.email.focus();return}
  f.email.removeAttribute('aria-invalid');m.className='wlm';
  const b=f.querySelector('button');b.disabled=true;b.setAttribute('aria-busy','true');m.textContent='שולחים...';
  try{const r=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:em,chat:f.chat.value||null,ref:ref&&/^[A-Za-z0-9]{4,16}$/.test(ref)?ref:null,website:f.website.value||null})});
   if(r.status===404||r.status===405||r.status>=500){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!';return}
   const j=await r.json().catch(()=>({}));
   if(!r.ok){m.textContent=(j.detail&&(j.detail.message||j.detail))||'משהו השתבש, נסו שוב.';return}
   m.textContent='';f.hidden=true;box.hidden=false;
   if(j.invite_code){lnk.value=location.origin+'/?invite='+encodeURIComponent(j.invite_code)}else box.querySelector('.cp').hidden=true;
  }catch(_){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!'}finally{b.disabled=false;b.removeAttribute('aria-busy')}});
 f.email.addEventListener('input',()=>{if(f.email.hasAttribute('aria-invalid')){f.email.removeAttribute('aria-invalid');m.textContent='';m.className='wlm'}});
 document.getElementById('cpb').onclick=async()=>{lnk.select();try{await navigator.clipboard.writeText(lnk.value);m.textContent='הקישור הועתק.'}catch(_){document.execCommand('copy')}};
})();

(()=>{const st=document.getElementById('stk'),w=document.getElementById('waitlist'),h=document.getElementById('try');if(!st||!('IntersectionObserver'in window))return;const vis=new Set();const io2=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target));st.classList.toggle('off',vis.size>0)});[w,h].forEach(n=>n&&io2.observe(n))})();
