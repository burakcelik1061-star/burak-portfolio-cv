/* Six small 3D dioramas, one per project, each standing on a round base about four units wide.
   A builder gets a material kit {white, ink, acc, accColor} and returns {g, tick(t, dt), poke()}:
   tick animates it, poke is what a click on it does. */
(function(){
'use strict';
var BC=window.BC,G=BC.gl;if(!G.ok)return;
var T=G.T,rnd=G.rnd;
var m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),col=new T.Color(),WHITE=new T.Color(0xffffff);

function base(M){
  var g=new T.Group(),geo=new T.CylinderGeometry(2.05,2.15,0.16,48);
  g.add(G.mesh(geo,M.ink,0,-0.08,0));
  var ring=G.circle(2.05,0.9,M.accColor);ring.position.y=0.005;g.add(ring);
  return g;
}

/* 0 exactinfer: a field of bars rising and falling together, with a scan line passing over */
function exactinfer(M){
  var g=base(M),n=8,bars=new T.InstancedMesh(new T.BoxGeometry(0.26,1,0.26),M.white,n*n),boost=0;
  g.add(bars);
  var scan=G.mesh(new T.BoxGeometry(3,1.5,0.03),new T.MeshBasicMaterial({color:M.accColor,transparent:true,opacity:0.28,depthWrite:false}),0,0.75,0);g.add(scan);
  var acc=new T.Color(M.accColor);
  return {g:g,poke:function(){boost=1},tick:function(t,dt){
    boost*=Math.pow(0.2,dt);
    for(var i=0;i<n;i++)for(var j=0;j<n;j++){
      var w=Math.sin(t*1.6-(i*0.55+j*0.35)),h=0.14+(0.5+boost*0.9)*w*w+boost*0.2*Math.abs(Math.sin(t*9+i+j));
      v.set((i-3.5)*0.36,h/2,(j-3.5)*0.36);sc.set(1,h,1);q.set(0,0,0,1);m4.compose(v,q,sc);bars.setMatrixAt(i*n+j,m4);
      col.copy(WHITE).lerp(acc,Math.min(1,h*1.1-0.25<0?0:h*1.1-0.25));bars.setColorAt(i*n+j,col);
    }
    bars.instanceMatrix.needsUpdate=true;if(bars.instanceColor)bars.instanceColor.needsUpdate=true;
    scan.position.z=Math.sin(t*0.9)*1.4;
  }};
}

/* 1 Hook Mini: packets leave the queue for four endpoints; one endpoint fails and gets a retry */
function hook(M){
  var g=base(M),src=new T.Vector3(-1.35,0.5,0),ends=[],i;
  var srcGeo=new T.BoxGeometry(0.8,0.8,0.8);
  var srcMesh=G.mesh(srcGeo,M.white,src.x,0.4,0);srcMesh.add(G.edges(srcGeo,0.5,0x000000));g.add(srcMesh);
  for(i=0;i<3;i++)g.add(G.mesh(new T.BoxGeometry(0.84,0.05,0.84),M.acc,src.x,0.2+i*0.2,0));
  var endGeo=new T.BoxGeometry(0.42,0.42,0.42),lineA=[];
  for(i=0;i<4;i++){
    var p=new T.Vector3(1.35,0.5,(i-1.5)*0.8),mesh=G.mesh(endGeo,G.mat(0xffffff),p.x,0.21+0.29,p.z);
    g.add(mesh);ends.push({p:p,mesh:mesh,pop:0,bad:0});
    lineA.push(src.x+0.4,src.y,src.z,p.x-0.21,p.y,p.z);
  }
  var lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(new Float32Array(lineA),3));
  g.add(new T.LineSegments(lg,G.lineMat(0.55,0xffffff)));
  var PN=14,pk=new T.InstancedMesh(new T.SphereGeometry(0.1,10,8),M.acc,PN),pool=[],timer=0,failNext=true;
  for(i=0;i<PN;i++)pool.push({on:false,lane:0,t:0,dir:1,retry:false});
  g.add(pk);
  function spawn(lane){
    for(var k=0;k<PN;k++)if(!pool[k].on){var d=pool[k];d.on=true;d.lane=lane;d.t=0;d.dir=1;d.retry=lane===2&&failNext;if(lane===2)failNext=!failNext;return}
  }
  var red=new T.Color(0xff5148);
  return {g:g,poke:function(){for(var k=0;k<4;k++)spawn(k)},tick:function(t,dt){
    timer-=dt;if(timer<=0){timer=0.5;spawn((rnd()*4)|0)}
    for(var k=0;k<PN;k++){
      var d=pool[k];
      if(d.on){
        d.t+=d.dir*dt*1.15;
        var en=ends[d.lane];
        if(d.dir>0&&d.t>=1){
          if(d.retry){d.retry=false;d.dir=-1;en.bad=1}
          else{d.on=false;en.pop=1}
        }else if(d.dir<0&&d.t<=0.45){d.dir=1}
        v.set(src.x+0.4+(en.p.x-0.21-src.x-0.4)*d.t,en.p.y+Math.sin(d.t*Math.PI)*0.18,src.z+(en.p.z-src.z)*d.t);sc.set(1,1,1);
      }else{v.set(0,-5,0);sc.set(0.001,0.001,0.001)}
      q.set(0,0,0,1);m4.compose(v,q,sc);pk.setMatrixAt(k,m4);
    }
    pk.instanceMatrix.needsUpdate=true;
    for(k=0;k<4;k++){
      var E=ends[k];E.pop*=Math.pow(0.03,dt);E.bad*=Math.pow(0.25,dt);
      E.mesh.scale.setScalar(1+E.pop*0.35);E.mesh.material.color.copy(WHITE).lerp(red,Math.min(1,E.bad*1.4));
    }
  }};
}

/* 2 Booking Mini: a calendar of tiles; slots lift and take the accent colour as they are booked */
function booking(M){
  var g=base(M),cols=5,rows=4,n=cols*rows,tiles=new T.InstancedMesh(new T.BoxGeometry(0.48,0.12,0.48),G.mat(0xffffff),n);
  var h=new Float32Array(n),booked=[],timer=0.6,acc=new T.Color(M.accColor),i;
  g.add(tiles);
  var clock=new T.Group();clock.position.set(0,1.5,-1.35);g.add(clock);
  var ringGeo=new T.TorusGeometry(0.58,0.06,8,40);clock.add(G.mesh(ringGeo,M.white));
  var hm=G.mesh(new T.BoxGeometry(0.05,0.36,0.05),M.acc,0,0.18,0),hh=new T.Group();hh.add(hm);clock.add(hh);
  var mm=G.mesh(new T.BoxGeometry(0.04,0.5,0.04),M.white,0,0.25,0),mh=new T.Group();mh.add(mm);clock.add(mh);
  g.add(G.mesh(new T.CylinderGeometry(0.04,0.04,0.95,8),M.white,0,0.47,-1.35));
  var frame=G.edges(new T.BoxGeometry(0.56,0.2,0.56),1,M.accColor);g.add(frame);
  function book(){
    if(booked.length>=9){booked.length=0;return}
    var k;do{k=(rnd()*n)|0}while(booked.indexOf(k)>=0);booked.push(k);
    frame.position.set((k%cols-2)*0.56,0.5,(Math.floor(k/cols)-1.5)*0.56+0.25);
  }
  return {g:g,poke:book,tick:function(t,dt){
    timer-=dt;if(timer<=0){timer=0.85;book()}
    for(i=0;i<n;i++){
      var on=booked.indexOf(i)>=0;h[i]+=((on?0.42:0)-h[i])*Math.min(1,dt*9);
      v.set((i%cols-2)*0.56,0.06+h[i],(Math.floor(i/cols)-1.5)*0.56+0.25);sc.set(1,1,1);q.set(0,0,0,1);m4.compose(v,q,sc);tiles.setMatrixAt(i,m4);
      col.copy(WHITE).lerp(acc,Math.min(1,h[i]/0.42));tiles.setColorAt(i,col);
    }
    tiles.instanceMatrix.needsUpdate=true;if(tiles.instanceColor)tiles.instanceColor.needsUpdate=true;
    frame.position.y+=(0.62-frame.position.y)*Math.min(1,dt*6);
    hh.rotation.z=-t*0.25;mh.rotation.z=-t*1.5;
  }};
}

/* 3 Uptime Mini: a radar sweeping over five servers; now and then one goes down and comes back */
function uptime(M){
  var g=base(M),i,towers=[],timer=3;
  for(i=1;i<=3;i++){var c=G.circle(i*0.6,0.5,0xffffff);c.position.y=0.02;g.add(c)}
  var beamGeo=new T.CircleGeometry(1.85,20,0,0.7);beamGeo.rotateX(-Math.PI/2);
  var beam=G.mesh(beamGeo,new T.MeshBasicMaterial({color:M.accColor,transparent:true,opacity:0.35,side:T.DoubleSide,depthWrite:false}),0,0.03,0);g.add(beam);
  var red=new T.Color(0xff5148),ok=new T.Color(M.accColor);
  [[0,0.25],[1.25,1.1],[2.5,1.55],[3.75,0.85],[5.0,1.45]].forEach(function(d,k){
    var hgt=0.7+((k*37)%5)*0.16,geo=new T.BoxGeometry(0.34,hgt,0.34);
    var tw=G.mesh(geo,M.white,Math.cos(d[0])*d[1],hgt/2,Math.sin(d[0])*d[1]);
    for(var r=1;r<4;r++)tw.add(G.mesh(new T.BoxGeometry(0.36,0.02,0.36),M.ink,0,-hgt/2+r*hgt/4,0));
    var light=G.mesh(new T.SphereGeometry(0.09,10,8),new T.MeshBasicMaterial({color:M.accColor}),0,hgt/2+0.14,0);tw.add(light);
    g.add(tw);towers.push({m:tw,light:light,h:hgt,down:0,pop:0});
  });
  function outage(){var tw=towers[(rnd()*5)|0];tw.down=2.6}
  return {g:g,poke:outage,tick:function(t,dt){
    beam.rotation.y=-t*1.4;
    timer-=dt;if(timer<=0){timer=5.5;outage()}
    towers.forEach(function(tw,k){
      var was=tw.down>0;tw.down-=dt;if(was&&tw.down<=0)tw.pop=1;tw.pop*=Math.pow(0.03,dt);
      var dn=tw.down>0;
      tw.m.position.y=tw.h/2-(dn?0.18:0);tw.m.scale.setScalar(1+tw.pop*0.25);
      tw.light.material.color.copy(dn?red:ok);
      tw.light.visible=dn?(Math.sin(t*14)>0):true;
    });
  }};
}

/* 4 Canny Mini: three kanban columns; one request hops from column to column with its vote above it */
function canny(M){
  var g=base(M),i,j,X=[-1.15,0,1.15];
  for(i=0;i<3;i++){
    g.add(G.mesh(new T.BoxGeometry(0.98,0.06,2.5),M.white,X[i],0.03,0));
    for(j=0;j<(i===1?2:3);j++)g.add(G.mesh(new T.BoxGeometry(0.8,0.09,0.44),M.ink,X[i],0.11,-0.9+j*0.54));
  }
  var card=G.mesh(new T.BoxGeometry(0.8,0.1,0.44),M.acc,X[0],0.12,0.9);g.add(card);
  var vote=G.mesh(new T.ConeGeometry(0.16,0.3,4),M.acc,0,0.75,0);card.add(vote);
  var at=0,ph=0,dwell=1.2;
  return {g:g,poke:function(){dwell=0},tick:function(t,dt){
    if(ph<=0){dwell-=dt;if(dwell<=0){ph=0.0001}}
    else{ph+=dt*1.5;if(ph>=1){ph=0;at=(at+1)%3;dwell=1.3}}
    var a=X[at],b=X[(at+1)%3],k=ph<=0?0:ph*ph*(3-2*ph);
    card.position.set(a+(b-a)*k,0.12+Math.sin(k*Math.PI)*0.9,0.9);
    card.rotation.z=-Math.sin(k*Math.PI)*0.5*(b>a?1:-1);
    vote.position.y=0.55+Math.sin(t*3)*0.07;vote.rotation.y=t*1.2;
  }};
}

/* 5 FRC 7840: the robot drives along the field and shoots balls at the hoop. Click to shoot;
   it only goes in when the robot is in range. */
function frc(M){
  var g=base(M),i;
  g.add(G.mesh(new T.BoxGeometry(3.3,0.03,0.05),M.white,0,0.02,0.75));g.add(G.mesh(new T.BoxGeometry(3.3,0.03,0.05),M.white,0,0.02,-0.75));
  var bot=new T.Group();g.add(bot);
  bot.add(G.mesh(new T.BoxGeometry(0.9,0.26,0.74),M.white,0,0.31,0));
  bot.add(G.mesh(new T.BoxGeometry(0.98,0.14,0.82),M.acc,0,0.2,0));
  var wg=new T.CylinderGeometry(0.13,0.13,0.1,14);wg.rotateX(Math.PI/2);
  [[-0.3,0.42],[0.3,0.42],[-0.3,-0.42],[0.3,-0.42]].forEach(function(p){bot.add(G.mesh(wg,M.ink,p[0],0.13,p[1]))});
  var hood=G.mesh(new T.BoxGeometry(0.34,0.5,0.5),M.white,0.12,0.66,0);hood.rotation.z=-0.5;bot.add(hood);
  bot.add(G.mesh(new T.BoxGeometry(0.1,0.1,0.7),M.ink,-0.5,0.18,0));
  var RIM=new T.Vector3(1.28,1.72,0);
  g.add(G.mesh(new T.CylinderGeometry(0.05,0.05,1.95,8),M.white,1.72,0.97,0));
  g.add(G.mesh(new T.BoxGeometry(0.06,0.7,0.95),M.white,1.66,1.98,0));
  var rimGeo=new T.TorusGeometry(0.3,0.035,8,28);rimGeo.rotateX(Math.PI/2);g.add(G.mesh(rimGeo,M.acc,RIM.x,RIM.y,0));
  var BN=6,balls=[],ballGeo=new T.SphereGeometry(0.13,14,10);
  for(i=0;i<BN;i++){var b=G.mesh(ballGeo,M.acc,0,-5,0);b.visible=false;g.add(b);balls.push({m:b,on:false,p:new T.Vector3(),v:new T.Vector3(),hit:false,scored:false})}
  var rx=-1,auto=2,idle=0,GR=9.5,flash=0;
  BC.frc={shots:0,hits:0};
  function shoot(user){
    for(var k=0;k<BN;k++)if(!balls[k].on){
      var b=balls[k],Tm=0.95,err=rx-(-1.0);
      b.on=true;b.m.visible=true;b.hit=Math.abs(err)<0.3;b.scored=false;
      b.p.set(rx+0.25,0.85,0);
      var dx=RIM.x-b.p.x,dy=RIM.y+0.12-b.p.y;
      b.v.set(dx/Tm+(b.hit?0:err*1.9),(dy+0.5*GR*Tm*Tm)/Tm,0);
      if(user){BC.frc.shots++;if(BC.frcChanged)BC.frcChanged()}
      b.user=user;hood.position.x=0.02;return;
    }
  }
  return {g:g,poke:function(){idle=0;shoot(true)},tick:function(t,dt){
    rx=-1.05+Math.sin(t*0.9)*0.55;bot.position.x=rx;
    hood.position.x+=(0.12-hood.position.x)*Math.min(1,dt*8);
    idle+=dt;auto-=dt;
    if(idle>5&&auto<=0&&Math.abs(rx+1.0)<0.1){auto=2.4;shoot(false)}
    flash*=Math.pow(0.05,dt);
    for(var k=0;k<BN;k++){
      var b=balls[k];if(!b.on)continue;
      b.v.y-=GR*dt;b.p.addScaledVector(b.v,dt);
      if(b.hit&&!b.scored&&b.v.y<0&&b.p.y<RIM.y){b.scored=true;b.v.x=0;b.p.x=RIM.x;flash=1;if(b.user){BC.frc.hits++;if(BC.frcChanged)BC.frcChanged()}}
      if(!b.hit&&b.p.x>1.6&&b.v.x>0){b.v.x*=-0.45;b.p.x=1.6}
      if(b.p.y<0.13){b.on=false;b.m.visible=false}
      b.m.position.copy(b.p);
    }
  }};
}

G.dioramas=[exactinfer,hook,booking,uptime,canny,frc];
})();
