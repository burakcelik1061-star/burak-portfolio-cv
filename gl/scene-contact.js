/* World 5, sunrise. A paper plane that flies after the pointer (on touch screens it loops on its
   own), trailing a line behind it, among loose sheets of paper. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,s=BC.s,rnd=G.rnd,clamp=BC.clamp;
var scene=new T.Scene(),cam=G.cam(10);
G.lights(scene,0xfff1c8,0.9,0xffffff,0.75,0xff9f1c,0.5);
var INK=0x0B0A1F;

/* the plane: two wings and a keel */
var pg=new T.BufferGeometry();
pg.setAttribute('position',new T.BufferAttribute(new Float32Array([
  0,0,1.25, 0,0.06,-0.85, -0.95,0.1,-0.85,
  0,0,1.25, 0.95,0.1,-0.85, 0,0.06,-0.85,
  0,0,1.25, 0,-0.42,-0.7, 0,0.06,-0.85]),3));
pg.computeVertexNormals();
var plane=new T.Group(),body=G.mesh(pg,G.mat(0xFFFFFF,{side:T.DoubleSide,roughness:0.7}));
body.add(G.edges(pg,1,INK));plane.add(body);scene.add(plane);plane.scale.setScalar(0.62);

/* trail */
var TN=90,tp=new Float32Array(TN*3),tg=new T.BufferGeometry();tg.setAttribute('position',new T.BufferAttribute(tp,3));
var trail=new T.Line(tg,G.lineMat(0.55,INK));trail.frustumCulled=false;scene.add(trail);

/* loose sheets and two slow rings */
var sheets=[],shGeo=new T.PlaneGeometry(0.9,1.2);
for(var i=0;i<(G.small?5:9);i++){
  var m=G.mesh(shGeo,G.mat(0xFFFFFF,{side:T.DoubleSide,roughness:0.8}));m.add(G.edges(shGeo,0.5,INK));
  m.userData={x:1+rnd()*9,y:(rnd()-.5)*9,z:-2-rnd()*7,sp:0.15+rnd()*0.25,ph:rnd()*6};scene.add(m);sheets.push(m);
}
var rings=[G.circle(2.6,0.55,INK),G.circle(3.1,0.3,INK)];rings.forEach(function(r){scene.add(r)});

var t=0,pos=new T.Vector3(3,0,0),vel=new T.Vector3(2,0.5,0),tgt=new T.Vector3(),w=new T.Vector3(),look=new T.Vector3(),bank=0,started=false;
G.add(5,{scene:scene,cam:cam,update:function(dt,info){
  t+=dt;
  var u=G.upp(cam),visW=innerWidth*u,visH=innerHeight*u,narrow=innerWidth<860,k;
  var hasPtr=s.mouse&&s.py>info.top&&s.py<info.bottom;
  if(hasPtr){G.toWorld(cam,s.px,s.py,w);tgt.set(w.x,w.y,0)}
  else tgt.set((narrow?0:visW*0.2)+Math.sin(t*0.7)*visW*0.22,(narrow?visH*0.28:0)+Math.sin(t*1.4)*visH*0.16,Math.cos(t*0.7)*1.2);
  if(!started){pos.copy(tgt).x+=3;for(k=0;k<TN;k++){tp[k*3]=pos.x;tp[k*3+1]=pos.y;tp[k*3+2]=pos.z}started=true}
  if(dt>0){
    w.copy(tgt).sub(pos);var dist=w.length();w.multiplyScalar(Math.min(6,dist*2.2)/(dist+1e-4));
    var before=Math.atan2(vel.y,vel.x);
    vel.lerp(w,Math.min(1,dt*2.4));
    if(vel.length()<1.2)vel.setLength(1.2);
    var turn=Math.atan2(vel.y,vel.x)-before;if(turn>Math.PI)turn-=6.283;if(turn<-Math.PI)turn+=6.283;
    bank+=(clamp(turn/dt*0.25,-1.1,1.1)-bank)*Math.min(1,dt*5);
    pos.addScaledVector(vel,dt);
    for(k=TN-1;k>0;k--){tp[k*3]=tp[k*3-3];tp[k*3+1]=tp[k*3-2];tp[k*3+2]=tp[k*3-1]}
    tp[0]=pos.x;tp[1]=pos.y;tp[2]=pos.z;tg.attributes.position.needsUpdate=true;
  }
  plane.position.copy(pos);look.copy(pos).add(vel);plane.lookAt(look);plane.rotateZ(-bank);
  for(k=0;k<sheets.length;k++){
    var m=sheets[k],d=m.userData;
    m.position.set((narrow?d.x-5.5:d.x)+Math.sin(t*d.sp+d.ph)*0.8,((d.y+t*d.sp*0.8+6)%12)-6,d.z);
    m.rotation.set(t*d.sp+d.ph,t*d.sp*0.7,Math.sin(t*d.sp)*0.5);
  }
  var rx=narrow?0:visW*0.24;
  rings[0].position.set(rx,0,-3);rings[1].position.set(rx,0,-3);
  rings[0].rotation.set(1.2+Math.sin(t*0.3)*0.2,t*0.2,0);rings[1].rotation.set(0.8,-t*0.15,0.4);
}});
})();
