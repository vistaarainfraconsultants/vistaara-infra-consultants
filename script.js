/* =========================================================
   VISTAARA INFRA CONSULTANTS — SITE SCRIPT

   Content is picked up automatically from the folders:
     images/   "Project Discussion NN", "Team Photo NN"  → About photos
               "... Video ..."                           → About videos
               "Employee_NN_Name_Designation"            → Engineering team
               "Gallery NN"                              → Gallery
     projects/<folder>/project.json (+ its image)        → Projects
     careers/<folder>/job.json                           → Careers

   The file list comes from content.js (run tools/update-content.py,
   or let the GitHub Action do it). If content.js is missing and the
   site is served from GitHub, the GitHub repository is listed instead.
========================================================= */

(() => {
'use strict';

/* ---------- configuration ---------- */
const GITHUB = {owner:'vistaarainfraconsultants', repo:'vistaara-infra-consultants', branch:'main'};
const TREE_CACHE = {key:'vistaara-repo-tree-v3', ms:2*60*1000};
const IMAGE_EXT = ['jpg','jpeg','png','webp','gif','avif'];
const VIDEO_EXT = ['mp4','webm','ogg','m4v','mov'];

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const byName = (a,b) => a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});
const extOf = n => (n.split('.').pop()||'').toLowerCase();
const isImage = n => IMAGE_EXT.includes(extOf(n));
const isVideo = n => VIDEO_EXT.includes(extOf(n));
const norm = n => n.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const stripExt = n => n.replace(/\.[^/.]+$/,'');
const encPath = p => p.split('/').map(encodeURIComponent).join('/');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// DOM helper — text always goes in as text, never as HTML
function el(tag,attrs={},...kids){
  const e=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)) k==='class'?e.className=v:e.setAttribute(k,v);
  kids.flat().forEach(c=>{if(c!==null&&c!==undefined&&c!=='')e.append(c instanceof Node?c:document.createTextNode(c))});
  return e;
}

/* ---------- scroll reveals ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
const watchReveals = root => root.querySelectorAll('.reveal:not(.in)').forEach((x,i)=>{x.style.transitionDelay=(i%3)*90+'ms';io.observe(x)});
watchReveals(document);

/* ---------- counters ---------- */
function countUp(b){
  const n=+b.dataset.count,suf=b.dataset.suf||'';
  if(reduceMotion){b.textContent=n+suf;return}
  let t0;const f=t=>{t0??=t;const p=Math.min((t-t0)/1400,1);b.textContent=Math.round(n*(1-Math.pow(1-p,4)))+suf;if(p<1)requestAnimationFrame(f)};
  requestAnimationFrame(f);
}
const co = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.dataset.done='1';countUp(e.target);co.unobserve(e.target)}}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(b=>co.observe(b));
function setStat(id,n){const b=$(id);if(!b||!n)return;b.dataset.count=n;if(b.dataset.done)b.textContent=n+(b.dataset.suf||'')}

/* ---------- navigation: theme follows the section underneath, active link, mobile menu ---------- */
const nav=$('nav'), toggle=$('menu-toggle');
function navTheme(){
  const y=nav.getBoundingClientRect().bottom-10;
  const under=[...document.querySelectorAll('header.hero,.band,section,.cta,footer')].filter(s=>{const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y});
  const s=under[under.length-1]; // innermost wins, so the orange contact card counts as dark
  if(s){const light=s.classList.contains('light');nav.classList.toggle('light',light);nav.classList.toggle('dark',!light)}
  const links=[...nav.querySelectorAll('.nav-links a:not(.m-only)')];let cur=links[0];
  links.slice(1).forEach(a=>{const t=document.querySelector(a.getAttribute('href'));if(t&&t.getBoundingClientRect().top<innerHeight*.4)cur=a});
  links.forEach(a=>a.classList.toggle('on',a===cur));
}
addEventListener('scroll',navTheme,{passive:true});addEventListener('resize',navTheme);navTheme();
const setMenu=open=>{nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',open?'Close menu':'Open menu')};
toggle.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
document.addEventListener('click',e=>{if(!nav.contains(e.target))setMenu(false)});

/* =========================================================
   HERO TITLE — VISTAARA built on site
   road roller paves → blueprint outlines → tower crane lowers each 3D letter
   → INFRA CONSULTANTS types out → golden light runs round the letter edges
========================================================= */
(()=>{
  const T='VISTAARA', host=$('brand-build'), hero=host.closest('.hero'), measure=hero.querySelector('.brand-big');
  const NS='http://www.w3.org/2000/svg';
  const sv=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent&&parent.append(e);return e};
  const GOLD='#f0b429',STEEL='#2b2d33',LIGHT='#c9ccd2';
  const SIDES=['#c44703','#b84303','#ab3f02','#9e3a02','#913502','#843002','#772b02'];
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  let G, built=false;

  function geometry(){
    const cs=getComputedStyle(measure), fs=parseFloat(cs.fontSize), u=fs/100;
    const font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const c=document.createElement('canvas').getContext('2d');c.font=font;c.letterSpacing=cs.letterSpacing;
    const m=c.measureText(T), asc=m.actualBoundingBoxAscent, pad=2*u;
    const xs=[...T].map((_,i)=>pad+c.measureText(T.slice(0,i)).width), ws=[...T].map(ch=>c.measureText(ch).width);
    const B=pad+asc, depth=Math.max(4,Math.round(fs*.045)), roadTop=B+depth+3*u, roadH=7*u;
    return {fs,u,font,asc,xs,ws,B,depth,roadTop,roadH,W:m.width+pad*2,H:roadTop+roadH+2*u,capTop:B-asc,jibY:B-asc-34*u};
  }

  function draw(){
    const g=G=geometry(), {u,W,H,B,depth,roadTop,roadH,xs,ws,jibY,capTop}=g;
    host.replaceChildren();
    const svg=sv('svg',{class:'brand-svg',width:W,height:H,viewBox:`0 0 ${W} ${H}`},host);
    const defs=sv('defs',{},svg);
    const grad=sv('linearGradient',{id:'goldLine',gradientUnits:'userSpaceOnUse',x1:0,y1:0,x2:W,y2:0},defs);
    [['0','#ffd36b'],['.5','#ffffff'],['1','#ffc23d']].forEach(([o,c])=>sv('stop',{offset:o,'stop-color':c},grad));
    const f=sv('filter',{id:'goldGlow',x:'-20%',y:'-20%',width:'140%',height:'140%'},defs);sv('feGaussianBlur',{stdDeviation:1.6*u},f);
    const txt=(ch,x,y,attrs,parent)=>{const t=sv('text',{x,y,...attrs},parent);t.style.font=g.font;t.textContent=ch;return t};

    // road with lane markings (stays as the base of the name)
    const road=sv('g',{},svg);
    sv('rect',{x:0,y:roadTop,width:W,height:roadH,rx:roadH/2,fill:'#26272c'},road);
    sv('line',{x1:roadH/2,y1:roadTop+.6*u,x2:W-roadH/2,y2:roadTop+.6*u,stroke:'#4a4c53','stroke-width':.8*u},road);
    g.lane=sv('line',{x1:2*u,y1:roadTop+roadH/2,x2:W-2*u,y2:roadTop+roadH/2,stroke:'#e9e5dc','stroke-width':.9*u,'stroke-dasharray':`${5*u} ${4*u}`},road);
    g.road=road;

    // blueprint outlines (where each letter will land)
    g.wire=xs.map((x,i)=>txt(T[i],x,B,{fill:'none',stroke:GOLD,'stroke-opacity':.55,'stroke-width':Math.max(1,.7*u),'stroke-dasharray':`${1.6*u} ${1.2*u}`},svg));

    // 3D letters: stacked darker copies for the sides, orange face on top
    g.letters=xs.map((x,i)=>{
      const lg=sv('g',{},svg);
      for(let d=depth;d>=1;d--)txt(T[i],x,B+d,{fill:SIDES[Math.min(6,Math.floor((d-1)*7/depth))]},lg);
      txt(T[i],x,B,{fill:'#d94f04'},lg);
      const cx=x+ws[i]/2, rig=sv('g',{},lg); // spreader bar + slings the crane hook holds
      sv('line',{x1:cx,y1:capTop-6*u,x2:cx-ws[i]*.32,y2:capTop,stroke:LIGHT,'stroke-width':.5*u},rig);
      sv('line',{x1:cx,y1:capTop-6*u,x2:cx+ws[i]*.32,y2:capTop,stroke:LIGHT,'stroke-width':.5*u},rig);
      sv('rect',{x:cx-1.6*u,y:capTop-7.6*u,width:3.2*u,height:2*u,rx:.6*u,fill:GOLD},rig);
      lg.rig=rig;lg.cx=cx;return lg;
    });

    // golden light that runs round every letter edge
    g.flow=sv('g',{opacity:0},svg);
    xs.forEach((x,i)=>{
      const dash=`${16*u} ${74*u}`;
      const glow=txt(T[i],x,B,{fill:'none',stroke:'#ffcf5a','stroke-width':3*u,'stroke-opacity':.55,'stroke-dasharray':dash,'stroke-linejoin':'round',filter:'url(#goldGlow)'},g.flow);
      const core=txt(T[i],x,B,{fill:'none',stroke:'url(#goldLine)','stroke-width':Math.max(1.4,1.1*u),'stroke-dasharray':dash,'stroke-linejoin':'round'},g.flow);
      if(!reduceMotion)[glow,core].forEach(t=>t.animate([{strokeDashoffset:0},{strokeDashoffset:-90*u}],{duration:2600,iterations:Infinity,iterationStart:i*.37%1}));
    });

    // road roller
    const roller=sv('g',{},svg);
    sv('circle',{cx:5*u,cy:-4*u,r:4*u,fill:STEEL,stroke:'#8b9099','stroke-width':.6*u},roller);
    sv('rect',{x:2*u,y:-11*u,width:17*u,height:6*u,rx:1.5*u,fill:GOLD},roller);
    sv('rect',{x:4*u,y:-18*u,width:8*u,height:7*u,rx:1*u,fill:GOLD},roller);
    sv('rect',{x:5.4*u,y:-16.6*u,width:5.2*u,height:3.6*u,rx:.6*u,fill:'#1b1c20'},roller);
    sv('rect',{x:3*u,y:-19.2*u,width:10*u,height:1.4*u,rx:.5*u,fill:STEEL},roller);
    const beacon=sv('circle',{cx:8*u,cy:-20.6*u,r:1*u,fill:'#ff6a13'},roller);
    sv('rect',{x:16*u,y:-9*u,width:10*u,height:9*u,rx:4.5*u,fill:LIGHT,stroke:'#8b9099','stroke-width':.6*u},roller);
    sv('line',{x1:19*u,y1:-8*u,x2:16*u,y2:-10*u,stroke:STEEL,'stroke-width':.8*u},roller);
    beacon.animate([{opacity:1},{opacity:.2}],{duration:500,iterations:Infinity,direction:'alternate'});
    g.roller=roller;

    // tower crane, standing just right of the name
    const crane=sv('g',{},svg), mx=W+6*u, mw=6*u, mastTop=jibY-14*u, base=roadTop+roadH;
    const jx0=Math.max(0,xs[0]-2*u), jx1=mx+mw+18*u;
    sv('rect',{x:mx,y:mastTop,width:mw,height:base-mastTop,fill:'none',stroke:GOLD,'stroke-width':.7*u},crane);
    let zz=`M${mx} ${base}`;for(let y=base,k=0;y>mastTop;y-=mw,k++)zz+=` L${k%2?mx:mx+mw} ${y-mw}`;
    sv('path',{d:zz,fill:'none',stroke:GOLD,'stroke-width':.5*u},crane);
    sv('rect',{x:mx-3*u,y:base-2*u,width:mw+6*u,height:2.4*u,rx:.6*u,fill:STEEL},crane);
    sv('rect',{x:jx0,y:jibY,width:jx1-jx0,height:4*u,fill:'none',stroke:GOLD,'stroke-width':.7*u},crane);
    let jz=`M${jx0} ${jibY+4*u}`;for(let x=jx0,k=0;x<jx1;x+=4*u,k++)jz+=` L${Math.min(jx1,x+4*u)} ${k%2?jibY+4*u:jibY}`;
    sv('path',{d:jz,fill:'none',stroke:GOLD,'stroke-width':.45*u},crane);
    sv('path',{d:`M${mx} ${jibY} L${mx+mw/2} ${jibY-12*u} L${mx+mw} ${jibY}`,fill:'none',stroke:GOLD,'stroke-width':.7*u},crane);
    sv('line',{x1:mx+mw/2,y1:jibY-12*u,x2:jx0+(mx-jx0)*.35,y2:jibY,stroke:LIGHT,'stroke-width':.35*u},crane);
    sv('line',{x1:mx+mw/2,y1:jibY-12*u,x2:jx1,y2:jibY,stroke:LIGHT,'stroke-width':.35*u},crane);
    sv('rect',{x:jx1-8*u,y:jibY+4*u,width:7*u,height:6*u,rx:.6*u,fill:'#8b9099'},crane);
    sv('rect',{x:mx-7*u,y:jibY+4*u,width:7*u,height:6*u,rx:.8*u,fill:GOLD},crane);
    sv('rect',{x:mx-6*u,y:jibY+5.4*u,width:4.6*u,height:2.6*u,rx:.4*u,fill:'#1b1c20'},crane);
    const trolley=sv('g',{},crane);
    sv('rect',{x:-3*u,y:jibY+4*u,width:6*u,height:2.6*u,rx:.5*u,fill:STEEL},trolley);
    const Lend=(capTop-7.6*u)-(jibY+6.6*u);
    const cable=sv('rect',{x:-.35*u,y:jibY+6.6*u,width:.7*u,height:Lend,fill:LIGHT},trolley);
    cable.style.transformBox='fill-box';cable.style.transformOrigin='top';
    Object.assign(g,{crane,trolley,cable,Lend,drop:Lend-5*u,mx});
  }

  function finalState(){
    const g=G;
    g.roller.remove();g.crane.remove();g.wire.forEach(w=>w.remove());
    g.letters.forEach(l=>{l.rig.remove();l.style.opacity=1});
    g.flow.setAttribute('opacity',1);
    if(!reduceMotion)g.lane.animate([{strokeDashoffset:0},{strokeDashoffset:-9*g.u}],{duration:900,iterations:Infinity});
    hero.classList.add('built');built=true;
  }

  function dust(x,y){
    const u=G.u, svg=host.querySelector('svg');
    for(let k=-1;k<=1;k++){
      const c=sv('circle',{cx:x+k*4*u,cy:y,r:1.8*u,fill:'#d6d0c4','fill-opacity':.7},svg);
      c.animate([{transform:'translate(0,0) scale(.6)',opacity:.8},{transform:`translate(${k*6*u}px,${-4*u}px) scale(1.8)`,opacity:0}],{duration:520,easing:'ease-out'}).onfinish=()=>c.remove();
    }
  }

  async function construct(){
    const g=G, {u,W,roadTop,letters,wire,trolley,cable,Lend,drop,crane}=g, fx={fill:'both'};
    letters.forEach(l=>l.style.opacity=0);
    wire.forEach(w=>w.style.opacity=0);
    crane.style.opacity=0;
    // 1. roller paves the road
    g.road.style.transformBox='fill-box';g.road.style.transformOrigin='left';
    g.road.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1100,easing:'cubic-bezier(.45,0,.3,1)',...fx});
    g.roller.animate([{transform:`translate(${-28*u}px,${roadTop}px)`},{transform:`translate(${W-26*u}px,${roadTop}px)`}],{duration:1100,easing:'cubic-bezier(.45,0,.3,1)',...fx});
    // 2. blueprint outlines
    wire.forEach((w,i)=>w.animate([{opacity:0},{opacity:1}],{duration:400,delay:250+i*70,...fx}));
    await wait(700);
    // 3. crane rises into place
    crane.style.opacity=1;
    await crane.animate([{transform:`translateY(${-40*u}px)`,opacity:0},{transform:'none',opacity:1}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)',...fx}).finished;
    g.roller.animate([{opacity:1},{opacity:0}],{duration:400,...fx});
    let tx=g.mx-4*u;
    for(const [i,l] of letters.entries()){
      if(built)return;
      await trolley.animate([{transform:`translateX(${tx}px)`},{transform:`translateX(${l.cx}px)`}],{duration:Math.min(320,120+Math.abs(tx-l.cx)*.5),easing:'ease-in-out',...fx}).finished;
      tx=l.cx;
      l.style.opacity=1;
      cable.animate([{transform:`scaleY(${(Lend-drop)/Lend})`},{transform:'scaleY(1)'}],{duration:380,easing:'cubic-bezier(.3,.7,.4,1)',...fx});
      await l.animate([{transform:`translateY(${-drop}px)`},{transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.3,.7,.4,1)',...fx}).finished;
      wire[i].animate([{opacity:1},{opacity:0}],{duration:250,...fx});
      dust(l.cx,g.B+g.depth);
      l.rig.animate([{opacity:1},{opacity:0}],{duration:160,...fx});
      cable.animate([{transform:'scaleY(1)'},{transform:`scaleY(${(Lend-drop)/Lend})`}],{duration:160,...fx});
      if(i===letters.length-3)hero.classList.add('built'); // start typing as the last letters land
    }
    await wait(150);
    if(built)return;
    await crane.animate([{opacity:1,transform:'none'},{opacity:0,transform:`translateY(${-30*u}px)`}],{duration:500,easing:'ease-in',...fx}).finished;
    if(built)return;
    g.flow.animate([{opacity:0},{opacity:1}],{duration:700,fill:'forwards'});
    finalState();
  }

  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!built)return;draw();finalState()},150)});
  document.fonts.ready.then(()=>{
    draw();
    if(reduceMotion)return finalState();
    construct().catch(()=>{if(!built){draw();finalState()}});
    setTimeout(()=>{if(!built){draw();finalState()}},9000); // never leave the name half-built
  });
})();

/* ---------- hero: featured project panel (facts from each project.json) ---------- */
const featured=[
  {t:'Mysuru Elevated Corridor',s:'Elevated flyovers & grade separators · DPR',l:'Mysore City Limits, Karnataka',text:'DPR',u:'URBAN',
   scope:['Traffic surveys','Feasibility','Structural design','Pavement design','Land acquisition','BOQ & tender']},
  {t:'NH-69 Sira – Byrenahalli',s:'4-lane widening · DPR · EPC',l:'Tumakuru District, Karnataka',n:52.6,dec:1,u:'KM CORRIDOR',
   scope:['Survey','Alignment','Bypasses','DPR']},
  {t:'SH-34 High-Level Bridge',s:'Dadgi River · Bhalki Taluka',l:'Bidar District, Karnataka',n:150,dec:0,u:'M BRIDGE',
   scope:['Hydrology','Bridge design','Drawings','DPR']},
  {t:'FWD Testing · CRIF 2026–27',s:'Pavement evaluation studies',l:'5 divisions, Karnataka',n:5,dec:0,u:'DIVISIONS',
   scope:['FWD','NSV inventory','CBR','Reporting']}];
const segs=document.querySelectorAll('.seg button');
function showFeatured(i){
  const d=featured[i];
  segs.forEach(b=>{const on=+b.dataset.i===i;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  $('p-title').textContent=d.t;$('p-sub').textContent=d.s;$('p-loc').textContent=d.l;$('p-unit').textContent=d.u;
  if(!reduceMotion)$('ring').animate([{strokeDashoffset:264},{strokeDashoffset:0}],{duration:1400,easing:'cubic-bezier(.16,1,.3,1)'});
  $('p-scope').replaceChildren(...d.scope.map((s,k)=>el('span',{style:`animation-delay:${k*90}ms`},s)));
  const e=$('p-num');
  if(d.text||reduceMotion){e.textContent=d.text||d.n.toFixed(d.dec);return}
  let t0;const f=t=>{t0??=t;const q=Math.min((t-t0)/1200,1);e.textContent=(d.n*(1-Math.pow(1-q,4))).toFixed(d.dec);if(q<1)requestAnimationFrame(f)};requestAnimationFrame(f);
}
segs.forEach(b=>b.addEventListener('click',()=>showFeatured(+b.dataset.i)));
showFeatured(0);

/* ---------- services filter + process rail ---------- */
document.querySelectorAll('#filters button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#filters button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.svc').forEach(s=>s.classList.toggle('hide',b.dataset.f!=='all'&&!s.dataset.c.includes(b.dataset.f)));
}));
new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){$('rail').style.width='calc(100% - 6px)';o.disconnect()}}),{threshold:.4}).observe($('steps'));

/* =========================================================
   CONTENT DISCOVERY
========================================================= */
// Returns [{path, name, url}] for every file in images/, projects/, careers/
async function getFileList(){
  const C=window.VISTAARA_CONTENT;
  if(C&&Array.isArray(C.files))return C.files.map(p=>({path:p,name:p.split('/').pop(),url:encPath(p)}));
  return getGitHubTree();
}
async function getGitHubTree(){
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(TREE_CACHE.key)||'null')}catch{}
  if(cached&&Date.now()-cached.t<TREE_CACHE.ms)return cached.tree;
  const raw=p=>`https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${encPath(p)}`;
  try{
    const r=await fetch(`https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/git/trees/${GITHUB.branch}?recursive=1`,{headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)throw new Error('GitHub '+r.status);
    const tree=(await r.json()).tree.filter(i=>i.type==='blob'&&/^(images|projects|careers)\//i.test(i.path)).map(i=>({path:i.path,name:i.path.split('/').pop(),url:raw(i.path)}));
    try{localStorage.setItem(TREE_CACHE.key,JSON.stringify({t:Date.now(),tree}))}catch{}
    return tree;
  }catch(err){console.warn('Could not list content:',err);return cached?cached.tree:[]}
}
// Fresh copy of a project.json / job.json; falls back to the copy stored in content.js (e.g. when opened from disk)
async function readJson(file){
  try{const r=await fetch(file.url,{cache:'no-cache'});if(r.ok)return await r.json()}catch{}
  return window.VISTAARA_CONTENT?.data?.[file.path]??null;
}
function folders(files,prefix){
  const map=new Map();
  files.forEach(f=>{if(!f.path.toLowerCase().startsWith(prefix))return;const parts=f.path.slice(prefix.length).split('/');if(parts.length>=2&&parts[0])map.set(parts[0].toLowerCase(),parts[0])});
  return [...map.values()].sort(byName).map(name=>({name,files:files.filter(f=>f.path.toLowerCase().startsWith((prefix+name+'/').toLowerCase()))}));
}

/* ---------- About: photo frame + video frame ---------- */
function mediaFrame(frame,stack,dots,tag,prevBtn,nextBtn,nodes,labels,{video=false,delay=3500}={}){
  if(!nodes.length){frame.hidden=true;return}
  stack.prepend(...nodes);dots.append(...nodes.map(()=>el('i')));
  if(nodes.length<2){prevBtn.hidden=nextBtn.hidden=true}
  let cur=-1,timer,visible=false,hover=false;
  const schedule=()=>{clearTimeout(timer);if(!video&&visible&&!hover&&!reduceMotion&&nodes.length>1)timer=setTimeout(()=>go(cur+1),delay)};
  function go(n){
    clearTimeout(timer);
    if(cur>=0){nodes[cur].classList.remove('on');dots.children[cur].classList.remove('on');if(video)nodes[cur].pause()}
    cur=(n+nodes.length)%nodes.length;const m=nodes[cur];
    m.classList.add('on');dots.children[cur].classList.add('on');tag.textContent=labels[cur];
    if(video){m.currentTime=0;if(visible)m.play().catch(()=>{});m.onended=()=>hover||nodes.length<2?m.play().catch(()=>{}):go(cur+1)}
    else schedule();
  }
  stack.addEventListener('mouseenter',()=>{hover=true;clearTimeout(timer)});
  stack.addEventListener('mouseleave',()=>{hover=false;schedule()});
  prevBtn.addEventListener('click',()=>go(cur-1));nextBtn.addEventListener('click',()=>go(cur+1));
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;
    if(cur<0){if(visible)go(0);return}
    if(video)visible?nodes[cur].play().catch(()=>{}):nodes[cur].pause();else visible?schedule():clearTimeout(timer)},{threshold:.3}).observe(stack);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&video&&cur>=0)nodes[cur].pause()});
}

/* ---------- auto-sliding strips with prev / next; stop while the cursor is on a photo ---------- */
const sliders={};
function slider(id,items){
  const s=$(id), track=s.querySelector('.slide-track');
  if(!items.length)return false;
  track.append(...items,...items.map(n=>{const c=n.cloneNode(true);c.setAttribute('aria-hidden','true');return c}));
  const st={x:0,speed:reduceMotion?0:(+s.dataset.speed||40),visible:false,hover:false,nudge:null};
  sliders[id]=st;
  const half=()=>track.scrollWidth/2;
  const step=()=>{const c=track.children[0];return c?c.offsetWidth+24:300};
  st.move=dir=>{st.nudge={from:st.x,to:st.x+dir*step(),t0:null}};
  track.addEventListener('pointerover',e=>{st.hover=!!e.target.closest('.mate,.shot')});
  track.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest?.('.mate,.shot'))st.hover=false});
  new IntersectionObserver(([e])=>st.visible=e.isIntersecting,{threshold:.1}).observe(s);
  let last=performance.now();
  const loop=now=>{
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(st.nudge){const n=st.nudge;n.t0??=now;const p=Math.min((now-n.t0)/650,1);st.x=n.from+(n.to-n.from)*(1-Math.pow(1-p,3));if(p===1)st.nudge=null}
    else if(st.visible&&!st.hover)st.x+=st.speed*dt;
    const h=half();if(h)st.x=((st.x%h)+h)%h;
    track.style.transform=`translateX(${-st.x}px)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return true;
}
document.querySelectorAll('.sl-btn[data-for]').forEach(b=>b.addEventListener('click',()=>sliders[b.dataset.for]?.move(+b.dataset.dir)));

/* ---------- media from images/ ---------- */
const titleCase=s=>s.split(/\s+/).map(w=>w.length<=2?w.toUpperCase():w[0].toUpperCase()+w.slice(1).toLowerCase()).join(' ');
function parseEmployee(file){
  const m=stripExt(file.name).match(/^Employee[_\s-]*(\d+)[_\-\s]+(.+)$/i);
  if(!m)return null;
  const parts=m[2].split('_').map(p=>p.trim()).filter(Boolean);
  if(!parts.length)return null;
  const name=titleCase(parts.shift().replace(/^(mr|mrs|ms|dr)\.?\s+/i,''));
  return {number:+m[1],name,designation:parts.join(' ')||'Team Member',file};
}
const prettyLabel=n=>stripExt(n).replace(/[_]+/g,' ');

function initMedia(files){
  const top=files.filter(f=>/^images\/[^/]+$/i.test(f.path));
  const photos=top.filter(f=>isImage(f.name)&&/project discussion|team photo/.test(norm(f.name))).sort((a,b)=>byName(a.name,b.name));
  const videos=top.filter(f=>isVideo(f.name)&&norm(f.name).includes('video')).sort((a,b)=>byName(a.name,b.name));
  const crew=top.filter(f=>isImage(f.name)).map(parseEmployee).filter(Boolean).sort((a,b)=>a.number-b.number||byName(a.file.name,b.file.name));
  const gallery=top.filter(f=>isImage(f.name)&&norm(f.name).startsWith('gallery')).sort((a,b)=>byName(a.name,b.name));
  const teamPhotos=photos.filter(f=>norm(f.name).includes('team photo')), talks=photos.filter(f=>norm(f.name).includes('project discussion'));
  const galB=[];for(let i=0;i<Math.max(teamPhotos.length,talks.length);i++){teamPhotos[i]&&galB.push(teamPhotos[i]);talks[i]&&galB.push(talks[i])}

  mediaFrame($('photo-frame'),$('photo-stack'),$('photo-dots'),$('photo-tag'),$('photo-prev'),$('photo-next'),
    photos.map(f=>el('img',{src:f.url,alt:prettyLabel(f.name),loading:'lazy',decoding:'async'})),photos.map(f=>prettyLabel(f.name)));
  mediaFrame($('video-frame'),$('video-stack'),$('video-dots'),$('video-tag'),$('video-prev'),$('video-next'),
    videos.map(f=>{const v=el('video',{src:f.url,playsinline:'',preload:'metadata'});v.muted=true;return v}),
    videos.map((f,i)=>`Video ${i+1} · ${prettyLabel(f.name).replace(/^Video \d+\s*/i,'')}`),{video:true});

  if(!slider('crew',crew.map(p=>el('div',{class:'mate raise'},el('img',{src:p.file.url,alt:`${p.name}, ${p.designation}`,loading:'lazy',decoding:'async'}),el('b',{},p.name),el('span',{},p.designation)))))$('crew-block').hidden=true;
  if(!slider('gal-a',gallery.map((f,i)=>el('div',{class:`shot raise${i%3===1?' tall':''}`},el('img',{src:f.url,alt:'Vistaara gallery photo',loading:'lazy',decoding:'async'})))))$('gal-a').hidden=true;
  if(!slider('gal-b',galB.map((f,i)=>el('div',{class:`shot raise${i%4===2?' tall':''}`},el('img',{src:f.url,alt:prettyLabel(f.name),loading:'lazy',decoding:'async'})))))$('gal-b-block').hidden=true;
  setStat('stat-team',crew.length+2); // engineering team + the two leaders
}

/* ---------- Projects: featured:true (by order, max 5) on top, the rest under More projects ---------- */
async function initProjects(files){
  const list=(await Promise.all(folders(files,'projects/').map(async dir=>{
    const jf=dir.files.find(f=>f.name.toLowerCase()==='project.json');if(!jf)return null;
    const p=await readJson(jf);
    if(!p||!['title','category','description','image'].every(k=>typeof p[k]==='string'&&p[k].trim())){console.warn('Skipping project',dir.name);return null}
    const img=dir.files.find(f=>f.name.toLowerCase()===p.image.trim().toLowerCase());
    if(!img){console.warn(`Skipping project ${dir.name}: image "${p.image}" not found`);return null}
    return {...p,folder:dir.name,img:img.url,featured:p.featured===true,order:Number.isFinite(+p.order)&&p.order!==''?+p.order:Infinity};
  }))).filter(Boolean).sort((a,b)=>a.order-b.order||byName(a.folder,b.folder));

  const feat=list.filter(p=>p.featured), top=feat.slice(0,5), rest=[...feat.slice(5),...list.filter(p=>!p.featured)];
  const grid=$('featured-grid');
  top.forEach((p,i)=>grid.append(
    el('article',{class:`proj raise reveal${i<2?' big':''}`},
      el('div',{class:'ph'},el('img',{src:p.img,alt:p.title,loading:'lazy',decoding:'async'}),el('span',{class:'badge'},`P—${String(Number.isFinite(p.order)?p.order:i+1).padStart(2,'0')} · ${p.category}`)),
      el('div',{class:'meta'},el('div',{},el('span',{class:'loc mono'},p.location||''),el('h3',{},p.title)),el('span',{class:'go raise','aria-hidden':'true'},'↗')))));
  rest.forEach(p=>$('more-list').append(
    el('article',{class:'mp'},el('img',{src:p.img,alt:p.title,loading:'lazy',decoding:'async'}),
      el('div',{},el('span',{class:'loc mono o'},p.category),el('h4',{},p.title),el('p',{},p.description)))));
  $('more').hidden=!rest.length;
  $('projects-empty').hidden=list.length>0;
  setStat('stat-projects',list.length);
  watchReveals(grid);
}
$('more-toggle').addEventListener('click',()=>{
  const open=$('more').classList.toggle('open');
  $('more-toggle').setAttribute('aria-expanded',open);
  $('more-toggle').querySelector('.lbl').textContent=open?'Show less':'View more';
});

/* ---------- Careers: sorted by order; closed positions shown but not expandable ---------- */
async function initCareers(files){
  const required=['title','count','status','details','software','qualification','description','email'];
  const jobs=(await Promise.all(folders(files,'careers/').map(async dir=>{
    const jf=dir.files.find(f=>f.name.toLowerCase()==='job.json');if(!jf)return null;
    const j=await readJson(jf);
    const ok=j&&required.every(k=>k==='details'?Array.isArray(j.details)&&j.details.length:typeof j[k]==='string'&&j[k].trim())&&['open','closed'].includes(j.status.toLowerCase());
    if(!ok){console.warn('Skipping career position',dir.name);return null}
    return {...j,status:j.status.toLowerCase(),folder:dir.name,order:Number.isFinite(+j.order)?+j.order:Infinity};
  }))).filter(Boolean).sort((a,b)=>a.order-b.order||byName(a.folder,b.folder));

  const listEl=$('careers-list');
  jobs.forEach((j,i)=>{
    const closed=j.status==='closed', bodyId=`job-body-${i}`;
    const pm=el('span',{class:'pm raise','aria-hidden':'true'},closed?'–':'+');
    const head=el('button',{class:'job-head',type:'button','aria-expanded':'false','aria-controls':bodyId,...(closed?{'aria-disabled':'true'}:{})},
      el('div',{},el('span',{class:'mono'},j.positionLabel||`POSITION ${String(i+1).padStart(2,'0')}`),el('h3',{},j.title),el('span',{class:'cnt'},j.count)),
      el('span',{class:`badge-s ${closed?'closed':'open'}`},closed?'CLOSED':'OPEN'),pm);
    const email=/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(j.email)?j.email:'info@vistaarainfra.com';
    const apply=el('a',{class:'btn btn-orange',href:`mailto:${email}?subject=${encodeURIComponent('Application - '+j.title)}`},'Apply for this position ',el('span',{class:'ar'},'→'));
    const body=el('div',{class:'job-body',id:bodyId},el('div',{},el('div',{class:'job-inner'},
      el('div',{},el('h4',{},'Responsibilities'),el('ul',{},j.details.map(d=>el('li',{},String(d))))),
      el('div',{},el('h4',{},'Software'),el('div',{class:'chips'},j.software.split('|').map(s=>el('span',{},s.trim())))),
      el('div',{},el('h4',{},'Qualification'),el('p',{},j.qualification)),
      el('p',{},j.description),
      el('div',{class:'job-foot'},el('span',{class:'mono muted'},j.location?'📍 '+j.location:''),apply))));
    const card=el('article',{class:`job raise reveal${closed?' closed':''}`},head,body);
    if(!closed)head.addEventListener('click',()=>{const open=card.classList.toggle('open');head.setAttribute('aria-expanded',open);pm.textContent=open?'−':'+'});
    listEl.append(card);
  });
  $('career-empty').hidden=jobs.length>0;
  watchReveals(listEl);
}

getFileList().then(files=>Promise.all([initMedia(files),initProjects(files),initCareers(files)])).catch(err=>console.error('Content failed to load:',err));

/* ---------- contact form → prepared email for the visitor to review and send ---------- */
const form=$('contact-form'), note=$('form-note');
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.checkValidity()){form.reportValidity();note.textContent='Please fill in your name, a valid email and your message.';note.classList.add('err');return}
  const v=k=>String(new FormData(form).get(k)||'').trim();
  const body=[`Name: ${v('name')}`,`Work email: ${v('email')}`,`Organization: ${v('organization')||'Not provided'}`,`Phone: ${v('phone')||'Not provided'}`,'','How can we help?',v('message')].join('\n');
  location.href=`mailto:info@vistaarainfra.com?subject=${encodeURIComponent('Project Enquiry – Vistaara Infra Consultants')}&body=${encodeURIComponent(body)}`;
  note.classList.remove('err');note.textContent='Your email app should open with the enquiry ready — please review it and press Send.';
});

$('year').textContent=new Date().getFullYear();
})();
