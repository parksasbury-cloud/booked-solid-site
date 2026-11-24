/* Booked Solid demo engine: one engine, per-industry presets. Demo only: no data is stored or sent. */
(function(){
const P=window.PRESET, $=s=>document.querySelector(s);
const st={svc:null,staff:null,day:null,time:null};
document.documentElement.style.setProperty('--brand',P.color);
document.title=P.biz+' · Book online (Booked Solid demo)';
const money=n=>'$'+n.toFixed(n%1?2:0);
const days=[];for(let i=1;days.length<7;i++){const d=new Date();d.setDate(d.getDate()+i);if(P.closed.includes(d.getDay()))continue;days.push(d)}
const slots=(d,svc)=>{const out=[];for(let m=P.open*60;m+svc.min<=P.close*60;m+=P.step){const k=(d.getDate()*7+m/30)|0;if(k%3===0)continue;out.push(m)}return out};
const fmt=m=>{const h=Math.floor(m/60),mm=m%60;return ((h+11)%12+1)+':'+String(mm).padStart(2,'0')+(h<12?' AM':' PM')};
const dl=d=>d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
function render(){
 const svc=st.svc;
 $('#app').innerHTML=`
 <header><div class="logo">${P.biz[0]}</div><div><h1>${P.biz}</h1><p>${P.tag}</p></div></header>
 <section><h2>1. ${P.words.service}</h2><div class="grid">${P.services.map((s,i)=>`<button class="card ${svc&&svc.i===i?'on':''}" data-svc="${i}"><b>${s.name}</b><span>${s.min>=60?(s.min/60)+' hr':s.min+' min'} · ${money(s.price)}</span><em>${s.deposit?'Deposit '+money(s.deposit):'No deposit'}</em></button>`).join('')}</div></section>
 ${svc?`<section><h2>2. ${P.words.staff}</h2><div class="grid">${P.staff.filter(x=>!x.only||x.only.includes(svc.i)).map((x,i)=>`<button class="card ${st.staff===x.name?'on':''}" data-staff="${x.name}"><b>${x.name}</b><span>${x.note}</span></button>`).join('')}</div></section>`:''}
 ${svc&&st.staff?`<section><h2>3. Pick a time</h2><div class="days">${days.map((d,i)=>`<button class="pill ${st.day===i?'on':''}" data-day="${i}">${dl(d)}</button>`).join('')}</div>${st.day!=null?`<div class="slots">${slots(days[st.day],svc).map(m=>`<button class="pill ${st.time===m?'on':''}" data-time="${m}">${fmt(m)}</button>`).join('')}</div>`:''}</section>`:''}
 ${svc&&st.staff&&st.time!=null?`<section><h2>4. ${P.words.intake}</h2><form id="f"><label>Name<input required></label><label>Email<input type="email" required></label><label>Phone<input required></label>${P.intake.map(q=>`<label>${q.q}${q.type==='select'?`<select>${q.opts.map(o=>`<option>${o}</option>`).join('')}</select>`:q.type==='area'?'<textarea rows="2"></textarea>':q.type==='check'?`<span class="chk"><input type="checkbox" required> ${q.opts}</span>`:'<input>'}</label>`).join('')}
 <div class="sum"><b>${svc.name}</b> with ${st.staff}<br>${dl(days[st.day])} at ${fmt(st.time)}<br>Total ${money(svc.price)} · <b>Due now: ${svc.deposit?money(svc.deposit)+' deposit':'$0'}</b></div>
 <p class="policy"><b>Cancellation policy:</b> ${P.policy}</p><button class="go">${svc.deposit?'Pay deposit & book (demo)':'Book (demo)'}</button></form></section>`:''}
 <footer>Demo with sample data · powered by <a href="/">Booked Solid</a></footer>`;
 document.querySelectorAll('[data-svc]').forEach(b=>b.onclick=()=>{st.svc={...P.services[b.dataset.svc],i:+b.dataset.svc};st.staff=null;st.day=null;st.time=null;render()});
 document.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>{st.staff=b.dataset.staff;render()});
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{st.day=+b.dataset.day;st.time=null;render()});
 document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{st.time=+b.dataset.time;render();$('#f').scrollIntoView()});
 const f=$('#f');if(f)f.onsubmit=e=>{e.preventDefault();$('#app').innerHTML=`<div class="done"><h1>You're booked ✓</h1><p>${st.svc.name} with ${st.staff}<br>${dl(days[st.day])} at ${fmt(st.time)}</p><p>${st.svc.deposit?money(st.svc.deposit)+' deposit collected (demo, nothing charged).':'No payment needed.'} Reminder texts go out ${P.remind}.</p><p class="policy">${P.policy}</p><button class="go" onclick="location.reload()">Start over</button></div>`};
}
const q=new URLSearchParams(location.search);
if(q.has('svc')){const i=+q.get('svc');st.svc={...P.services[i],i};const sf=P.staff.filter(x=>!x.only||x.only.includes(i));st.staff=sf[0].name;st.day=0;if(q.has('t'))st.time=P.open*60+P.step*(+q.get('t'))}
render();
})();
