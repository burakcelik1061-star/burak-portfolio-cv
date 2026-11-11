/* Hero: sizes the dimension line under the name and fits the e-mail address to one line.
   When the 3D letters are not running, the DOM name tilts in perspective instead. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,s=BC.s;
var tilt=$('#tilt'),nameEl=$('.name'),dim=$('#dim'),dimN=$('#dim-n'),mail=$('#mail'),hero=$('.hero');
var cx=0,cy=0;
BC.layouts.push(function(){
  var w=0;$$('.w',nameEl).forEach(function(el){w=Math.max(w,el.offsetWidth)});
  dim.style.width=w+'px';dimN.textContent=w+' px';
  mail.style.fontSize='';
  var box=mail.parentElement,cs=getComputedStyle(box),avail=box.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var fs=parseFloat(getComputedStyle(mail).fontSize),tw=mail.scrollWidth;
  if(tw>0)mail.style.fontSize=Math.max(14,Math.min(fs*Math.min(avail,1180)/tw,96)).toFixed(1)+'px';
});
BC.tickers.push(function(dt){
  if(BC.reduced||BC.root.classList.contains('gl-name')||s.y>(hero._h||s.vh))return;
  var tx,ty;
  if(s.mouse){tx=s.mx*11;ty=-s.my*8}else{tx=Math.sin(s.time*0.55)*7;ty=Math.cos(s.time*0.42)*4}
  var k=Math.min(1,dt*5),nx=cx+(tx-cx)*k,ny=cy+(ty-cy)*k;
  if(Math.abs(nx-cx)<0.004&&Math.abs(ny-cy)<0.004)return;
  cx=nx;cy=ny;
  tilt.style.setProperty('--tx',cx.toFixed(2));tilt.style.setProperty('--ty',cy.toFixed(2));
  tilt.style.setProperty('--dx',(-cx*0.085).toFixed(3));tilt.style.setProperty('--dy',(0.72+cy*0.06).toFixed(3));
});
})();
