/* Projects: a pinned stepper. Scrolling walks through the six projects; each step turns the info
   panel over in 3D, swaps the diorama and repaints the whole world in that project's colours.
   Also owns the detail screen that opens from a panel. Without WebGL, or when the layout does not
   fit, the plain swipeable strip from sections.css stays. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,clamp=BC.clamp,s=BC.s,root=BC.root,G=BC.gl;
var sec=$('#projects'),head=$('.proj-head',sec),stage=$('#stage'),dio=$('#dio'),hint=$('#dio-hint'),cards=$$('.card',stage),bar=$('#bar'),countN=$('#count-n');
var n=cards.length,step=0,applied=-1,T=G.ok?G.T:null,ca,cb;
var pr=BC.proj=BC.proj||{on:false,pos:0,cur:0};
if(T){ca=new T.Color();cb=new T.Color()}

function paint(i){
  if(i===applied)return;applied=i;var P=BC.P[i],st=root.style;
  st.setProperty('--p-bg',P.bg);st.setProperty('--p-bg2',P.bg2);st.setProperty('--p-acc',P.acc);st.setProperty('--p-on',P.on);st.setProperty('--p-panel',P.panel);
  setHint();
}
function setHint(){
  if(!pr.on){hint.textContent='';return}
  var h=BC.D[s.lang][pr.cur].hint;
  if(pr.cur===5&&BC.frc&&BC.frc.shots)h+=' ('+BC.frc.hits+' / '+BC.frc.shots+')';
  hint.textContent=h;
}
BC.frcChanged=setHint;BC.langHooks.push(function(){setHint()});

BC.layouts.push(function(){
  sec.style.height='';pr.on=false;root.classList.remove('step');
  cards.forEach(function(c){c.style.transform='';c.style.opacity='';c.style.pointerEvents='';c.style.visibility=''});
  if(BC.reduced||!G.ok){paint(0);return}
  root.classList.add('step');
  var maxH=0,wide=innerWidth>=900;cards.forEach(function(c){maxH=Math.max(maxH,c.offsetHeight)});
  var need=s.headH+head.offsetHeight+maxH+60+(wide?0:Math.max(150,innerHeight*0.2));
  if(need>innerHeight){root.classList.remove('step');paint(0);return}
  pr.on=true;step=Math.max(440,innerHeight*0.85);
  sec.style.height=Math.round(innerHeight+(n-1)*step+step*0.3)+'px';
});

BC.updaters.push(function(y){
  if(!pr.on){pr.pos=0;pr.cur=0;return}
  var raw=clamp((y-sec._top)/step,0,n-1),fl=Math.floor(raw),fr=raw-fl;
  fr=fr<0.5?4*fr*fr*fr:1-Math.pow(-2*fr+2,3)/2;     /* linger on each project, move quickly between */
  var pos=fl+fr,wide=s.vw>=900,i;
  pr.pos=pos;pr.cur=Math.round(pos);
  for(i=0;i<n;i++){
    var c=cards[i],d=i-pos,ad=Math.abs(d);
    if(ad>=0.98){if(c.style.visibility!=='hidden'){c.style.visibility='hidden';c.style.pointerEvents='none'}continue}
    c.style.visibility='';c.style.pointerEvents=ad<0.5?'':'none';
    c.style.transform=(wide?'translateY(-50%) ':'')+'translate3d(0,'+(d*90).toFixed(1)+'px,'+(-ad*260).toFixed(1)+'px) rotateX('+(-d*84).toFixed(2)+'deg)';
    c.style.opacity=(1-Math.pow(ad,1.6)).toFixed(3);
  }
  paint(pr.cur);
  if(T){ /* the ground blends between the two projects' colours */
    var a=BC.P[Math.min(fl,n-1)],b=BC.P[Math.min(fl+1,n-1)],W=G.pal[2];
    W.a.copy(ca.set(a.bg)).lerp(cb.set(b.bg),fr);W.b.copy(ca.set(a.bg2)).lerp(cb.set(b.bg2),fr);W.c.copy(ca.set(a.acc)).lerp(cb.set(b.acc),fr);
  }
  bar.style.setProperty('--p',(pos/(n-1)).toFixed(3));
  countN.textContent=String(pr.cur+1);
});
dio.addEventListener('click',function(){if(pr.on&&G.pokeDio)G.pokeDio()});
dio.setAttribute('data-cur','click');
stage.addEventListener('scroll',function(){
  if(pr.on)return;var mid=stage.scrollLeft+stage.clientWidth/2,best=0,bd=1e9;
  cards.forEach(function(k,i){var d=Math.abs(k.offsetLeft+k.offsetWidth/2-mid);if(d<bd){bd=d;best=i}});
  countN.textContent=String(best+1);
},{passive:true});
cards.forEach(function(c,i){c.addEventListener('focusin',function(){if(pr.on&&i!==pr.cur)window.scrollTo({top:Math.round(sec._top+i*step),behavior:'auto'})})});
BC.gotoProject=function(i){
  i=clamp(i,0,n-1);
  if(pr.on)window.scrollTo({top:Math.round(sec._top+i*step),behavior:'smooth'});
  else{sec.scrollIntoView({behavior:'smooth'});stage.scrollTo({left:cards[i].offsetLeft-20,behavior:'smooth'})}
};

/* ---------- detail screen ---------- */
var det=$('#detail'),dK=$('#detail-k'),dH=$('#detail-h'),dP=$('#detail-p'),dF=$('#detail-flow'),dL=$('#detail-pts'),dS=$('#detail-stack'),dA=$('#detail-acts'),dC=$('#detail-close');
var opener=null,closeT=0,openIdx=-1;
function el(tag,text,cls){var e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e}
function fill(i){
  var card=cards[i],D=BC.D[s.lang][i],P=BC.P[i],st=det.style;
  st.setProperty('--bg',P.bg);st.setProperty('--acc',P.acc);st.setProperty('--on-acc',P.on);st.setProperty('--panel',P.panel);
  st.setProperty('--fg','#FFF8F2');st.setProperty('--muted','rgba(255,248,242,.82)');st.setProperty('--line','rgba(255,248,242,.26)');
  dK.textContent=$('.kind',card).textContent;dH.textContent=$('h3',card).textContent;dP.textContent=D.long;
  dF.textContent='';D.flow.forEach(function(f,k){if(k)dF.appendChild(el('em','→'));var b=el('div');b.appendChild(el('b',f[0]));b.appendChild(el('span',f[1]));dF.appendChild(b)});
  dL.textContent='';$$('.pts li',card).forEach(function(li){dL.appendChild(el('li',li.textContent))});D.pts.forEach(function(p){dL.appendChild(el('li',p))});
  dS.textContent='';$$('.stack li',card).forEach(function(li){dS.appendChild(el('li',li.textContent))});
  dA.textContent='';var link=$('.acts a',card);
  if(link){var a=el('a',link.textContent,'btn solid');a.href=link.href;a.target='_blank';a.rel='noopener';dA.appendChild(a)}
}
function open(i,x,y,from){
  clearTimeout(closeT);opener=from;openIdx=i;fill(i);
  det.style.setProperty('--cx',x+'px');det.style.setProperty('--cy',y+'px');
  det.hidden=false;det.scrollTop=0;document.documentElement.style.overflow='hidden';
  requestAnimationFrame(function(){requestAnimationFrame(function(){det.classList.add('open');dC.focus()})});
}
function close(){
  if(det.hidden)return;det.classList.remove('open');document.documentElement.style.overflow='';openIdx=-1;
  closeT=setTimeout(function(){det.hidden=true},BC.reduced?0:700);
  if(opener)opener.focus();
}
BC.openDetail=function(i){open(clamp(i,0,n-1),innerWidth/2,innerHeight/2,null)};
$$('[data-detail]').forEach(function(b){b.addEventListener('click',function(e){open(+b.dataset.detail,e.clientX||innerWidth/2,e.clientY||innerHeight/2,b)})});
dC.addEventListener('click',close);
document.addEventListener('keydown',function(e){
  if(det.hidden)return;
  if(e.key==='Escape')close();
  if(e.key==='Tab'){ /* keep focus inside the dialog */
    var f=$$('a,button',det);if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
BC.langHooks.push(function(){if(openIdx>=0)fill(openIdx)});
})();
