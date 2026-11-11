/* Skills. Hovering a group lights its tags (and its planets in the 3D system).
   If the 3D system is not running, the tags fall back to a sphere you can drag. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,clamp=BC.clamp,s=BC.s;
var orb=$('#orb'),tags=$$('.tag',orb);
$$('.groups div').forEach(function(g){
  g.addEventListener('pointerenter',function(){BC.skillGroup=g.dataset.g;tags.forEach(function(t){t.classList.toggle('on',t.dataset.g===g.dataset.g)})});
  g.addEventListener('pointerleave',function(){BC.skillGroup='';tags.forEach(function(t){t.classList.remove('on')})});
});
BC.orbFallback=function(){
  var pts=[],rx=-0.25,ry=0.4,drag=false,lx=0,ly=0,vy=0.0045,n=tags.length,ga=Math.PI*(3-Math.sqrt(5));
  for(var i=0;i<n;i++){var yy=1-(i+.5)/n*2,r=Math.sqrt(1-yy*yy),t=i*ga;pts.push([Math.cos(t)*r,yy,Math.sin(t)*r])}
  orb.classList.add('live','ball');
  function draw(){
    var R=orb.clientWidth*0.4,cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
    for(var i=0;i<n;i++){
      var p=pts[i],x=p[0]*cy+p[2]*sy,z=-p[0]*sy+p[2]*cy,y=p[1]*cx-z*sx;z=p[1]*sx+z*cx;
      var t=tags[i];
      t.style.transform='translate(-50%,-50%) translate3d('+(x*R).toFixed(1)+'px,'+(y*R).toFixed(1)+'px,0) scale('+(0.62+0.5*(z+1)/2).toFixed(3)+')';
      t.style.opacity=(0.28+0.72*(z+1)/2).toFixed(2);t.style.zIndex=String(Math.round(z*50)+50);
    }
  }
  orb.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;ly=e.clientY;try{orb.setPointerCapture(e.pointerId)}catch(_){}});
  orb.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;vy=dx*0.006;ry+=vy;rx=clamp(rx-dy*0.006,-1.2,1.2);draw()});
  var end=function(){drag=false};orb.addEventListener('pointerup',end);orb.addEventListener('pointercancel',end);
  BC.measurers.push(draw);
  BC.tickers.push(function(){if(BC.reduced||drag||s.secIdx<2||s.secIdx>4)return;ry+=vy;vy+=(0.0045-vy)*0.02;draw()});
};
})();
