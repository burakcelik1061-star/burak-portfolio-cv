/* One loop for everything: smooth the scroll position, feed the updaters, tick the rest. */
(function(){
'use strict';
var BC=window.BC,s=BC.s;
if(!(BC.gl&&BC.gl.skillsLive))BC.orbFallback();
var prev=performance.now(),last=-1;
function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden){prev=now;return}
  var dt=Math.min(0.05,(now-prev)/1000),i;prev=now;s.time+=dt;
  var target=window.scrollY;
  if(BC.reduced)s.y=target;else{s.y+=(target-s.y)*Math.min(1,dt*9);if(Math.abs(target-s.y)<0.15)s.y=target}
  s.vel=target-s.y;
  if(BC.force||s.y!==last){for(i=0;i<BC.updaters.length;i++)BC.updaters[i](s.y);last=s.y;BC.force=false}
  for(i=0;i<BC.tickers.length;i++)BC.tickers[i](dt);
}
var rz=0;
window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){BC.measure();if(BC.gl&&BC.gl.ok)BC.gl.resize()},120)});
window.addEventListener('load',BC.measure);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){BC.measure();if(BC.gl&&BC.gl.ok)BC.gl.resize()});

var start='tr';
try{var st=localStorage.getItem('bc-lang');if(st==='en'||st==='tr')start=st;else if(!/^tr/i.test(navigator.language||'tr'))start='en'}catch(e){}
if(start!=='tr')BC.setLang(start,false);else BC.measure();
requestAnimationFrame(frame);
})();
