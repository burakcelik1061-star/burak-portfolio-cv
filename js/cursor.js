/* A ring that trails the mouse and swells over things you can act on, and buttons that lean
   toward the pointer. Mouse only; the normal cursor stays visible. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,s=BC.s;
if(!BC.fine||BC.reduced)return;
var cur=$('#cur'),label=$('#cur-l'),x=-100,y=-100,big=false;
var WORDS={tr:{click:'tıkla',drag:'sürükle'},en:{click:'click',drag:'drag'}};
BC.tickers.push(function(dt){
  if(!s.mouse)return;
  cur.classList.add('on');
  x+=(s.px-x)*Math.min(1,dt*16);y+=(s.py-y)*Math.min(1,dt*16);
  cur.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
});
document.addEventListener('pointerover',function(e){
  var t=e.target.closest?e.target.closest('[data-cur],a,button'):null,want=!!t;
  if(want!==big){big=want;cur.classList.toggle('big',big)}
  var key=t&&t.getAttribute('data-cur');label.textContent=key?WORDS[s.lang][key]||'':'';
});
document.addEventListener('mouseleave',function(){cur.classList.remove('on')});
$$('.btn').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
    b.style.transform='translate3d('+((e.clientX-r.left-r.width/2)*0.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*0.32).toFixed(1)+'px,0)'});
  b.addEventListener('pointerleave',function(){b.style.transform=''});
});
})();
