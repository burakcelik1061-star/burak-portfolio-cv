/* World 2, one colour per project. The diorama of the project in view stands where the page
   leaves room for it (.dio); moving to the next project sinks and spins the old one away while
   the new one rises. projects.js feeds the position and the colours. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,s=BC.s,rnd=G.rnd;
var scene=new T.Scene(),cam=G.cam(11,40);
scene.add(new T.AmbientLight(0xffffff,0.62));
var key=new T.DirectionalLight(0xffffff,1.05);key.position.set(3,7,6);scene.add(key);
var rim=new T.DirectionalLight(0xffffff,0.7);rim.position.set(-6,2,-3);scene.add(rim);

var dioEl=BC.$('#dio'),holder=new T.Group();scene.add(holder);
BC.proj=BC.proj||{on:false,pos:0,cur:0};
var dios=G.dioramas.map(function(build,i){
  var P=BC.P[i],M={white:G.mat(0xFFF6EC,{roughness:0.6}),ink:G.mat(P.panel,{roughness:0.7}),acc:G.mat(P.acc,{roughness:0.4,emissive:P.acc,emissiveIntensity:0.18}),accColor:new T.Color(P.acc).getHex()};
  var d=build(M),pivot=new T.Group();pivot.add(d.g);pivot.visible=false;holder.add(pivot);d.pivot=pivot;d.spin=0;return d;
});
G.pokeDio=function(){var d=dios[BC.proj.cur];if(d){d.poke();d.spin+=0.5}};

/* confetti drifting behind, in the project's accent */
var CN=G.small?26:60,conf=new T.InstancedMesh(new T.BoxGeometry(0.16,0.16,0.16),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5}),CN),cd=[];
for(var i=0;i<CN;i++)cd.push([(rnd()-.5)*26,(rnd()-.5)*14,-3-rnd()*12,rnd()*6,0.2+rnd()*0.5]);
scene.add(conf);
var m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),one=new T.Vector3(1,1,1),w=new T.Vector3(),accC=new T.Color();

var t=0,smx=0,smy=0;
G.add(2,{scene:scene,cam:cam,update:function(dt,info){
  t+=dt;
  var pr=BC.proj,u=G.upp(cam),k;
  smx+=(s.mx-smx)*Math.min(1,dt*3);smy+=(s.my-smy)*Math.min(1,dt*3);
  holder.visible=pr.on;
  if(pr.on){
    var r=dioEl.getBoundingClientRect();
    G.toWorld(cam,r.left+r.width/2,r.top+r.height*0.5,w);
    var size=Math.min(r.width,r.height*1.2)*u/5.3;
    holder.position.set(w.x-cam.position.x,w.y-cam.position.y,0);
    for(k=0;k<dios.length;k++){
      var d=dios[k],dd=k-pr.pos,ad=Math.abs(dd);
      d.pivot.visible=ad<0.98;if(!d.pivot.visible)continue;
      d.spin*=Math.pow(0.1,dt);
      var sc=size*(1-ad*0.55);
      d.pivot.scale.setScalar(sc);
      d.pivot.position.set(0,-ad*ad*size*4.2,-ad*2);
      d.pivot.rotation.set(0.5+smy*0.12,-0.55+t*0.12+dd*2.6+smx*0.3+d.spin,0);
      if(ad<0.6)d.tick(t,dt);
    }
  }
  accC.set(BC.P[pr.cur].acc);conf.material.color.lerp(accC,Math.min(1,dt*3));rim.color.lerp(accC,Math.min(1,dt*3));
  for(k=0;k<CN;k++){
    var c=cd[k];e.set(t*c[4]+c[3],t*c[4]*0.7,0);q.setFromEuler(e);
    v.set(c[0]+Math.sin(t*0.2+c[3])*0.6,((c[1]+t*c[4]*0.6+7)%14)-7,c[2]);m4.compose(v,q,one);conf.setMatrixAt(k,m4);
  }
  conf.instanceMatrix.needsUpdate=true;
  cam.position.set(smx*0.3,-smy*0.2,11);
}});
})();
