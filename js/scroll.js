/* Section bookkeeping, the scroll-scrubbed entrances, and the chrome that follows the world in view. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,clamp=BC.clamp,s=BC.s,root=BC.root;
var ins=$$('[data-in],[data-split]'),secs=BC.secs,navLinks=$$('.top nav a'),dots=$$('#dots a');
var hero=$('.hero'),plateN=$('#plate-n'),plateName=$('#plate-name'),tl=$('#tl');
BC.plateIdx=-1;

BC.measurers.push(function(){
  ins.forEach(function(el){el.style.setProperty('--e','1')});
  var cap=s.pageH-s.vh*0.5;
  ins.forEach(function(el){el._top=Math.min(BC.absTop(el),cap)});
  secs.forEach(function(sec){sec._top=BC.absTop(sec);sec._h=sec.offsetHeight});
  tl._top=BC.absTop(tl);tl._h=tl.offsetHeight;
});

BC.updaters.push(function(y){
  var i,vh=s.vh;
  if(!BC.reduced){
    for(i=0;i<ins.length;i++){
      var el=ins[i],e=clamp((y+vh*0.94-el._top)/(vh*0.44),0,1);
      el.style.setProperty('--e',BC.ease(e).toFixed(3));
    }
    tl.style.setProperty('--tp',clamp((y+vh*0.6-tl._top)/tl._h,0,1).toFixed(3));
  }
  s.heroP=clamp(y/(hero._h||vh),0,1);
  var mid=y+vh*0.5,idx=0;
  for(i=0;i<secs.length;i++){if(mid>=secs[i]._top)idx=i}
  var sec=secs[idx],start=Math.max(sec._top-vh*0.5,0),end=Math.min(sec._top+sec._h-vh*0.5,s.pageH-vh);
  s.secIdx=idx;s.secP=clamp((y-start)/Math.max(1,end-start),0,1);
  if(idx!==BC.plateIdx){
    BC.plateIdx=idx;plateN.textContent=String(idx+1);
    plateName.textContent=sec.getAttribute('data-name-'+s.lang);
    root.setAttribute('data-world',String(idx));
    navLinks.forEach(function(a){a.setAttribute('aria-current',String(a.getAttribute('href')==='#'+sec.id))});
    dots.forEach(function(a,k){a.classList.toggle('on',k===idx)});
  }
});
})();
