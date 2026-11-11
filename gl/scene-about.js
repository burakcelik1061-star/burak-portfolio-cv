/* World 1, ice. A fragment of a keyboard floating over the light ground: sixteen keycaps labelled
   with the languages and tools from the page. They bob on their own and sink when the pointer
   passes over them. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,s=BC.s,rnd=G.rnd;
var scene=new T.Scene(),cam=G.cam(10);
G.lights(scene,0xffffff,0.8,0xffffff,0.95,0x9db4ff,0.45);

var LABELS=['TS','JS','Go','C','C++','Py','Java','{ }','</>','git','SQL','sh','BÇ',';','=>','#!'];
var board=new T.Group();scene.add(board);
var capGeo=new T.CylinderGeometry(0.4,0.5,0.36,4,1);capGeo.rotateY(Math.PI/4);
var faceGeo=new T.PlaneGeometry(0.5,0.5);faceGeo.rotateX(-Math.PI/2);
var keys=[],faces=[];
function drawFace(k){
  var x=k.ctx,dark=k.kind===2;
  x.clearRect(0,0,128,128);x.fillStyle=dark?'#0A1556':'#FFFFFF';
  x.font='500 '+(k.label.length>3?40:k.label.length>2?46:58)+'px "Spline Sans Mono", ui-monospace, monospace';
  x.textAlign='center';x.textBaseline='middle';x.fillText(k.label,64,68);k.tex.needsUpdate=true;
}
LABELS.forEach(function(label,i){
  var kind=label==='BÇ'?2:(i%5===2?1:0),g=new T.Group();
  var body=G.mesh(capGeo,G.mat(kind===2?0xFFC23C:(kind===1?0x0A1556:0x1E44E0),{roughness:0.4}));
  body.add(G.edges(capGeo,0.35,kind===2?0x0A1556:0xffffff));g.add(body);
  var c=document.createElement('canvas');c.width=c.height=128;
  var tex=new T.CanvasTexture(c),k={g:g,label:label,kind:kind,ctx:c.getContext('2d'),tex:tex,
    lift:rnd()*0.55,ph:rnd()*6.28,press:0,v:new T.Vector3(),gx:(i%4-1.5)*0.86,gz:(Math.floor(i/4)-1.5)*0.86};
  g.add(G.mesh(faceGeo,new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),0,0.185,0));
  drawFace(k);board.add(g);keys.push(k);
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){keys.forEach(drawFace)});

/* a shadow under the board and a few loose solids drifting around it */
var shadow=G.mesh(new T.CircleGeometry(2.6,40),new T.MeshBasicMaterial({color:0x0A1556,transparent:true,opacity:0.1,depthWrite:false}),0,-1.1,0);
shadow.rotation.x=-Math.PI/2;board.add(shadow);
var loose=[];
[[new T.TorusGeometry(0.42,0.15,8,22),0x1E44E0],[new T.OctahedronGeometry(0.5,0),0x0A1556],[new T.BoxGeometry(0.6,0.6,0.6),0xFFC23C],[new T.ConeGeometry(0.4,0.8,5),0x1E44E0],[new T.IcosahedronGeometry(0.42,0),0xffffff]].forEach(function(d,i){
  var m=G.mesh(d[0],G.mat(d[1],{roughness:0.45}));m.add(G.edges(d[0],0.3,d[1]===0xffffff?0x0A1556:0xffffff));
  m.userData={a:i*1.256,r:3.6+rnd()*1.6,y:(rnd()-.5)*3.2,sp:0.08+rnd()*0.07};scene.add(m);loose.push(m);
});

var t=0,smx=0,smy=0,grow=0;
G.add(1,{scene:scene,cam:cam,update:function(dt,info){
  t+=dt;
  var u=G.upp(cam),visW=innerWidth*u,narrow=innerWidth<860;
  smx+=(s.mx-smx)*Math.min(1,dt*3);smy+=(s.my-smy)*Math.min(1,dt*3);
  grow+=((info.active?1:0.55)-grow)*Math.min(1,dt*2.5);if(G.still)grow=1;
  var par=-info.off*u*0.45;
  board.position.set(narrow?visW*0.24:-visW*0.25,(narrow?3.4:-1.5)+par,0);
  board.scale.setScalar((narrow?0.5:1.02)*(0.6+0.4*grow));
  board.rotation.set(0.92+smy*0.14,0.45+smx*0.25+Math.sin(t*0.3)*0.06,-0.16);
  for(var i=0;i<keys.length;i++){
    var k=keys[i],g=k.g,target=0;
    if(s.mouse&&!G.still){
      k.v.setFromMatrixPosition(g.matrixWorld).project(cam);
      var sx=(k.v.x*0.5+0.5)*innerWidth,sy=(-k.v.y*0.5+0.5)*innerHeight,d=Math.hypot(sx-s.px,sy-s.py);
      if(d<70)target=1;
    }
    k.press+=(target-k.press)*Math.min(1,dt*14);
    g.position.set(k.gx,k.lift*grow+Math.sin(t*1.1+k.ph)*0.07-k.press*0.3,k.gz);
    g.rotation.set(Math.sin(t*0.7+k.ph)*0.05,0,Math.cos(t*0.6+k.ph)*0.05);
  }
  for(i=0;i<loose.length;i++){
    var m=loose[i],d2=m.userData,a=d2.a+t*d2.sp;
    m.position.set((narrow?0:-visW*0.2)+Math.cos(a)*d2.r,d2.y+Math.sin(t*0.5+i)*0.3+par,Math.sin(a)*d2.r-3);
    m.rotation.set(t*0.3+i,t*0.22,0);
  }
  cam.position.set(smx*0.2,-smy*0.12,10);
}});
})();
