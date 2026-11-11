/* World 4, sunset. A twisting tunnel of frames that the camera flies down as the milestones pass;
   a sun waits at the far end and grows as you approach. One gate per milestone marks where each
   entry comes into focus. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,s=BC.s,rnd=G.rnd;
var scene=new T.Scene(),cam=G.cam(0,62);
scene.fog=new T.Fog(0x3a0f4a,6,58);
var N=G.small?64:96,GAP=2,L=(N-14)*GAP,i,j;

/* frames: one geometry, coloured along its length */
var pos=new Float32Array(N*8*3),colr=new Float32Array(N*8*3),near=new T.Color(0xFF8A3D),mid=new T.Color(0xFF4D8D),far=new T.Color(0x9A6BFF),c=new T.Color();
for(i=0;i<N;i++){
  var z=-i*GAP,rot=i*0.085,h=2.6+Math.sin(i*0.4)*0.25,k=i/(N-1);
  c.copy(near).lerp(mid,Math.min(1,k*2));if(k>0.5)c.lerp(far,(k-0.5)*2);
  var pts=[];for(j=0;j<4;j++){var a=rot+j*Math.PI/2+Math.PI/4;pts.push([Math.cos(a)*h*1.25,Math.sin(a)*h])}
  for(j=0;j<4;j++){
    var p0=pts[j],p1=pts[(j+1)%4],o=(i*8+j*2)*3;
    pos[o]=p0[0];pos[o+1]=p0[1];pos[o+2]=z;pos[o+3]=p1[0];pos[o+4]=p1[1];pos[o+5]=z;
    colr[o]=c.r;colr[o+1]=c.g;colr[o+2]=c.b;colr[o+3]=c.r;colr[o+4]=c.g;colr[o+5]=c.b;
  }
}
var fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(pos,3));fg.setAttribute('color',new T.BufferAttribute(colr,3));
var frames=new T.LineSegments(fg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.9}));frames.frustumCulled=false;scene.add(frames);

/* rails through the corners */
(function(){
  var a=[];
  for(j=0;j<4;j++)for(i=0;i<N-1;i++){
    var r0=i*0.085+j*Math.PI/2+Math.PI/4,r1=(i+1)*0.085+j*Math.PI/2+Math.PI/4,h0=2.6+Math.sin(i*0.4)*0.25,h1=2.6+Math.sin((i+1)*0.4)*0.25;
    a.push(Math.cos(r0)*h0*1.25,Math.sin(r0)*h0,-i*GAP,Math.cos(r1)*h1*1.25,Math.sin(r1)*h1,-(i+1)*GAP);
  }
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(a),3));
  var l=new T.LineSegments(g,G.lineMat(0.28,0xFFD9B8));l.frustumCulled=false;scene.add(l);
})();

/* gates: one per milestone */
var gates=[],gateGeo=new T.TorusGeometry(1.9,0.025,8,48),MS=BC.$$('#tl li').length;
for(i=0;i<MS;i++){var gm=G.mesh(gateGeo,new T.MeshBasicMaterial({color:0xFFE0B0,transparent:true,opacity:0.7}),0,0,-(i/(MS-1))*L-5);scene.add(gm);gates.push(gm)}

/* streaks */
var SN=G.small?260:640,sp=new Float32Array(SN*3);
for(i=0;i<SN;i++){var a2=rnd()*6.283,r2=0.5+rnd()*2.6;sp[i*3]=Math.cos(a2)*r2*1.2;sp[i*3+1]=Math.sin(a2)*r2;sp[i*3+2]=-rnd()*(L+30)}
var sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(sp,3));
var streaks=new T.Points(sg,new T.PointsMaterial({color:0xFFD9B8,size:0.07,transparent:true,opacity:0.85,depthWrite:false}));streaks.frustumCulled=false;scene.add(streaks);

/* the sun at the end */
var sun=G.mesh(new T.CircleGeometry(9,64),new T.MeshBasicMaterial({color:0xFFB04A,fog:false}),0,0,-(L+34));scene.add(sun);
var glow=G.mesh(new T.RingGeometry(9,15,64),new T.MeshBasicMaterial({color:0xFF8A3D,fog:false,transparent:true,opacity:0.28,depthWrite:false}),0,0,-(L+34.5));scene.add(glow);

var t=0,cz=2,smx=0,smy=0;
G.add(4,{scene:scene,cam:cam,update:function(dt,info){
  t+=dt;
  var p=BC.root.classList.contains('depth')?BC.depthP:info.p;
  var target=-p*L;cz+=(target-cz)*(dt>0?Math.min(1,dt*5):1);
  smx+=(s.mx-smx)*Math.min(1,dt*3);smy+=(s.my-smy)*Math.min(1,dt*3);
  var bob=cz*0.085*0.5;
  cam.position.set(smx*0.5,-smy*0.35,cz);
  cam.rotation.set(smy*0.05,-smx*0.08,-cz*0.085*0.25+Math.sin(t*0.3)*0.03);
  for(var k=0;k<gates.length;k++){var d=Math.abs(gates[k].position.z-(cz-5));gates[k].rotation.z=t*0.4+k;gates[k].scale.setScalar(1+Math.max(0,1-d/6)*0.18);gates[k].material.opacity=0.75*Math.min(1,Math.max(0,(cz-gates[k].position.z-1.5)/7))}
  streaks.position.z=(t*1.5)%6;
  glow.rotation.z=t*0.05;
}});
})();
