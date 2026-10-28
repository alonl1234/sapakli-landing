// הדגמה מוקלטת – נתונים מ-docs/demo-results.md (28.10.2026). לא מחפש בזמן אמת.
const U='לא מאומת',SHIRTS=[
 ['Jiangxi Anka Clothing Co., Ltd.','₪15.5 ליח׳','לא ידוע'],
 ['Guangzhou Kangnai Apparel Co., Ltd.','₪7.91–₪18.98 ליח׳','100 יח׳'],
 ['Wuhan Nafu East Industry & Trade Co., Ltd.','₪4.75–₪6.3 ליח׳','200 יח׳']];
const log=document.getElementById('log'),chat=document.querySelector('.chat'),q=document.getElementById('q');
const slow=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
const el=(c,h)=>{const d=document.createElement('div');d.className='m '+c;d.innerHTML=h;log.appendChild(d);return d};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(t){
 chat.hidden=false;log.innerHTML='';el('u',esc(t));await wait(slow);
 const kind=/קופס|אריז/.test(t)?'box':/כסף|תכשיט|שרשר|925/.test(t)?'silver':/חולצ|טי|כותנה/.test(t)?'shirt':'other';
 el('a','לאן המשלוח — ישראל או מדינה אחרת?');await wait(slow);el('u','ישראל');await wait(slow);
 if(kind==='shirt'){
  el('a','מצאתי 3 ספקים. מחיר לפני משלוח, מכס ומע"מ:<div class="cards">'+SHIRTS.map(s=>
   `<article class="card"><h3 dir="ltr">${s[0]}</h3><span class="tag">${U}</span><dl><dt>מחיר</dt><dd>${s[1]}</dd><dt>מינימום</dt><dd>${s[2]}</dd></dl></article>`).join('')+'</div>');
 }else if(kind==='other'){
  el('a','בהדגמה יש רק דוגמת חולצות. לחיפוש אמיתי על הבקשה שלכם – התחברו (3 חינם).');
 }else el('a','עוד אין לנו ספקים מתאימים במאגר — לא נמציא. נחזור אליכם כשנמצא.');
 el('a cta','<a class="btn amber" href="#" data-auth="google">קבלו את התוצאות האמיתיות – Google, 3 חיפושים חינם</a>');
 chat.scrollIntoView({behavior:slow?'smooth':'auto',block:'nearest'});
}
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();run(q.value.trim()||'חולצות כותנה לנשים, 500 יח׳')});
document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{q.value=b.dataset.q;run(b.dataset.q)});
if(new URLSearchParams(location.search).has('try'))run(document.querySelector('[data-q]').dataset.q);

// reveal on scroll + typing placeholder
if(!slow||new URLSearchParams(location.search).has('shot')){}else{
 document.documentElement.classList.add('js');
 const io=new IntersectionObserver(es=>es.forEach((e,i)=>{if(e.isIntersecting){e.target.style.transitionDelay=(i*60)+'ms';e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.r').forEach(n=>io.observe(n));
 const ph=['חולצות כותנה לנשים, 500 יח׳','קופסאות מתנה ממותגות, 1000 יח׳','שרשראות כסף 925, 200 יח׳'];let k=0;
 (async function type(){for(;;){const t=ph[k++%ph.length];for(let i=0;i<=t.length;i++){if(q.value)return;q.placeholder=t.slice(0,i);await wait(55)}await wait(2200)}})();
}
const tr=document.querySelector('.track');if(tr)tr.innerHTML+=tr.innerHTML.replace(/<li>/g,'<li aria-hidden="true">');

// רשימת המתנה: מייל + צ׳אט (לא חובה). honeypot. קוד ההזמנה = קוד תוכנית ההפניות.
(()=>{const f=document.getElementById('wlf');if(!f)return;const m=document.getElementById('wlm'),box=document.getElementById('wli'),lnk=document.getElementById('lnk');
 const ref=new URLSearchParams(location.search).get('invite');
 f.addEventListener('submit',async e=>{e.preventDefault();const em=f.email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){m.textContent='בדקו את כתובת המייל.';f.email.focus();return}
  const b=f.querySelector('button');b.disabled=true;m.textContent='שולחים...';
  try{const r=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:em,chat:f.chat.value||null,ref:ref&&/^[A-Za-z0-9]{4,16}$/.test(ref)?ref:null,website:f.website.value||null})});
   if(r.status===404||r.status===405||r.status>=500){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!';return}
   const j=await r.json().catch(()=>({}));
   if(!r.ok){m.textContent=(j.detail&&(j.detail.message||j.detail))||'משהו השתבש, נסו שוב.';return}
   m.textContent='';f.hidden=true;box.hidden=false;
   if(j.invite_code){lnk.value=location.origin+'/?invite='+encodeURIComponent(j.invite_code)}else box.querySelector('.cp').hidden=true;
  }catch(_){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!'}finally{b.disabled=false}});
 document.getElementById('cpb').onclick=async()=>{lnk.select();try{await navigator.clipboard.writeText(lnk.value);m.textContent='הקישור הועתק.'}catch(_){document.execCommand('copy')}};
})();
