/* Booked Solid demo engine: ONE engine, per-industry presets (presets.js). Demo only: nothing is stored, sent or charged.
   All art is drawn here as SVG (made by us, no third-party images). */
(function(){
const P=window.PRESETS[window.IND],$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement.style;
['brand:color','accent:accent','bg:bg','ink:ink','card:card','muted:muted','r:radius','fh:fontH'].forEach(p=>{const[a,b]=p.split(':');root.setProperty('--'+a,P[b])});
const lum=h=>{const n=parseInt(h.slice(1),16),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f(n>>8&255)+.0722*f(n&255)};
const dark=lum(P.bg)<.2;root.setProperty('--hl',dark?P.accent:P.color);root.setProperty('--line',dark?'#ffffff22':'#00000018');
if(P.upper)document.body.classList.add('up');if(dark)document.body.classList.add('dark');
document.title=P.biz+' · Book online (Booked Solid demo)';
const money=n=>'$'+(n%1?n.toFixed(2):n);
const durTxt=m=>m>=60?(m/60%1?(m/60).toFixed(1):m/60)+' hr':m+' min';
const fmt=m=>{const h=Math.floor(m/60),mm=m%60;return((h+11)%12+1)+':'+String(mm).padStart(2,'0')+(h<12?' AM':' PM')};
const MS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const dlong=d=>d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
const today=new Date();today.setHours(0,0,0,0);
const nth=(y,m,dow,n)=>{const d=new Date(y,m,1);let c=0;while(1){if(d.getDay()===dow&&++c===n)return d.getDate();d.setDate(d.getDate()+1)}};
const lastMon=(y,m)=>{const d=new Date(y,m+1,0);while(d.getDay()!==1)d.setDate(d.getDate()-1);return d.getDate()};
function holiday(d){const y=d.getFullYear(),m=d.getMonth(),n=d.getDate();
 if(m===0&&n===1)return"New Year's Day";if(m===6&&n===4)return"Independence Day";if(m===11&&n===25)return"Christmas Day";if(m===11&&n===24)return"Christmas Eve";if(m===11&&n===31)return"New Year's Eve";
 if(m===10&&n===nth(y,10,4,4))return"Thanksgiving";if(m===4&&n===lastMon(y,4))return"Memorial Day";if(m===8&&n===nth(y,8,1,1))return"Labor Day";return null}
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rng=seed=>()=>{seed=Math.imul(seed^seed>>>15,2246822507)>>>0;seed=(seed+0x9e3779b9)>>>0;return(seed>>>8)/16777216};
const busyCache={};
function busy(d,staff){const k=key(d)+staff;if(busyCache[k])return busyCache[k];const r=rng(hash(k)),out=[],n=Math.floor(r()*3);
 for(let i=0;i<n;i++){const len=[60,90][Math.floor(r()*2)],steps=Math.max(1,Math.floor(((P.close-P.open)*60-len)/P.step));const s=P.open*60+Math.floor(r()*steps)*P.step;out.push([s,s+len])}
 return busyCache[k]=out}
const st={view:'customer',svc:null,add:new Set(),staff:null,zip:'',zipOk:false,zipTried:false,freq:'once',month:0,day:null,time:null,done:false};
const staffFor=i=>P.staff.filter(x=>x.svcs.includes(i));
const dur=()=>st.svc.min+[...st.add].reduce((a,i)=>a+P.addons[i].min,0);
const total=()=>st.svc.price+[...st.add].reduce((a,i)=>a+P.addons[i].price,0);
const dayState=d=>{if(d<=today)return{ok:false,why:'past'};if(P.closed.includes(d.getDay()))return{ok:false,why:'Closed'};const h=holiday(d);if(h)return{ok:false,why:h+' (closed)'};
 const open=slotsFor(d).filter(x=>x.free).length;return open?{ok:true,open}:{ok:false,why:'Fully booked'}};
function slotsFor(d){if(!st.svc)return[];const names=st.staff==='any'?staffFor(st.svc.i).map(x=>x.name):[st.staff],len=dur(),out=[];
 for(let m=P.open*60;m+len<=P.close*60;m+=P.step){const who=names.find(n=>!busy(d,n).some(([a,b])=>m<b&&m+len>a));out.push({m,free:!!who,who})}return out}
/* ---------- art ---------- */
const svg=(w,h,inner,cls,label)=>`<svg class="${cls||''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'}>${inner}</svg>`;
const hsl=(h,s,l,a)=>`hsl(${h} ${s}% ${l}%${a!=null?' / '+a:''})`;
function motif(n,c){const L=`fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;
 const M={
 lotus:()=>[0,-60,60,-30,30].map(a=>`<ellipse cx="50" cy="52" rx="9" ry="26" transform="rotate(${a} 50 78)" ${L}/>`).join('')+`<path d="M18 80h64" ${L}/>`,
 dagger:()=>`<path d="M50 10l7 50H43zM36 60h28M50 60v26M45 86h10" ${L}/>`,
 geo:()=>[40,30,20,10].map((r,i)=>`<polygon points="${[0,1,2,3,4,5].map(k=>(50+r*Math.cos(k*Math.PI/3+i*.3)).toFixed(1)+','+(50+r*Math.sin(k*Math.PI/3+i*.3)).toFixed(1)).join(' ')}" ${L}/>`).join(''),
 rose:()=>`<path d="M50 50m0-4a4 4 0 1 1-4 4 9 9 0 1 1 9 9 15 15 0 1 1-15-15 22 22 0 1 1 22 22" ${L}/><path d="M50 84v10M50 90l-10-6M50 92l10-6" ${L}/>`,
 wave:()=>[30,45,60,75].map(y=>`<path d="M8 ${y}q10-14 21 0t21 0t21 0t21 0" ${L}/>`).join(''),
 moon:()=>`<path d="M62 18a32 32 0 1 0 20 52 26 26 0 0 1-20-52z" ${L}/><circle cx="76" cy="26" r="2" fill="${c}"/><circle cx="84" cy="40" r="1.6" fill="${c}"/>`,
 car:()=>`<path d="M10 62h80v-8l-12-4-10-14H34L24 50l-14 4z" ${L}/><circle cx="30" cy="64" r="8" ${L}/><circle cx="72" cy="64" r="8" ${L}/>`,
 dog:()=>`<circle cx="50" cy="54" r="22" ${L}/><path d="M32 40c-14-2-16 16-12 26M68 40c14-2 16 16 12 26" ${L}/><circle cx="42" cy="52" r="2.5" fill="${c}"/><circle cx="58" cy="52" r="2.5" fill="${c}"/><path d="M45 64q5 5 10 0" ${L}/>`,
 kitchen:()=>`<rect x="12" y="40" width="76" height="40" rx="3" ${L}/><path d="M12 56h76M32 40V80M60 24v16M52 24h16" ${L}/>`,
 bath:()=>`<path d="M14 52h72v10a16 16 0 0 1-16 16H30A16 16 0 0 1 14 62zM24 52V30a8 8 0 0 1 16 0" ${L}/>`,
 living:()=>`<path d="M16 62V46a8 8 0 0 1 8-8h52a8 8 0 0 1 8 8v16M10 62h80v14H10zM20 76v6M80 76v6" ${L}/>`,
 bedroom:()=>`<path d="M12 74V36M12 58h76v16M88 58V46a8 8 0 0 0-8-8H46v20" ${L}/><rect x="20" y="46" width="20" height="12" rx="4" ${L}/>`,
 room:()=>`<rect x="14" y="52" width="72" height="16" rx="6" ${L}/><path d="M22 68v14M78 68v14M30 52c0-10 8-14 20-14s20 4 20 14" ${L}/>`,
 stones:()=>`<ellipse cx="50" cy="76" rx="26" ry="9" ${L}/><ellipse cx="50" cy="60" rx="19" ry="7" ${L}/><ellipse cx="50" cy="46" rx="12" ry="5" ${L}/><path d="M24 30q4-12 12-14M76 30q-4-12-12-14" ${L}/>`,
 herbs:()=>`<path d="M50 90V30M50 70q-20-6-22-24 18 2 22 24zM50 56q20-6 22-24-18 2-22 24z" ${L}/>`,
 lounge:()=>`<path d="M20 70V50q0-12 12-12h36q12 0 12 12v20M14 70h72v10H14z" ${L}/><circle cx="50" cy="24" r="6" ${L}/>`,
 spark:()=>`<path d="M50 14l6 24 24 6-24 6-6 24-6-24-24-6 24-6zM80 70l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" ${L}/>`};
 return(M[n]||M.geo)()}
function tile(name,hue,i){const bgc=dark?hsl(hue,28,13+i%3*2):hsl(hue,45,90-i%3*3),fg=dark?hsl(hue,60,68):hsl(hue,45,32);
 return svg(100,100,`<rect width="100" height="100" fill="${bgc}"/><circle cx="${20+i*13%60}" cy="${15+i*29%50}" r="${26+i%3*8}" fill="${hsl(hue,50,dark?22:80,.5)}"/><g transform="translate(6 6) scale(.88)">${motif(name,fg)}</g>`,'tile',name+' sample illustration')}
function cover(){const c=P.color,a=P.accent,h=hash(window.IND)%360;
 const pat={tattoo:()=>[0,1,2,3,4,5].map(i=>`<g transform="translate(${i*140-20} ${(i%2)*40+10}) scale(1.4)" opacity=".28">${motif(['lotus','dagger','geo','rose','moon','wave'][i],a)}</g>`).join(''),
 detailing:()=>`<g opacity=".35"><path d="M-20 210q200-70 420-10t440-20" stroke="${a}" stroke-width="3" fill="none"/><path d="M-20 235q220-60 440 0t460-20" stroke="#fff" stroke-width="2" fill="none"/></g><g transform="translate(300 40) scale(2.6)" opacity=".5">${motif('car','#fff')}</g>`,
 cleaning:()=>[0,1,2,3,4].map(i=>`<g transform="translate(${i*170+10} ${30+i%2*60}) scale(1.3)" opacity=".5">${motif('spark',a)}</g>`).join('')+`<g transform="translate(560 30) scale(1.9)" opacity=".4">${motif('living','#fff')}</g>`,
 grooming:()=>[0,1,2,3,4,5,6].map(i=>`<g fill="${a}" opacity=".25" transform="translate(${i*120+10} ${20+(i*53)%110}) rotate(${i*23-40})"><ellipse cx="30" cy="40" rx="14" ry="11"/><circle cx="12" cy="22" r="6"/><circle cx="26" cy="12" r="6"/><circle cx="42" cy="12" r="6"/><circle cx="52" cy="24" r="6"/></g>`).join('')+`<g transform="translate(560 25) scale(2)" opacity=".55">${motif('dog','#fff')}</g>`,
 massage:()=>`<g transform="translate(340 30) scale(2.6)" opacity=".55">${motif('stones',a)}</g><g transform="translate(40 30) scale(1.8)" opacity=".35">${motif('herbs','#fff')}</g><g transform="translate(620 50) scale(1.8)" opacity=".35">${motif('herbs','#fff')}</g>`};
 return svg(800,230,`<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${dark?'#2a1015':hsl(h,50,18)}"/></linearGradient></defs><rect width="800" height="230" fill="url(#cg)"/>${pat[window.IND]()}`,'cover','')}
function bapanel(kind,clean){
 if(kind==='car'){const body=clean?'#2f7fb8':'#8a7a6a',spl=[[60,40],[110,66],[200,30],[250,70],[150,52],[90,80]].map(([x,y])=>`<circle cx="${x}" cy="${y+30}" r="${6+x%7}" fill="#5a4630" opacity=".75"/>`).join('');
  return svg(320,200,`<rect width="320" height="200" fill="${clean?'#dcecf6':'#cdbfae'}"/><rect y="150" width="320" height="50" fill="${clean?'#9fb6c6':'#8d8272'}"/><path d="M30 138h260v-24l-34-12-30-36H112l-30 36-52 12z" fill="${body}"/><path d="M116 70h58l24 30H90z" fill="${clean?'#cfe8f7':'#6e665c'}"/><circle cx="96" cy="142" r="22" fill="#222"/><circle cx="96" cy="142" r="10" fill="${clean?'#e8eef2':'#7a6f63'}"/><circle cx="236" cy="142" r="22" fill="#222"/><circle cx="236" cy="142" r="10" fill="${clean?'#e8eef2':'#7a6f63'}"/>${clean?'<path d="M60 112h200" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M262 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/><path d="M50 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/>':spl}`,'ba-art','')}
 const fur=clean?'#f1e4cf':'#a99471',tang=clean?'':[[110,60],[210,70],[130,150],[200,160],[160,40]].map(([x,y])=>`<path d="M${x} ${y}q10 14 0 28q-10 8-4 20" stroke="#6f5b3d" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')+'<circle cx="120" cy="170" r="9" fill="#5a4630" opacity=".8"/><circle cx="215" cy="130" r="7" fill="#5a4630" opacity=".8"/>';
 return svg(320,200,`<rect width="320" height="200" fill="${clean?'#fde8d4':'#dcd0c0'}"/><circle cx="160" cy="112" r="${clean?62:70}" fill="${fur}"/><ellipse cx="98" cy="96" rx="${clean?22:30}" ry="${clean?42:52}" fill="${clean?'#e3cfa9':'#8c785a'}"/><ellipse cx="222" cy="96" rx="${clean?22:30}" ry="${clean?42:52}" fill="${clean?'#e3cfa9':'#8c785a'}"/><circle cx="138" cy="106" r="7" fill="#2a1d14"/><circle cx="182" cy="106" r="7" fill="#2a1d14"/><ellipse cx="160" cy="132" rx="12" ry="9" fill="#2a1d14"/><path d="M148 146q12 12 24 0" stroke="#2a1d14" stroke-width="3" fill="none"/>${clean?'<path d="M138 56l22 14 22-14-8 24h-28z" fill="#e0713a"/><circle cx="160" cy="70" r="6" fill="#b8501f"/>':''}${tang}`,'ba-art','')}
function stars(n){return'<span class="stars" aria-label="'+n+' out of 5 stars">'+'★'.repeat(Math.round(n))+'<i>'+'★'.repeat(5-Math.round(n))+'</i></span>'}
function avatar(x){return svg(80,80,`<rect width="80" height="80" fill="${hsl(x.hue,45,dark?28:78)}"/><circle cx="40" cy="31" r="14" fill="${hsl(x.hue,35,dark?60:40)}"/><path d="M12 80q0-26 28-26t28 26z" fill="${hsl(x.hue,35,dark?60:40)}"/>`,'avatar',x.name+' sample portrait')}
/* ---------- render ---------- */
function hoursText(){const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],o=[];for(let i=0;i<7;i++)o.push(P.closed.includes(i)?'Closed':fmt(P.open*60)+' – '+fmt(P.close*60));
 const out=[];let s=0;for(let i=1;i<=7;i++){if(i===7||o[i]!==o[s]){out.push(`<div><span>${days[s]}${i-1>s?' – '+days[i-1]:''}</span><b>${o[s]}</b></div>`);s=i}}return out.join('')}
const isOpenNow=()=>{const n=new Date(),m=n.getHours()*60+n.getMinutes();return!P.closed.includes(n.getDay())&&!holiday(n)&&m>=P.open*60&&m<P.close*60};
const tel=P.phone.replace(/\D/g,'');
function business(){return`<div class="hero">${cover()}<span class="badge">Sample business · Booked Solid demo</span></div>
<section class="biz"><div class="logo" aria-hidden="true">${P.biz[0]}</div><div class="bt"><h1>${P.biz}</h1><p class="kind">${P.kind}</p><p class="rate">${stars(P.rating[0])} <b>${P.rating[0]}</b> · ${P.rating[1]} sample reviews</p></div>
<div class="acts"><a class="btn" href="tel:${tel}">Call</a><a class="btn" href="sms:${tel}">Text</a><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(P.addr)}">Directions</a><a class="btn pri" href="#book">Book now</a></div>
<p class="about">${P.about}</p><div class="facts"><div><h3>Hours <small>${isOpenNow()?'Open now':'Closed now'}</small></h3><div class="hrs">${hoursText()}</div><p class="hn">Holidays are blocked in the calendar.</p></div><div><h3>Find us</h3><p>${P.addr}</p><p><a href="tel:${tel}">${P.phone}</a></p></div></div></section>`}
function gallery(){const g=P.gallery;let body='';
 if(g.type==='grid'||g.type==='rooms')body=`<div class="gal ${g.type}">${g.items.map((x,i)=>tile(x[0],x[1],i)).join('')}</div>`;
 else body=`<div class="bas">${g.items.map(x=>`<figure class="ba"><div class="ba-box">${bapanel(x[0],false)}<div class="ba-after" style="clip-path:inset(0 0 0 50%)">${bapanel(x[0],true)}</div><i class="ba-line" style="left:50%"></i><span class="ba-l">Before</span><span class="ba-r">After</span><input type="range" min="0" max="100" value="50" aria-label="Before and after slider"></div><figcaption>${x[1]}</figcaption></figure>`).join('')}</div>`;
 return`<section class="sec"><h2>${g.title} <small>${g.note}</small></h2>${body}</section>`}
function staffCards(){return`<section class="sec"><h2>Meet the team</h2><div class="team">${P.staff.map(x=>`<article class="person">${avatar(x)}<div><h3>${x.name}</h3><p class="role">${x.role}</p><p>${x.bio}</p><p class="tags">${x.tags.map(t=>`<span>${t}</span>`).join('')}</p><p class="does">Does: ${x.svcs.map(s=>P.services[s].name).join(', ')}</p><button class="link" data-pick="${x.name}">Book with ${(x.name.includes(' - ')?x.name.split(' - ')[1]:x.name).split(' ')[0]} →</button></div></article>`).join('')}</div></section>`}
function reviews(){return`<section class="sec"><h2>Reviews <small>sample reviews</small></h2><div class="revs">${P.reviews.map(r=>`<blockquote><p>${stars(+r[1])} <b>${r[0]}</b></p><p>“${r[2]}”</p></blockquote>`).join('')}</div></section>`}
function step(n,t,body,ok){return`<div class="step ${ok?'ok':''}"><h3><span class="n">${ok?'✓':n}</span>${t}</h3>${body}</div>`}
function booking(){let n=0;const s=st.svc;let out=`<div id="book" class="bk-title"><h2>Book online</h2><p>Pick a service. The calendar below is checked live.</p></div>`;
 out+=step(++n,P.words.service,`<div class="grid">${P.services.map((x,i)=>`<button class="card ${s&&s.i===i?'on':''}" data-svc="${i}" aria-pressed="${!!(s&&s.i===i)}"><b>${x.name}</b><span class="d">${x.desc}</span><span class="m">${durTxt(x.min)} · ${x.price?money(x.price):'Free'}</span><em>${x.deposit?'Deposit '+money(x.deposit):x.price?'Pay at visit':'No payment'}</em></button>`).join('')}</div>`,!!s);
 if(!s)return out;
 const adds=P.addons.map((a,i)=>({a,i})).filter(x=>!x.a.svcs||x.a.svcs.includes(s.i));
 if(adds.length)out+=step(++n,'Add-ons <small>optional</small>',`<div class="grid">${adds.map(({a,i})=>`<button class="card sm ${st.add.has(i)?'on':''}" data-add="${i}" aria-pressed="${st.add.has(i)}"><b>${st.add.has(i)?'✓ ':'+ '}${a.name}</b><span class="m">${a.price?'+'+money(a.price):'Included'}${a.min?' · +'+a.min+' min':''}</span></button>`).join('')}</div>`,st.add.size>0);
 if(P.zone)out+=step(++n,'Do we come to you?',`<form id="zf" class="zip"><label>Your ZIP code<input id="zi" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${st.zip}" placeholder="e.g. ${P.zone.eg}"></label><button class="btn pri">Check</button></form>${st.zipTried?(st.zipOk?`<p class="good">✓ Yes, ${st.zip} is inside our ${P.zone.label}.</p>`:`<p class="bad">Sorry, ${st.zip||'that ZIP'} is outside our ${P.zone.label}. We serve: ${P.zone.zips.join(', ')}.</p>`):`<p class="hn">We serve ${P.zone.zips.length} ZIP codes. Try ${P.zone.eg}.</p>`}`,st.zipOk);
 if(P.zone&&!st.zipOk)return out;
 if(P.recurring)out+=step(++n,'How often?',`<div class="pills">${[['once','Just once'],['weekly','Weekly'],['biweekly','Every 2 weeks'],['monthly','Monthly']].map(([k,l])=>`<button class="pill ${st.freq===k?'on':''}" data-freq="${k}" aria-pressed="${st.freq===k}">${l}</button>`).join('')}</div>${st.freq!=='once'?'<p class="hn">Same crew each visit. Skip or pause with 48 hours notice. (Sample: 10% off recurring.)</p>':''}`,true);
 const sf=staffFor(s.i);
 out+=step(++n,P.words.staff,`<div class="grid">${sf.length>1?`<button class="card sm ${st.staff==='any'?'on':''}" data-staff="any" aria-pressed="${st.staff==='any'}"><b>First available</b><span class="m">Soonest opening with anyone</span></button>`:''}${sf.map(x=>`<button class="card sm ${st.staff===x.name?'on':''}" data-staff="${x.name}" aria-pressed="${st.staff===x.name}"><b>${x.name}</b><span class="m">${x.role}</span></button>`).join('')}</div>`,!!st.staff);
 if(!st.staff)return out;
 out+=step(++n,'Pick a day & time',calendar(),st.time!=null);
 if(st.time==null)return out;
 out+=step(++n,P.words.intake+' & payment',form(),false);return out}
function calendar(){const base=new Date(today.getFullYear(),today.getMonth()+st.month,1),first=base.getDay(),dim=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();let cells='';
 for(let i=0;i<first;i++)cells+='<span></span>';
 for(let d=1;d<=dim;d++){const dt=new Date(base.getFullYear(),base.getMonth(),d),ds=dayState(dt),k=key(dt),sel=st.day===k;
  const why=ds.ok?`${ds.open} openings`:(ds.why==='past'?'Past':ds.why);
  cells+=`<button class="day ${ds.ok?(ds.open<=3?'few':'avail'):'off'} ${sel?'on':''}" ${ds.ok?'':'disabled'} data-day="${k}" aria-label="${dlong(dt)}: ${why}" title="${why}"><b>${d}</b>${ds.ok?'<i></i>':ds.why==='past'?'':'<em>'+(ds.why.includes('(closed)')?'Hol.':ds.why==='Closed'?'Off':'Full')+'</em>'}</button>`}
 let sl='';if(st.day){const d=new Date(st.day+'T00:00:00'),list=slotsFor(d);sl=`<h4 class="sd">${dlong(d)}</h4><div class="slots">${list.map(x=>`<button class="pill ${x.free?'':'taken'} ${st.time===x.m?'on':''}" ${x.free?'':'disabled'} data-time="${x.m}">${fmt(x.m)}</button>`).join('')}</div><p class="hn">Struck-through times are already booked. This appointment takes ${durTxt(dur())}.</p>`}
 return`<div class="cal"><div class="calh"><button class="nav" data-m="-1" ${st.month<1?'disabled':''} aria-label="Previous month">‹</button><b>${MS[base.getMonth()]} ${base.getFullYear()}</b><button class="nav" data-m="1" ${st.month>=2?'disabled':''} aria-label="Next month">›</button></div><div class="dow">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="dgrid">${cells}</div><p class="legend"><span class="dotl a"></span>Open <span class="dotl f"></span>Almost full <span class="dotl x"></span>Off / holiday / full</p></div>${sl}`}
const slotWho=()=>{const d=new Date(st.day+'T00:00:00'),x=slotsFor(d).find(z=>z.m===st.time);return x&&x.who||P.staff[0].name};
function form(){const s=st.svc,due=s.deposit||0;
 const fld=q=>q.type==='check'?`<label class="chk"><input type="checkbox" required> <span>${q.opts}</span></label>`:`<label>${q.q}${q.type==='select'?`<select>${q.opts.map(o=>`<option>${o}</option>`).join('')}</select>`:q.type==='area'?'<textarea rows="2"></textarea>':q.type==='file'?'<input type="file" accept="image/*" disabled>':'<input>'}</label>`;
 const add=[...st.add].map(i=>`<div><span>${P.addons[i].name}</span><b>${P.addons[i].price?money(P.addons[i].price):'Included'}</b></div>`).join('');
 return`<form id="f" autocomplete="off"><div class="two"><label>Full name<input required autocomplete="name"></label><label>Phone (for text reminders)<input type="tel" required autocomplete="tel"></label></div><label>Email<input type="email" required autocomplete="email"></label>${P.intake.map(fld).join('')}
 <div class="sum"><h4>Your appointment</h4><p><b>${s.name}</b> with ${st.staff==='any'?slotWho():st.staff}<br>${dlong(new Date(st.day+'T00:00:00'))} at ${fmt(st.time)} · ${durTxt(dur())}${st.freq!=='once'?'<br>Repeats '+({weekly:'every week',biweekly:'every 2 weeks',monthly:'every month'})[st.freq]:''}</p><div><span>${s.name}</span><b>${s.price?money(s.price):'Free'}</b></div>${add}<div class="tot"><span>Total</span><b>${total()?money(total()):'Free'}</b></div><div class="due"><span>Due now</span><b>${due?money(due)+' deposit':'$0'}</b></div></div>
 ${due?`<div class="pay"><h4>Pay deposit <span class="demo">DEMO · nothing is charged</span></h4><label>Card number<input value="4242 4242 4242 4242" inputmode="numeric"></label><div class="two"><label>Expires<input value="12 / 29"></label><label>CVC<input value="123"></label></div><p class="hn">Real bookings use Stripe checkout. Deposits go straight to the business.</p></div>`:''}
 <p class="policy"><b>Cancellation policy:</b> ${P.policy}</p><button class="go">${due?'Pay '+money(due)+' deposit & book':'Confirm booking'}</button></form>`}
function ics(){const d=new Date(st.day+'T00:00:00'),p=n=>String(n).padStart(2,'0'),f=m=>d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(Math.floor(m/60))+p(m%60)+'00';
 return'data:text/calendar;charset=utf-8,'+encodeURIComponent(['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Booked Solid demo//EN','BEGIN:VEVENT','UID:demo-'+Date.now()+'@bookedsolidapp.com','DTSTAMP:'+f(0),'DTSTART:'+f(st.time),'DTEND:'+f(st.time+dur()),'SUMMARY:'+st.svc.name+' at '+P.biz,'LOCATION:'+P.addr,'END:VEVENT','END:VCALENDAR'].join('\r\n'))}
function confirmation(){const d=new Date(st.day+'T00:00:00'),who=st.staff==='any'?slotWho():st.staff,due=st.svc.deposit;
 return`<section class="done"><div class="check" aria-hidden="true">✓</div><h2>You're booked!</h2><p class="big">${st.svc.name} with ${who}<br>${dlong(d)} at ${fmt(st.time)}</p><p>${due?money(due)+' deposit received (demo, nothing was charged). ':'No payment needed. '}${P.addr}</p><div class="acts c"><a class="btn pri" download="appointment.ics" href="${ics()}">Add to calendar</a><button class="btn" data-restart>Book another</button></div></section>
 <section class="sec"><h2>What your customer gets <small>sent automatically</small></h2><div class="msgs"><div class="phone"><p class="from">${P.biz} · text message</p><div class="bub">Hi Alex, you're booked: ${st.svc.name} on ${d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at ${fmt(st.time)}. ${due?money(due)+' deposit received. ':''}Reply C to confirm or R to reschedule.</div><div class="bub">Reminder: tomorrow at ${fmt(st.time)}, ${P.addr}. Need to change it? Reply R.</div></div><div class="email"><p class="from">Email · Your appointment with ${P.biz}</p><p><b>${st.svc.name}</b><br>${dlong(d)} · ${fmt(st.time)}<br>${P.addr}</p><p class="hn">Reminders sent ${P.remind}.<br>Cancellation: ${P.policy}</p></div></div></section>`}
function owner(){const o=P.owner,wk=[420,640,310,780,950,520,160],m=Math.max(...wk);
 return`<section class="sec own"><h2>Today <small>${today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · sample data</small></h2><div class="stats">${o.stats.map(s=>`<div class="stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('')}</div>
 <h3>Schedule</h3><div class="sched">${o.rows.map(r=>`<div class="row"><b class="t">${r[0]}</b><div><b>${r[1]}</b><span>${r[2]} · ${r[3]}</span></div><em class="tag">${r[4]}</em></div>`).join('')}</div>
 <h3>Deposits collected this week</h3><div class="bars" role="img" aria-label="Bar chart of deposits collected per day this week, sample data">${wk.map((v,i)=>`<div><b>$${v}</b><i style="height:${Math.round(v/m*100)}%"></i><span>${'MTWTFSS'[i]}</span></div>`).join('')}</div>
 <h3>Reminders <small>automatic</small></h3><p class="hn">Texts and emails go out ${P.remind}. Customers confirm, reschedule or cancel from the message, and late changes follow your policy automatically.</p>
 <h3>AI receptionist call log <span class="addon">Optional add-on · preview</span></h3><div class="sched">${o.calls.map(c=>`<div class="row"><b class="t">${c[0]}</b><div><b>${c[1]}</b><span>${c[2]}</span></div><em class="tag">${c[3]}</em></div>`).join('')}</div><p class="hn">Preview with invented calls. The receptionist add-on answers your phone 24/7, books into this same calendar and texts the customer a deposit link.</p></section>
 <section class="sec cta"><h2>Want this for your business?</h2><p>We set it up with your services, staff and hours. Customers book from your link; deposits go straight to you.</p><a class="btn pri" href="/">See Booked Solid</a></section>`}
function render(){
 const tabs=`<nav class="top"><span>Booked Solid demo · sample data</span><div class="seg" role="tablist"><button role="tab" aria-selected="${st.view==='customer'}" data-view="customer">Customer view</button><button role="tab" aria-selected="${st.view==='owner'}" data-view="owner">Owner view</button></div></nav>`;
 let main;if(st.view==='owner')main=owner();else if(st.done)main=confirmation();else main=business()+gallery()+staffCards()+`<section class="sec bk">${booking()}</section>`+reviews();
 $('#app').innerHTML=tabs+'<main>'+main+'</main><footer>Demo with invented sample data. Nothing is stored, sent or charged. · Powered by <a href="/">Booked Solid</a></footer>';
 bind()}
const q=new URLSearchParams(location.search),auto=q.has('auto');
function bind(){
 $$('[data-view]').forEach(b=>b.onclick=()=>{st.view=b.dataset.view;render();scrollTo(0,0)});
 $$('[data-svc]').forEach(b=>b.onclick=()=>{const i=+b.dataset.svc;st.svc={...P.services[i],i};st.add=new Set();if(st.staff&&st.staff!=='any'&&!staffFor(i).some(x=>x.name===st.staff))st.staff=null;st.day=null;st.time=null;render()});
 $$('[data-add]').forEach(b=>b.onclick=()=>{const i=+b.dataset.add;st.add.has(i)?st.add.delete(i):st.add.add(i);st.time=null;render()});
 $$('[data-staff]').forEach(b=>b.onclick=()=>{st.staff=b.dataset.staff;st.day=null;st.time=null;render()});
 $$('[data-pick]').forEach(b=>b.onclick=()=>{const x=P.staff.find(y=>y.name===b.dataset.pick);if(!st.svc||!x.svcs.includes(st.svc.i)){const i=x.svcs[0];st.svc={...P.services[i],i};st.add=new Set()}st.staff=x.name;st.day=null;st.time=null;render();$('#book').scrollIntoView({behavior:'smooth'})});
 $$('[data-freq]').forEach(b=>b.onclick=()=>{st.freq=b.dataset.freq;render()});
 $$('[data-m]').forEach(b=>b.onclick=()=>{st.month+=+b.dataset.m;render()});
 $$('[data-day]').forEach(b=>b.onclick=()=>{st.day=b.dataset.day;st.time=null;render()});
 $$('[data-time]').forEach(b=>b.onclick=()=>{st.time=+b.dataset.time;render();const f=$('#f');if(f)f.scrollIntoView({behavior:'smooth',block:'start'})});
 $$('[data-restart]').forEach(b=>b.onclick=()=>{Object.assign(st,{svc:null,add:new Set(),staff:null,day:null,time:null,done:false,freq:'once'});render();scrollTo(0,0)});
 const zf=$('#zf');if(zf)zf.onsubmit=e=>{e.preventDefault();st.zip=$('#zi').value.trim();st.zipTried=true;st.zipOk=P.zone.zips.includes(st.zip);render()};
 const f=$('#f');if(f)f.onsubmit=e=>{e.preventDefault();st.done=true;render();scrollTo(0,0)};
 $$('.ba').forEach(fig=>{const r=fig.querySelector('input'),a=fig.querySelector('.ba-after'),l=fig.querySelector('.ba-line');r.oninput=()=>{a.style.clipPath=`inset(0 0 0 ${r.value}%)`;l.style.left=r.value+'%'}})}
if(q.get('view')==='owner')st.view='owner';
if(auto){const i=+(q.get('svc')||1);st.svc={...P.services[i],i};if(q.has('add'))q.get('add').split(',').forEach(k=>st.add.add(+k));
 if(P.zone){st.zip=P.zone.eg;st.zipOk=st.zipTried=true}if(q.get('freq'))st.freq=q.get('freq');
 st.staff=q.get('staff')==='any'?'any':staffFor(i)[0].name;
 for(let d=1;d<60;d++){const dt=new Date(today);dt.setDate(today.getDate()+d);if(dayState(dt).ok){st.day=key(dt);st.month=(dt.getFullYear()-today.getFullYear())*12+dt.getMonth()-today.getMonth();break}}
 const free=slotsFor(new Date(st.day+'T00:00:00')).filter(x=>x.free);if(q.get('auto')!=='cal'&&free.length)st.time=free[Math.min(+(q.get('t')||2),free.length-1)].m;
 if(q.get('auto')==='done')st.done=true}
render();
})();
