/* Opening: a counter runs while fonts and scripts settle, then the curtain splits and the
   name assembles. Any key or click skips it. Not shown when reduced motion is asked for. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,root=BC.root;
var el=$('#loader'),num=$('#ld-n'),bar=$('#ld-bar');
if(!root.classList.contains('js-load')){BC.started=true;return}
var t0=performance.now(),ready=false,shown=0,done=false;
function finish(){
  if(done)return;done=true;num.textContent='100';bar.style.setProperty('--p','1');
  el.classList.add('out');BC.started=true;
  setTimeout(function(){root.classList.remove('js-load')},1000);
  window.removeEventListener('keydown',finish);el.removeEventListener('click',finish);
}
function tick(){
  if(done)return;
  var el2=(performance.now()-t0)/1000,cap=ready?1:0.8,target=Math.min(cap,el2/1.5);
  shown+=(target-shown)*0.18;
  num.textContent=String(Math.round(shown*100));bar.style.setProperty('--p',shown.toFixed(3));
  if(ready&&el2>1.5&&shown>0.985)finish();else requestAnimationFrame(tick);
}
var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
fonts.then(function(){ready=true},function(){ready=true});
setTimeout(function(){ready=true},4000);
window.addEventListener('keydown',finish);el.addEventListener('click',finish);
el.style.pointerEvents='auto';
requestAnimationFrame(tick);
})();
