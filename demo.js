// הדגמה: אם window.SAPAKLI_API מוגדר (config.js) — חיפוש אמיתי מול השרת; אחרת הקלטה מ-docs/demo-results.md (28.10.2026).
const API=(window.SAPAKLI_API||'').replace(/\/$/,'');
// "לפני שמשלמים" — זהה ל-app/vetting.py BEFORE_YOU_PAY (מחקר Reddit 28.10.2026). בלי מחירים.
const BYP={title:'לפני שמשלמים',items:[
 'שיחת וידאו חיה מתוך המפעל (לא סרטון מוקלט). סירוב הוא סימן אזהרה.',
 'דוגמת ייצור לפני ייצור מלא, עם מפרט שאושר בכתב.',
 'בדיקה של חברת בדיקה חיצונית לפני תשלום היתרה.',
 'שם המוטב והבנק בהעברה תואמים לשם ברישיון העסק ובחשבונית.'],
 note:'את הצעדים האלה עושים בעצמכם מול הספק. אנחנו לא מבצעים אותם ולא גובים עליהם.'};
const REG_NOTE='רישום ברשם הסיני: נדרשת בדיקה ידנית. תג Alibaba Verified/Gold ו-Trade Assurance לא נחשבים אצלנו אימות.';
function byp(b){b=b&&Array.isArray(b.items)?{title:b.title,items:b.items.map(i=>i.label||i),note:b.note}:BYP;
 return `<div class="byp" role="note"><strong>${esc(b.title||BYP.title)}</strong><ul>${b.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>${b.note?`<small>${esc(b.note)}</small>`:''}</div>`}
const SHIRTS=[
 ['Jiangxi Anka Clothing Co., Ltd.','₪16 ליח׳','לא ידוע'],
 ['Guangzhou Kangnai Apparel Co., Ltd.','₪8–19 ליח׳','100 יח׳'],
 ['Wuhan Nafu East Industry & Trade Co., Ltd.','₪5–6 ליח׳','200 יח׳']];
const log=document.getElementById('log'),chat=document.querySelector('.chat'),q=document.getElementById('q'),go=document.getElementById('go');let busy=false;
const slow=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
const dots=()=>{const d=el('a typing','<span></span><span></span><span></span>');d.setAttribute('aria-label','מקליד');return d};
const el=(c,h)=>{const d=document.createElement('div');d.className='m '+c;d.innerHTML=h;log.appendChild(d);return d};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sid='demo-'+Math.random().toString(36).slice(2,12);let pending=false;
const okUrl=u=>typeof u==='string'&&/^https:\/\/[^\s"'<>]+$/.test(u)?u:null;
const fmtDate=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d||'');return m?`${+m[3]}.${+m[2]}.${m[1]}`:''};
function card(s){const v=s.verification||null;const st=v&&v.status==='partial'?['part','נבדק חלקית']:s.verified?['part','מאומת']:['no','לא מאומת'];
 let h=`<article class="card"><h3 dir="ltr">${esc(s.name)}</h3><span class="vb ${st[0]}">${st[1]}</span><dl><dt>מחיר</dt><dd>${esc((s.price||'').replace(/^מחיר:\s*/,''))}</dd><dt>מינימום</dt><dd>${esc((s.moq||'').replace(/^מינימום הזמנה:\s*/,''))}</dd></dl>`;
 if(v){h+='<ul class="vck">'+(v.checks||[]).map(c=>`<li class="${c.ok?'ok':'bad'}">${esc(c.label)}${c.evidence&&!okUrl(c.evidence)?': '+esc(c.evidence):''}${okUrl(c.source)?` (<a href="${esc(c.source)}" target="_blank" rel="noopener nofollow">מקור</a>)`:''}</li>`).join('')+
  (v.not_checked||[]).map(n=>`<li class="na">עוד לא נבדק: ${esc(n)}</li>`).join('')+'</ul>';
  (v.cautions||[]).forEach(c=>h+=`<small>${esc(c)}</small>`);if(v.claims_note)h+=`<small>${esc(v.claims_note)}</small>`;}
 const rg=s.registry||(v&&v.registry);if(!rg||rg.registry_status==='manual_check_needed')h+=`<small>${esc(REG_NOTE)}</small>`;
 else{const rs=okUrl(rg.registry_source);const RS={active:['ok','רישום פעיל ברשם'],revoked:['bad','הרישום בוטל'],cancelled:['bad','הרישום נמחק'],abnormal:['bad','סטטוס חריג ברשם'],unknown:['na','סטטוס ברשם לא ידוע']}[rg.registry_status]||['na','סטטוס ברשם לא ידוע'];
  const BT={factory:'מפעל',trading_company:'חברת סחר (מתווך)'}[rg.business_type];const LN={match:['ok','שם משפטי תואם'],mismatch:['bad','שם משפטי לא תואם']}[rg.legal_name_match];
  h+='<ul class="vck reg">'+`<li class="${RS[0]}">${RS[1]}${rs?` (<a href="${esc(rs)}" target="_blank" rel="noopener nofollow">מקור</a>)`:''}${rg.registry_checked_at?' · '+fmtDate(rg.registry_checked_at):''}</li>`+(LN?`<li class="${LN[0]}">${LN[1]}</li>`:'')+(BT?`<li class="na">סוג עסק: ${BT}</li>`:'')+'</ul>'}
 const w=okUrl(s.website);if(w)h+=`<p class="src"><a href="${esc(w)}" target="_blank" rel="noopener nofollow">אתר הספק</a>${v&&v.checked_at?' · נבדק ב-'+fmtDate(v.checked_at):''}</p>`;
 return h+'</article>'}
async function live(t){const r=await fetch(API+'/api/demo/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request:t,session_id:sid})});
 const j=await r.json().catch(()=>({}));if(r.status===402)return{s:'quota'};if(r.status===429)return{s:'rate'};if(!r.ok)throw new Error(r.status);return{s:'ok',j}}
async function run(t){if(busy)return;busy=true;go.disabled=true;chat.setAttribute('aria-busy','true');
 try{chat.hidden=false;if(!pending)log.innerHTML='';el('u',esc(t));chat.scrollIntoView({behavior:slow?'smooth':'auto',block:'nearest'});let d=dots();
 if(API){try{const r=await live(t);d.remove();document.getElementById('mode').textContent='חיפוש אמיתי במאגר · מידע, לא המלצה';
   if(r.s==='quota'){pending=false;el('a','נגמרו 3 החיפושים החינמיים להיום. הם מתחדשים כל 72 שעות. רוצים יותר? הצטרפו לרשימה, ועל כל חבר שמצטרף ומחפש תקבלו 3 חיפושים נוספים.')}
   else if(r.s==='rate'){el('a','יותר מדי בקשות. נסו שוב בעוד דקה.')}
   else{const j=r.j;if(j.status==='question'){pending=true;el('a',esc(j.question||j.reply));q.value='';q.focus();return}
    pending=false;if(j.status==='blocked'){el('a',esc(j.reply))}
    else if(j.suppliers&&j.suppliers.length){el('a',esc(j.summary||'')+'. המחיר לפני משלוח, מכס ומע"מ:<div class="cards">'+j.suppliers.map(card).join('')+'</div>'+byp(j.before_you_pay))}
    else el('a',esc(j.note||'עוד אין לנו ספקים מתאימים במאגר, ולא נמציא כאלה.'));
    if(typeof j.left==='number')el('a',`נשארו לכם ${j.left} חיפושים חינמיים.`)}
   el('a cta','<a class="btn amber" href="#waitlist">רוצים את זה בצ׳אט שלכם? הצטרפו לרשימה</a> <button type="button" class="lnkb" id="again">חיפוש אחר</button>');
   document.getElementById('again').onclick=()=>{pending=false;q.value='';q.focus()};return}catch(_){/* נופלים להקלטה */}}
 await wait(slow);d.remove();pending=false;
 const kind=/קופס|אריז/.test(t)?'box':/כסף|תכשיט|שרשר|925/.test(t)?'silver':/חולצ|טי|כותנה/.test(t)?'shirt':'other';
 el('a','לאן המשלוח, לישראל או למדינה אחרת?');await wait(slow);el('u','ישראל');d=dots();await wait(slow*1.4);d.remove();
 if(kind==='shirt'){
  el('a','הנה ספקים שמצאתי. המחיר לפני משלוח, מכס ומע"מ, מעוגל, לפי 3.06 ₪ לדולר (28.10.2026):<div class="cards">'+SHIRTS.map(s=>
   `<article class="card"><h3 dir="ltr">${s[0]}</h3><span class="vb no">לא מאומת</span><dl><dt>מחיר</dt><dd>${s[1]}</dd><dt>מינימום</dt><dd>${s[2]}</dd></dl></article>`).join('')+'</div>'+`<small>${esc(REG_NOTE)}</small>`+byp());
 }else if(kind==='other'){
  el('a','ההדגמה המוקלטת כוללת רק דוגמת חולצות. החיפוש האמיתי ייפתח כשהשרת יהיה זמין.');
 }else el('a','בהדגמה המוקלטת אין דוגמה לזה. במאגר יש ספקים לאריזות ולתכשיטי כסף, והם יופיעו כשהשרת יהיה זמין.');
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
  try{if(!API){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!';return}
   const r=await fetch(API+'/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:em,chat:f.chat.value||null,ref:ref&&/^[A-Za-z0-9]{4,16}$/.test(ref)?ref:null,website:f.website.value||null,turnstile_token:(f.querySelector('[name="cf-turnstile-response"]')||{}).value||null})});
   if(window.turnstile)try{turnstile.reset()}catch(_){}
   if(r.status===404||r.status===405||r.status>=500){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!';return}
   const j=await r.json().catch(()=>({}));
   if(!r.ok){m.textContent=(j.detail&&(j.detail.message||j.detail))||'משהו השתבש, נסו שוב.';return}
   m.textContent='';f.hidden=true;box.hidden=false;if(j.position)document.getElementById('pos').textContent=`, מקום ${j.position} בתור`;
   if(j.invite_code){lnk.value=location.origin+location.pathname+'?invite='+encodeURIComponent(j.invite_code)}else box.querySelector('.cp').hidden=true;
  }catch(_){m.textContent='רשימת ההמתנה תיפתח בקרוב. תודה על הסבלנות!'}finally{b.disabled=false;b.removeAttribute('aria-busy')}});
 f.email.addEventListener('input',()=>{if(f.email.hasAttribute('aria-invalid')){f.email.removeAttribute('aria-invalid');m.textContent='';m.className='wlm'}});
 document.getElementById('cpb').onclick=async()=>{lnk.select();try{await navigator.clipboard.writeText(lnk.value);m.textContent='הקישור הועתק.'}catch(_){document.execCommand('copy')}};
})();

(()=>{const st=document.getElementById('stk'),w=document.getElementById('waitlist'),h=document.getElementById('try');if(!st||!('IntersectionObserver'in window))return;const vis=new Set();const io2=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target));st.classList.toggle('off',vis.size>0)});[w,h].forEach(n=>n&&io2.observe(n))})();
