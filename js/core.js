/* Shared state and small helpers. Every other file hangs its work on the four lists below:
   layouts   – may change element sizes (run first, in order)
   measurers – cache positions once sizes are final
   updaters  – run when the smoothed scroll position changes
   tickers   – run every frame */
(function(){
'use strict';
var root=document.documentElement;
var BC=window.BC={
  root:root,
  reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  fine:window.matchMedia('(hover:hover) and (pointer:fine)').matches,
  $:function(s,c){return (c||document).querySelector(s)},
  $$:function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))},
  clamp:function(v,a,b){return v<a?a:v>b?b:v},
  ease:function(t){return 1-Math.pow(1-t,3)},
  absTop:function(el){return el.getBoundingClientRect().top+window.scrollY},
  layouts:[],measurers:[],updaters:[],tickers:[],
  force:true,
  s:{y:window.scrollY,vel:0,vw:innerWidth,vh:innerHeight,headH:60,pageH:0,
     secIdx:0,secP:0,mx:0,my:0,px:-100,py:-100,mouse:false,time:0,lang:'tr'}
};
BC.secs=BC.$$('[data-sec]');
BC.measure=function(){
  var s=BC.s;s.vw=innerWidth;s.vh=innerHeight;
  BC.layouts.forEach(function(f){f()});
  s.pageH=document.documentElement.scrollHeight;
  BC.measurers.forEach(function(f){f()});
  BC.force=true;
};
window.addEventListener('pointermove',function(e){
  var s=BC.s;s.px=e.clientX;s.py=e.clientY;s.mx=e.clientX/innerWidth*2-1;s.my=e.clientY/innerHeight*2-1;
  if(e.pointerType==='mouse')s.mouse=true;
},{passive:true});
})();
