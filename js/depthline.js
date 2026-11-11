/* Milestones: a pinned run through depth. Each entry starts far away on the z axis, arrives,
   then passes the camera as the next one comes up. Falls back to the list in sections.css. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,clamp=BC.clamp,s=BC.s,root=BC.root;
var sec=$('#milestones'),head=$('.path-head',sec),tl=$('#tl'),items=$$('li',tl),countN=$('#tl-n');
var n=items.length,on=false,step=0;
BC.depthP=0;

BC.layouts.push(function(){
  sec.style.height='';on=false;root.classList.remove('depth');
  items.forEach(function(li){li.style.transform='';li.style.opacity='';li.style.zIndex='';li.style.pointerEvents='';li.classList.remove('cur')});
  if(BC.reduced)return;
  root.classList.add('depth');
  var maxH=0;items.forEach(function(li){maxH=Math.max(maxH,li.offsetHeight)});
  if(s.headH+head.offsetHeight+maxH*1.25+60>innerHeight){root.classList.remove('depth');return}
  on=true;step=Math.max(300,innerHeight*0.5);
  sec.style.height=Math.round(innerHeight+(n-1)*step+step*0.4)+'px';
});

BC.updaters.push(function(y){
  if(!on){BC.depthP=s.secIdx===4?s.secP:0;return}
  var pos=clamp((y-sec._top)/step,-0.6,n-1+0.3),wide=s.vw>=900;
  var side=Math.min(s.vw*0.22,350),lift=s.vh*0.14;
  BC.depthP=clamp(pos/(n-1),0,1);
  for(var i=0;i<n;i++){
    var li=items[i],d=i-pos,sg=i%2?1:-1,z=-d*(d<0?1050:680);
    var op=d>=0?1-clamp((d-3.2)/1.1,0,1):1-clamp(-d/0.42,0,1);
    var x=wide?sg*side:0,yy=wide?0:sg*lift,ry=wide?-sg*clamp(d,0,1.2)*16:0;
    li.style.transform='translate(-50%,-50%) translate3d('+x.toFixed(1)+'px,'+yy.toFixed(1)+'px,'+z.toFixed(1)+'px) rotateY('+ry.toFixed(2)+'deg)';
    li.style.opacity=op.toFixed(3);li.style.zIndex=String(200-Math.round(d*20));
    li.style.pointerEvents=op<0.05?'none':'';
    var isCur=Math.abs(d)<0.5;if(isCur!==li.classList.contains('cur'))li.classList.toggle('cur',isCur);
  }
  countN.textContent=String(clamp(Math.round(pos),0,n-1)+1);
});
})();
