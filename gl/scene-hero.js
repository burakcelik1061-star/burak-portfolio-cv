/* World 0, night. The name is built from real cubes sampled from the display typeface: each cube
   is on a spring to its place in the letterform, the pointer pushes them out of the way, and
   scrolling on sends them past the camera. Beside it turns a small network with a lit core. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,s=BC.s,$=BC.$,$$=BC.$$,rnd=G.rnd,gauss=G.gauss,clamp=BC.clamp;
var scene=new T.Scene(),cam=G.cam(9);
G.lights(scene,0x8f8cff,0.75,0xffffff,1.15,0x4fe3ff,0.9);

/* ---------- voxel name ---------- */
var nameEl=$('.name'),spans=$$('.w',nameEl),nameGroup=new T.Group();scene.add(nameGroup);
var inst=null,count=0,cell=0.1,H,P,V,SD,cx=0,cy=0,awake=true,builtKey='';
var geo=new T.BoxGeometry(1,1,1),mat=G.mat(0xffffff,{roughness:0.45,metalness:0.1});
var m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),col=new T.Color();

function sample(target){
  /* draw each line with the page's own font, then keep the cells that land on ink */
  var F=240,pad=20,out=[],step=7,pass,canvases=[];
  spans.forEach(function(sp){
    var c=document.createElement('canvas'),x=c.getContext('2d');
    var font='800 condensed '+F+'px "Bricolage Grotesque", "Arial Narrow", sans-serif';
    x.font=font;try{x.fontStretch='condensed'}catch(_){}
    var tw=Math.ceil(x.measureText(sp.textContent).width);
    c.width=tw+pad*2;c.height=Math.ceil(F*1.5);
    x=c.getContext('2d');x.font=font;try{x.fontStretch='condensed'}catch(_){}
    x.fillStyle='#fff';x.textBaseline='alphabetic';x.fillText(sp.textContent,pad,F*1.05);
    var cap=x.measureText('B').actualBoundingBoxAscent||F*0.7;
    canvases.push({d:x.getImageData(0,0,c.width,c.height),tw:tw,cap:cap,base:F*1.05,sp:sp});
  });
  for(pass=0;pass<2;pass++){
    out.length=0;
    canvases.forEach(function(k){
      var r=k.sp.getBoundingClientRect(),scale=r.width/k.tw,d=k.d,w=d.width,h=d.height;
      var baseCss=r.top+window.scrollY+r.height/2+k.cap*scale/2;
      for(var j=step/2;j<h;j+=step)for(var i=step/2;i<w;i+=step){
        if(d.data[((j|0)*w+(i|0))*4+3]>120)out.push(r.left+(i-20)*scale,baseCss+(j-k.base)*scale,step*scale);
      }
    });
    if(pass===0){var n=out.length/3;step=clamp(step*Math.sqrt(n/target),4,26)}
  }
  return out;
}
function build(){
  var key=innerWidth+'x'+innerHeight+'|'+spans.map(function(sp){return sp.getBoundingClientRect().width|0}).join(',');
  if(key===builtKey||!spans[0].getBoundingClientRect().width)return;builtKey=key;
  var pts=sample(G.small?1100:2700),u=G.upp(cam),n=pts.length/3,i;
  if(inst){nameGroup.remove(inst);inst.dispose&&inst.dispose()}
  count=n;H=new Float32Array(n*3);P=new Float32Array(n*3);V=new Float32Array(n*3);SD=new Float32Array(n*2);
  inst=new T.InstancedMesh(geo,mat,n);inst.frustumCulled=false;
  cx=0;cy=0;
  for(i=0;i<n;i++){
    var x=(pts[i*3]-innerWidth/2)*u,y=(innerHeight/2-pts[i*3+1])*u;
    H[i*3]=x;H[i*3+1]=y;H[i*3+2]=0;cx+=x/n;cy+=y/n;
    SD[i*2]=rnd();SD[i*2+1]=rnd();
    if(G.still){P[i*3]=x;P[i*3+1]=y;P[i*3+2]=0}
    else{P[i*3]=x+gauss()*14;P[i*3+1]=y+gauss()*9;P[i*3+2]=4+rnd()*16}
    col.set(SD[i*2]<0.06?0x4fe3ff:(SD[i*2]<0.3?0xd9d6ff:0xffffff));inst.setColorAt(i,col);
  }
  cell=pts[2]*u;nameGroup.add(inst);awake=true;
  root3(0);
}
function root3(dt){
  if(!inst)return;
  var u=G.upp(cam),hp=s.heroP||0,exit=hp*hp,k=42,dmp=7.5,i,a,b;
  nameGroup.position.y=s.y*u;
  var mx=1e9,my=1e9;
  if(s.mouse&&!G.still){mx=(s.px-innerWidth/2)*u;my=(innerHeight/2-s.py)*u-nameGroup.position.y}
  var R=cell*11,R2=R*R,moving=false,size=cell*0.92;
  for(i=0;i<count;i++){
    a=i*3;b=i*2;
    var tx=H[a],ty=H[a+1],tz=0;
    if(exit>0.0005){tx+=(H[a]-cx)*exit*2.2;ty+=(H[a+1]-cy)*exit*2.2;tz=exit*(3+SD[b+1]*13)}
    var px=P[a],py=P[a+1],pz=P[a+2];
    var ax=(tx-px)*k-V[a]*dmp,ay=(ty-py)*k-V[a+1]*dmp,az=(tz-pz)*k-V[a+2]*dmp;
    var dx=px-mx,dy=py-my,d2=dx*dx+dy*dy;
    if(d2<R2){var d=Math.sqrt(d2)+1e-4,f=(1-d/R)*260*cell;ax+=dx/d*f;ay+=dy/d*f;az+=(SD[b]-0.35)*f*1.6}
    if(dt>0){
      V[a]+=ax*dt;V[a+1]+=ay*dt;V[a+2]+=az*dt;
      px=P[a]+=V[a]*dt;py=P[a+1]+=V[a+1]*dt;pz=P[a+2]+=V[a+2]*dt;
      if(Math.abs(V[a])+Math.abs(V[a+1])+Math.abs(V[a+2])>0.002)moving=true;
    }
    var ox=px-tx,oy=py-ty,oz=pz-tz;
    e.set(oz*1.4+oy*0.8,ox*1.2+oz*0.6,0);q.setFromEuler(e);
    v.set(px,py,pz);sc.set(size,size,size*2.6);m4.compose(v,q,sc);inst.setMatrixAt(i,m4);
  }
  inst.instanceMatrix.needsUpdate=true;if(inst.instanceColor)inst.instanceColor.needsUpdate=true;
  awake=moving;
}

/* ---------- network with a lit core ---------- */
var net=new T.Group(),netSpin=new T.Group();net.add(netSpin);scene.add(net);
(function(){
  var nodes=[],edges=[],seen={},i,j;
  for(i=0;i<30;i++){var u=1-(i+.5)/30*2,th=i*2.39996+rnd()*0.5,rr=Math.sqrt(1-u*u),R=1.6+rnd()*0.45;nodes.push([rr*Math.cos(th)*R,u*R,rr*Math.sin(th)*R])}
  for(i=0;i<30;i++){
    var ds=[];for(j=0;j<30;j++)if(j!==i){var a=nodes[i],b=nodes[j];ds.push([Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),j])}
    ds.sort(function(p,q2){return p[0]-q2[0]});
    for(j=0;j<3;j++){var o=ds[j][1],key=Math.min(i,o)+'-'+Math.max(i,o);if(!seen[key]){seen[key]=1;edges.push([i,o])}}
  }
  var a=new Float32Array(edges.length*6);
  for(j=0;j<edges.length;j++){a.set(nodes[edges[j][0]],j*6);a.set(nodes[edges[j][1]],j*6+3)}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(a,3));
  netSpin.add(new T.LineSegments(g,G.lineMat(0.38,0xd9d6ff)));
  var im=new T.InstancedMesh(new T.OctahedronGeometry(0.085,0),new T.MeshBasicMaterial({color:0x4fe3ff}),30),m=new T.Matrix4();
  for(j=0;j<30;j++){m.makeTranslation(nodes[j][0],nodes[j][1],nodes[j][2]);im.setMatrixAt(j,m)}
  netSpin.add(im);
  /* pulses that run along the edges */
  var PN=G.small?40:90,pp=new Float32Array(PN*3),pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pp,3));
  var pulses=new T.Points(pg,new T.PointsMaterial({color:0xffffff,size:0.07,transparent:true,opacity:0.9,depthWrite:false}));netSpin.add(pulses);
  var pd=[];for(j=0;j<PN;j++)pd.push({e:(rnd()*edges.length)|0,t:rnd(),s:0.25+rnd()*0.5});
  net.userData.tick=function(dt){
    for(var k=0;k<PN;k++){
      var d=pd[k];d.t+=d.s*dt;if(d.t>1){d.t=0;d.e=(rnd()*edges.length)|0}
      var p0=nodes[edges[d.e][0]],p1=nodes[edges[d.e][1]];
      pp[k*3]=p0[0]+(p1[0]-p0[0])*d.t;pp[k*3+1]=p0[1]+(p1[1]-p0[1])*d.t;pp[k*3+2]=p0[2]+(p1[2]-p0[2])*d.t;
    }
    pg.attributes.position.needsUpdate=true;
  };
})();
var coreGeo=new T.IcosahedronGeometry(0.82,0);
var core=G.mesh(coreGeo,G.mat(0x3a2bd0,{emissive:0x1a1060,emissiveIntensity:0.6,roughness:0.35,metalness:0.25}));
core.add(G.edges(coreGeo,0.9,0xd9d6ff));net.add(core);
var shell=G.edges(new T.IcosahedronGeometry(2.62,1),0.12,0xd9d6ff);net.add(shell);
var halo=G.circle(2.95,0.5,0x4fe3ff);halo.rotation.x=1.25;net.add(halo);

/* ---------- stars ---------- */
(function(){
  var n=G.small?300:700,a=new Float32Array(n*3);
  for(var i=0;i<n;i++){a[i*3]=(rnd()-.5)*40;a[i*3+1]=(rnd()-.5)*24;a[i*3+2]=-4-rnd()*26}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(a,3));
  scene.add(new T.Points(g,new T.PointsMaterial({color:0xd9d6ff,size:0.06,transparent:true,opacity:0.7,depthWrite:false})));
})();

var t=0,smx=0,smy=0,inScale=0;
G.add(0,{scene:scene,cam:cam,resize:function(){builtKey='';build()},update:function(dt){
  t+=dt;
  var u=G.upp(cam),visW=innerWidth*u,narrow=innerWidth/innerHeight<0.9,hp=s.heroP||0;
  if(G.still)root3(0);else if(BC.started&&(awake||s.mouse||hp>0)){var sub=dt>0.02?2:1;for(var q2=0;q2<sub;q2++)root3(Math.min(dt/sub,0.02))}
  smx+=(s.mx-smx)*Math.min(1,dt*3);smy+=(s.my-smy)*Math.min(1,dt*3);
  inScale+=(1-inScale)*Math.min(1,dt*1.6);if(G.still)inScale=1;
  var ns=(narrow?0.4:0.92)*(0.3+0.7*inScale);
  net.position.set(narrow?visW*0.2:visW*0.27,(narrow?innerHeight*u*0.36:0.35)+s.y*u*0.55,-1.5-hp*2);
  net.scale.setScalar(ns);
  net.rotation.set(smy*0.2,smx*0.3,0);
  netSpin.rotation.y=t*0.16;core.rotation.set(t*0.31,t*0.42,0);shell.rotation.set(t*0.05,-t*0.1,0);halo.rotation.z=t*0.2;
  if(dt>0)net.userData.tick(dt);
  cam.position.x=smx*0.25;cam.position.y=-smy*0.15;
}});
BC.heroBuild=build;
BC.heroSim=function(n){for(var i=0;i<n;i++)root3(0.016)};
/* put every cube straight on its place (used when the tab comes back from the background) */
BC.heroSnap=function(){if(!inst)return;for(var i=0;i<count*3;i++){P[i]=H[i];V[i]=0}awake=true};
document.addEventListener('visibilitychange',function(){if(!document.hidden&&BC.started)BC.heroSnap()});
BC.measurers.push(build);
BC.root.classList.add('gl-name');
})();
