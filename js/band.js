/* The speed band under About: two rows of technology names that drift in opposite directions,
   speed up with the scroll and lean into it. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,s=BC.s,clamp=BC.clamp;
var WORDS=['TypeScript','Go','C++','CUDA','Rust','PostgreSQL','NestJS','Next.js','React','Docker','Java','Python'];
var rows=[$('#band-a'),$('#band-b')],x=[0,0],half=[1,1],band=$('.band');
rows.forEach(function(r,k){
  var list=k?WORDS.slice().reverse():WORDS;
  for(var rep=0;rep<2;rep++)list.forEach(function(w){var sp=document.createElement('span');sp.textContent=w;r.appendChild(sp)});
});
BC.measurers.push(function(){rows.forEach(function(r,k){half[k]=r.scrollWidth/2||1});band._top=BC.absTop(band)});
if(BC.reduced)return;
BC.tickers.push(function(dt){
  if(s.y+s.vh<band._top-200||s.y>band._top+600)return;
  var v=clamp(s.vel,-600,600),sk=(v*0.03).toFixed(2);
  for(var k=0;k<2;k++){
    x[k]+=(k?1:-1)*(60+Math.abs(v)*1.6)*dt*(v<0?-1:1);
    if(x[k]<-half[k])x[k]+=half[k];if(x[k]>0)x[k]-=half[k];
    rows[k].style.transform='translate3d('+x[k].toFixed(1)+'px,0,0) skewX('+(k?sk:-sk)+'deg)';
  }
});
})();
