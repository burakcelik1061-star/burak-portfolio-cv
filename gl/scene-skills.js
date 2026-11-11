/* World 3, deep sea. The technologies orbit a core on three rings (frameworks inside, languages
   in the middle, tools outside). The page's own tags ride on the planets as labels, and the whole
   system turns when dragged. It stands in the box the page leaves for it (#orb). */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok||G.still)return;
var T=G.T,s=BC.s,$$=BC.$$,clamp=BC.clamp,rnd=G.rnd;
var scene=new T.Scene(),cam=G.cam(11,40);
G.lights(scene,0x9fe8ff,0.7,0xffffff,1.0,0xd9f24b,0.8);

var orb=BC.$('#orb'),tags=$$('.tag',orb),sys=new T.Group(),tilt=new T.Group();scene.add(sys);sys.add(tilt);
var RING={fw:{r:1.3,sp:0.42,c:0xD9F24B,inc:[0.25,0.1]},lang:{r:2.05,sp:0.26,c:0xFFFFFF,inc:[-0.18,0.22]},tool:{r:2.8,sp:0.17,c:0x7FE3F0,inc:[0.1,-0.28]}};
var planets=[],counts={fw:0,lang:0,tool:0},idx={fw:0,lang:0,tool:0};
tags.forEach(function(t){counts[t.dataset.g]++});
Object.keys(RING).forEach(function(k){
  var R=RING[k],g=new T.Group();g.rotation.set(R.inc[0],0,R.inc[1]);tilt.add(g);R.g=g;R.spin=new T.Group();g.add(R.spin);
  R.spin.add(G.circle(R.r,0.4,R.c));
});
var pGeo=new T.IcosahedronGeometry(1,1);
tags.forEach(function(tag){
  var k=tag.dataset.g,R=RING[k],a=idx[k]++/counts[k]*6.2832,size=0.17+rnd()*0.08;
  var m=G.mesh(pGeo,G.mat(R.c,{roughness:0.4,emissive:R.c,emissiveIntensity:0.12}),Math.cos(a)*R.r,0,Math.sin(a)*R.r);
  m.scale.setScalar(size);R.spin.add(m);planets.push({m:m,tag:tag,g:k,size:size,v:new T.Vector3()});
});
var coreGeo=new T.IcosahedronGeometry(0.62,0),core=G.mesh(coreGeo,G.mat(0x0B5563,{emissive:0x06323A,emissiveIntensity:0.6,roughness:0.35,metalness:0.2}));
core.add(G.edges(coreGeo,1,0xD9F24B));tilt.add(core);
var shell=G.edges(new T.IcosahedronGeometry(0.95,1),0.25,0xEAFBFF);tilt.add(shell);

/* plankton */
(function(){
  var n=G.small?200:500,a=new Float32Array(n*3);
  for(var i=0;i<n;i++){a[i*3]=(rnd()-.5)*30;a[i*3+1]=(rnd()-.5)*18;a[i*3+2]=-2-rnd()*16}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(a,3));
  var pts=new T.Points(g,new T.PointsMaterial({color:0xD9F24B,size:0.06,transparent:true,opacity:0.55,depthWrite:false}));
  scene.add(pts);scene.userData.plankton=pts;
})();

orb.classList.add('live');orb.setAttribute('data-cur','drag');
var yaw=0,pitch=0.5,vy=0,vp=0,drag=false,lx=0,ly=0;
orb.addEventListener('pointerdown',function(ev){drag=true;lx=ev.clientX;ly=ev.clientY;try{orb.setPointerCapture(ev.pointerId)}catch(_){}});
orb.addEventListener('pointermove',function(ev){if(!drag)return;vy=(ev.clientX-lx)*0.006;vp=(ev.clientY-ly)*0.004;lx=ev.clientX;ly=ev.clientY;yaw+=vy;pitch=clamp(pitch+vp,-0.3,1.3)});
var end=function(){drag=false};orb.addEventListener('pointerup',end);orb.addEventListener('pointercancel',end);

var t=0,w=new T.Vector3(),grow=0;
G.add(3,{scene:scene,cam:cam,update:function(dt,info){
  t+=dt;
  var u=G.upp(cam),r=orb.getBoundingClientRect(),i;
  G.toWorld(cam,r.left+r.width/2,r.top+r.height/2,w);
  grow+=((info.active?1:0.4)-grow)*Math.min(1,dt*2.2);
  sys.position.set(w.x,w.y,0);sys.scale.setScalar(r.width*u/5.3*(0.5+0.5*grow));
  if(!drag){yaw+=vy;vy*=Math.pow(0.05,dt);pitch+=(0.5-pitch)*Math.min(1,dt*0.6)}
  tilt.rotation.set(pitch+s.my*0.08,yaw+s.mx*0.12,0);
  RING.fw.spin.rotation.y=t*RING.fw.sp;RING.lang.spin.rotation.y=-t*RING.lang.sp;RING.tool.spin.rotation.y=t*RING.tool.sp;
  core.rotation.set(t*0.3,t*0.4,0);shell.rotation.set(-t*0.12,t*0.1,0);
  scene.userData.plankton.position.y=((t*0.25)%4)-2;
  sys.updateMatrixWorld(true);
  var hot=BC.skillGroup||'';
  for(i=0;i<planets.length;i++){
    var p=planets[i];p.v.setFromMatrixPosition(p.m.matrixWorld);
    var depth=clamp((p.v.z/sys.scale.x+3)/6,0,1),on=hot===p.g;
    p.m.scale.setScalar(p.size*(on?1.7:1));
    p.v.project(cam);
    var x=(p.v.x*0.5+0.5)*innerWidth-r.left,y=(-p.v.y*0.5+0.5)*innerHeight-r.top-14-depth*8;
    p.tag.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) translate(-50%,-100%) scale('+(0.66+depth*0.42).toFixed(3)+')';
    p.tag.style.opacity=(0.35+depth*0.65).toFixed(2);p.tag.style.zIndex=String(Math.round(depth*100));
  }
}});
G.skillsLive=true;
})();
