/* The WebGL stage.
   One renderer draws, every frame:
   1. the ground: a fluid shader that paints each section's colour world and gives every section
      boundary its own edge shape (slash, shutters, arch, wave, scallops)
   2. the 3D scene of each section in view, clipped to that section's part of the screen,
      so scrolling opens a window from one world onto the next
   Scenes register themselves with BC.gl.add(index, {scene, cam, update}). */
(function(){
'use strict';
var BC=window.BC,s=BC.s,root=BC.root,clamp=BC.clamp;
var G=BC.gl={ok:false,still:BC.reduced,defs:[],cams:[]};
if(!window.THREE){root.classList.add('no-gl');return}
var T=G.T=window.THREE,canvas=BC.$('#gl'),renderer;
try{renderer=new T.WebGLRenderer({canvas:canvas,alpha:false,antialias:true,powerPreference:'high-performance'})}
catch(e){root.classList.add('no-gl');return}
G.ok=true;G.renderer=renderer;renderer.autoClear=false;
G.small=Math.min(innerWidth,innerHeight)<700;
var dpr=Math.min(window.devicePixelRatio||1,G.small?1.5:2);

/* seeded random so every visit builds the same scenes */
var seed=20261111;
G.rnd=function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
G.gauss=function(){return (G.rnd()+G.rnd()+G.rnd()+G.rnd()-2)/2};

/* ---------- colour worlds (mirrors base.css; world 2 is rewritten live by projects.js) ---------- */
function C(h){return new T.Color(h)}
G.pal=[
  {a:C('#0B0A1F'),b:C('#2A1B6B'),c:C('#4FE3FF')},
  {a:C('#E9EEF5'),b:C('#C9D6E8'),c:C('#1535C9')},
  {a:C('#0A5C45'),b:C('#12936B'),c:C('#B6F36A')},
  {a:C('#06323A'),b:C('#0B5563'),c:C('#D9F24B')},
  {a:C('#2B0B3F'),b:C('#8A1F5C'),c:C('#FF8A3D')},
  {a:C('#FFC23C'),b:C('#FF9F1C'),c:C('#FFF4D6')}
];

/* ---------- ground shader ---------- */
var U={
  uRes:{value:new T.Vector2(1,1)},uDpr:{value:dpr},uTime:{value:0},uMouse:{value:new T.Vector2(-999,-999)},
  uA:{value:[C(0),C(0),C(0)]},uB:{value:[C(0),C(0),C(0)]},uC:{value:[C(0),C(0),C(0)]},
  uY1:{value:-9999},uY2:{value:9999},uT1:{value:0},uT2:{value:0}
};
var bgMat=new T.ShaderMaterial({
  depthTest:false,depthWrite:false,uniforms:U,
  vertexShader:'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:[
    'precision highp float;',
    'uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec2 uMouse;',
    'uniform vec3 uA[3];uniform vec3 uB[3];uniform vec3 uC[3];',
    'uniform float uY1;uniform float uY2;uniform float uT1;uniform float uT2;',
    'float hash(float n){return fract(sin(n*127.1)*43758.5453);}',
    'float edge(float type,float x,float w){',
    ' if(type<0.5)return (x-0.5)*w*0.085;',
    ' if(type<1.5){float c=floor(x*9.0);return (hash(c+3.0)-0.5)*120.0;}',
    ' if(type<2.5){float u=(x-0.5)*2.0;return 45.0-sqrt(max(0.0,1.0-u*u))*95.0;}',
    ' if(type<3.5)return sin(x*9.42+uTime*0.8)*26.0+sin(x*23.0-uTime*1.3)*9.0;',
    ' return 30.0-abs(sin(x*7.0+uTime*0.35))*62.0+sin(x*31.0)*5.0;}',
    'vec3 fluid(vec3 a,vec3 b,vec3 c,vec2 uv,float asp,vec2 m){',
    ' vec2 p=vec2(uv.x*asp,uv.y);float t=uTime*0.05;',
    ' float n=sin(p.x*1.7+t*3.0+sin(p.y*2.3-t*2.0)*1.3)*0.5+0.5;',
    ' float k=sin(p.y*2.1-t*2.5+sin(p.x*1.9+t*1.7)*1.5)*0.5+0.5;',
    ' vec2 d=uv-m;d.x*=asp;float g=exp(-dot(d,d)*5.0);',
    ' vec3 col=mix(a,b,smoothstep(0.15,0.95,n*0.55+k*0.55+g*0.22));',
    ' return mix(col,c,pow(n*k,3.0)*0.14+g*0.05);}',
    'void main(){',
    ' vec2 size=uRes/uDpr;vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;vec2 uv=css/size;float asp=size.x/size.y;vec2 m=uMouse/size;',
    ' float e1=uY1+edge(uT1,uv.x,size.x);float e2=uY2+edge(uT2,uv.x,size.x);vec3 col;',
    ' if(css.y<e1)col=fluid(uA[0],uB[0],uC[0],uv,asp,m);',
    ' else if(css.y<e2)col=fluid(uA[1],uB[1],uC[1],uv,asp,m);',
    ' else col=fluid(uA[2],uB[2],uC[2],uv,asp,m);',
    ' col=mix(col,uC[1],(1.0-smoothstep(0.0,2.2,abs(css.y-e1)))*0.85);',
    ' col=mix(col,uC[2],(1.0-smoothstep(0.0,2.2,abs(css.y-e2)))*0.85);',
    ' col+=(hash(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))-0.5)*0.014;',
    ' gl_FragColor=vec4(col,1.0);}'].join('\n')
});
var bgScene=new T.Scene(),bgCam=new T.Camera(),bgMesh=new T.Mesh(new T.PlaneGeometry(2,2),bgMat);
bgMesh.frustumCulled=false;bgScene.add(bgMesh);

/* ---------- helpers shared by the scenes ---------- */
G.cam=function(z,fov){var c=new T.PerspectiveCamera(fov||45,innerWidth/innerHeight,0.1,300);c.position.z=z;G.cams.push(c);return c};
/* world units per CSS pixel on the z = 0 plane of a camera that looks straight down -z */
G.upp=function(cam){return 2*Math.tan(cam.fov*Math.PI/360)*cam.position.z/innerHeight};
G.toWorld=function(cam,sx,sy,out){var u=G.upp(cam);out.x=(sx-innerWidth/2)*u+cam.position.x;out.y=(innerHeight/2-sy)*u+cam.position.y;return out};
G.mat=function(color,o){var p={color:color,flatShading:true,roughness:0.55,metalness:0.05};if(o)for(var k in o)p[k]=o[k];return new T.MeshStandardMaterial(p)};
G.lineMat=function(op,color){return new T.LineBasicMaterial({color:color==null?0xffffff:color,transparent:op<1,opacity:op,depthWrite:false})};
G.edges=function(geo,op,color){return new T.LineSegments(new T.EdgesGeometry(geo),G.lineMat(op,color))};
G.circle=function(r,op,color,n){
  n=n||96;var a=new Float32Array((n+1)*3);
  for(var j=0;j<=n;j++){var t=j/n*6.2832;a[j*3]=Math.cos(t)*r;a[j*3+2]=Math.sin(t)*r}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(a,3));return new T.Line(g,G.lineMat(op,color));
};
G.mesh=function(geo,mat,x,y,z){var m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);return m};
G.lights=function(scene,amb,ambI,key,keyI,rim,rimI){
  scene.add(new T.AmbientLight(amb,ambI));
  var k=new T.DirectionalLight(key,keyI);k.position.set(4,6,7);scene.add(k);
  if(rim!=null){var r=new T.DirectionalLight(rim,rimI);r.position.set(-6,-2,3);scene.add(r)}
};
G.add=function(idx,def){G.defs[idx]=def};

/* ---------- sizing and adaptive quality ---------- */
G.resize=function(){
  renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight,false);
  U.uRes.value.set(innerWidth*dpr,innerHeight*dpr);U.uDpr.value=dpr;
  G.cams.forEach(function(c){c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix()});
  G.defs.forEach(function(d){if(d&&d.resize)d.resize()});
  G.dirty=true;
};
var slow=0,frames=0;
function quality(dt){
  if(dt>0.034)slow++;
  if(++frames>=120){if(slow>70&&dpr>1){dpr=Math.max(1,dpr-0.5);G.resize()}slow=0;frames=0}
}

/* ---------- frame ---------- */
var info={p:0,top:0,bottom:0,off:0,active:false,dt:0},lastKey='';
function paint(dt){
  var vw=innerWidth,vh=innerHeight,cur=s.secIdx,secs=BC.secs,n=secs.length,P=G.pal,i;
  var top=secs[cur]._top-s.y,bot=top+secs[cur]._h;
  var a=Math.max(cur-1,0),c=Math.min(cur+1,n-1);
  U.uA.value[0]=P[a].a;U.uB.value[0]=P[a].b;U.uC.value[0]=P[a].c;
  U.uA.value[1]=P[cur].a;U.uB.value[1]=P[cur].b;U.uC.value[1]=P[cur].c;
  U.uA.value[2]=P[c].a;U.uB.value[2]=P[c].b;U.uC.value[2]=P[c].c;
  U.uY1.value=cur===0?-9999:top;U.uY2.value=cur===n-1?99999:bot;
  U.uT1.value=cur-1;U.uT2.value=cur;
  U.uTime.value=s.time;U.uMouse.value.set(s.mouse?s.px:-999,s.mouse?s.py:-999);
  renderer.setScissorTest(false);renderer.setViewport(0,0,vw,vh);
  renderer.clear();renderer.render(bgScene,bgCam);
  for(i=a;i<=c;i++){
    var d=G.defs[i];if(!d)continue;
    var t=secs[i]._top-s.y,b=t+secs[i]._h;if(b<=0||t>=vh)continue;
    var y0=Math.max(t,0),y1=Math.min(b,vh);
    info.top=t;info.bottom=b;info.off=(t+b)/2-vh/2;info.active=i===cur;info.dt=dt;
    info.p=i===cur?s.secP:(i<cur?1:0);
    d.update(dt,info);
    renderer.setScissor(0,vh-y1,vw,y1-y0);renderer.setScissorTest(true);
    renderer.clearDepth();renderer.render(d.scene,d.cam);
  }
  renderer.setScissorTest(false);
}
G.resize();
BC.tickers.push(function(dt){
  if(G.still){ /* reduced motion: repaint only when something moved */
    var key=s.y+'|'+s.secIdx+'|'+innerWidth+'|'+innerHeight+'|'+(G.dirty?1:0);
    if(key===lastKey)return;lastKey=s.y+'|'+s.secIdx+'|'+innerWidth+'|'+innerHeight+'|0';G.dirty=false;paint(0);return;
  }
  quality(dt);paint(dt);
});
})();
