/* A small terminal for getting around the page by typing. */
(function(){
'use strict';
var BC=window.BC,$=BC.$,$$=BC.$$,s=BC.s;
var term=$('#term'),out=$('#term-out'),form=$('#term-form'),input=$('#term-in'),openBtn=$('#term-open'),closeBtn=$('#term-close');
var SECTIONS=['top','about','projects','skills','milestones','contact'],hist=[],hi=0,greeted=false;
var M={
 tr:{hi:'Merhaba. Komutları görmek için help yaz.',
     help:['help        bu liste','about       hakkımda','projects    proje listesi','open <n>    n. projenin detayını aç','skills      teknolojiler','contact     e-posta ve GitHub','goto <ad>   bölüme git: top, about, projects, skills, milestones, contact','lang tr|en  dili değiştir','shoot       FRC sahnesinde şut at','clear       ekranı temizle','exit        terminali kapat'],
     bad:'Böyle bir komut yok. help yaz.',badN:'1 ile 6 arasında bir sayı ver.',badS:'Bölüm bulunamadı.',ok:'Tamam.',shot:'Şut atıldı. Projeler bölümünde FRC kartına bak.'},
 en:{hi:'Hello. Type help to see the commands.',
     help:['help        this list','about       about me','projects    list the projects','open <n>    open the details of project n','skills      technologies','contact     e-mail and GitHub','goto <name> go to a section: top, about, projects, skills, milestones, contact','lang tr|en  switch language','shoot       take a shot in the FRC scene','clear       clear the screen','exit        close the terminal'],
     bad:'No such command. Type help.',badN:'Give a number from 1 to 6.',badS:'Section not found.',ok:'Done.',shot:'Shot taken. See the FRC card in Projects.'}
};
function print(text,cls){var d=document.createElement('div');if(cls)d.className=cls;d.textContent=text;out.appendChild(d);out.scrollTop=out.scrollHeight}
function names(){return $$('#stage .card h3').map(function(h,i){return (i+1)+'  '+h.textContent})}
function run(raw){
  var L=M[s.lang],parts=raw.trim().split(/\s+/),cmd=(parts[0]||'').toLowerCase(),arg=(parts[1]||'').toLowerCase();
  print('$ '+raw,'c');
  if(!cmd)return;
  if(cmd==='help')L.help.forEach(function(l){print(l)});
  else if(cmd==='about'){print(BC.t('hero.intro'))}
  else if(cmd==='projects'||cmd==='ls')names().forEach(function(l){print(l)});
  else if(cmd==='open'){var k=parseInt(arg,10);if(k>=1&&k<=6){print(L.ok);BC.openDetail(k-1)}else print(L.badN,'e')}
  else if(cmd==='skills')$$('.groups div').forEach(function(g){print(g.querySelector('dt').textContent+': '+g.querySelector('dd').textContent)});
  else if(cmd==='contact'){print('burakcelik1061@gmail.com');print('github.com/burakcelik1061-star')}
  else if(cmd==='goto'||cmd==='cd'){if(SECTIONS.indexOf(arg)>=0){document.getElementById(arg).scrollIntoView({behavior:BC.reduced?'auto':'smooth'});print(L.ok)}else print(L.badS,'e')}
  else if(cmd==='lang'){if(arg==='tr'||arg==='en'){BC.setLang(arg,true);print(M[s.lang].ok)}else print('lang tr | lang en','e')}
  else if(cmd==='shoot'){BC.gotoProject(5);setTimeout(function(){if(BC.gl.pokeDio)BC.gl.pokeDio()},1400);print(L.shot)}
  else if(cmd==='clear')out.textContent='';
  else if(cmd==='exit')close();
  else if(cmd==='whoami')print('Burak Çelik');
  else print(L.bad,'e');
}
function open(){term.hidden=false;if(!greeted){greeted=true;print(M[s.lang].hi)}input.focus();openBtn.setAttribute('aria-expanded','true')}
function close(){term.hidden=true;openBtn.setAttribute('aria-expanded','false');openBtn.focus()}
openBtn.addEventListener('click',function(){term.hidden?open():close()});
closeBtn.addEventListener('click',close);
form.addEventListener('submit',function(e){e.preventDefault();var v=input.value;input.value='';if(v.trim()){hist.push(v);hi=hist.length}run(v)});
input.addEventListener('keydown',function(e){
  if(e.key==='Escape'){close()}
  else if(e.key==='ArrowUp'&&hist.length){e.preventDefault();hi=Math.max(0,hi-1);input.value=hist[hi]}
  else if(e.key==='ArrowDown'&&hist.length){e.preventDefault();hi=Math.min(hist.length,hi+1);input.value=hist[hi]||''}
});
})();
