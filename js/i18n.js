/* Turkish lives in the HTML. English is swapped in from this table; Turkish is read back from the page. */
(function(){
'use strict';
var BC=window.BC,$$=BC.$$,root=BC.root;
var EN={
'nav.label':'Sections','nav.about':'About','nav.projects':'Projects','nav.skills':'Skills','nav.path':'Milestones','nav.contact':'Contact',
'hero.role':'Software developer',
'hero.intro':'I build web apps, backend services and systems written from scratch. I learn how real systems work by building small versions of them myself.',
'hero.cta1':'See the projects',
'about.h':'About',
'about.p1':'I work on web development, backend services and robotics software. I write small versions of well-known products end to end: API, background jobs, database, tests and interface.',
'about.p2':'In my latest project I wrote the inference engine that runs a language model in C++ and CUDA, without using any ML library.',
'about.web':'Interfaces with React and Next.js, end-to-end apps in TypeScript.',
'about.back':'APIs and worker services in Go and NestJS. Queues, retries and state machines on PostgreSQL.',
'about.sysT':'Systems','about.sys':'Low-level work in C++, CUDA and Rust. Robot control code in Java and WPILib.',
'proj.h':'Projects','proj.sub':'Six projects, newest first.','proj.code':'View the code',
'p1.kind':'Systems programming',
'p1.desc':'A verifiable inference engine for the Qwen3 language model, written from scratch.',
'p1.a':'No ML libraries. The tokenizer, GGUF parser, forward pass and every CUDA kernel are written in this repository.',
'p1.b':'With quantized weights it matches an independent fp32 implementation to within 2.7e-5.',
'p1.c':'A separate Rust process (bekci, Turkish for guard) validates and gates every tool call the model produces.',
'p2.desc':'A webhook delivery service. It delivers events to subscribers with signed requests, retries the failures and keeps a history.',
'p2.a':'At-least-once delivery: exponential backoff, dead-lettering and replay.',
'p2.b':'PostgreSQL is the only dependency. The queue is a table read with FOR UPDATE SKIP LOCKED.',
'p2.c':'Standard Webhooks signatures and SSRF protection on every connection.',
'p3.kind':'Web, in development',
'p3.desc':'A small version of Calendly. The user sets available times and visitors pick one to book.',
'p3.a':'Still in development, the repository is not public yet.',
'p4.desc':'A multi-tenant monitoring service that watches services and serves a public status page.',
'p4.a':'Two separate Go processes: api and worker. One keeps running while the other restarts.',
'p4.b':'A state machine catches real outages, not momentary errors. Incident records open and close on their own.',
'p4.c':'No ORM: goose migrations and sqlc code generation.',
'p5.desc':'A multi-tenant platform with a feedback board, a public roadmap and an embeddable widget.',
'p5.a':'Users post requests and vote, the team manages them on a drag-and-drop kanban board.',
'p5.b':'Status changes reach voters through a background job queue.',
'p5.c':'Unit, integration and end-to-end tests with Playwright.',
'p6.kind':'Robotics','p6.title':'FRC 7840 robot code',
'p6.desc':'Software for the floor intake and the shooter mechanism on the 2026 season robot.',
'p6.a':'Written in Java with WPILib.',
'p6.b':'The team won the Haliç Regional and the Innovation in Control Award with this robot.',
'skills.h':'Skills','skills.sub':'Drag the system to rotate it.','skills.g1':'Languages','skills.g2':'Frameworks','skills.g3':'Data and tools',
'path.h':'Milestones',
't1.h':'First season with FRC 7840','t1.p':'Started competing as a programmer on the EMONER Robotics team.',
't2.w':'March 2026','t2.h':'Haliç Regional win','t2.p':'The team finished qualifications 3rd and became Regional Winners. It also took the Innovation in Control Award at the same event.',
't3.w':'April 2026','t3.p':'The team finished qualifications 11th and captained Alliance 7.',
't4.p':'The team competed in the Galileo Division at the world championship.',
't5.w':'August 2026','t5.h':'Canny Mini and Uptime Mini','t5.p':'My first two SaaS experiments went public on GitHub.',
't6.w':'October 2026','t6.p':'The 14-phase plan was completed and a final review was done.',
't7.w':'November 2026','t7.p':'The inference engine and its guard went public on GitHub.',
't8.w':'Next','t8.p':'I am working on the appointment scheduling app.',
'contact.h':'Contact','contact.p':'For a project, an idea or a question, send me an email.','contact.copy':'Copy email address',
'foot.note':'Hand-written in HTML, CSS, JavaScript and three.js.','plate.word':'World','proj.detail':'Details','ui.close':'Close','term.label':'Command'
};
var TR={};
BC.ui={tr:{copied:'Kopyalandı',copyFail:'Kopyalanamadı, adresi elle seç',title:'Burak Çelik Portfolyo'},
       en:{copied:'Copied',copyFail:'Could not copy, select the address by hand',title:'Burak Çelik Portfolio'}};
$$('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n');if(!(k in TR))TR[k]=el.textContent});
$$('[data-i18n-aria]').forEach(function(el){var k=el.getAttribute('data-i18n-aria');if(!(k in TR))TR[k]=el.getAttribute('aria-label')});
BC.t=function(k){return (BC.s.lang==='en'?EN:TR)[k]};
BC.langHooks=[];
BC.setLang=function(l,save){
  var lang=BC.s.lang=l==='en'?'en':'tr',d=lang==='en'?EN:TR;
  root.lang=lang;document.title=BC.ui[lang].title;
  $$('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n');if(d[k]!=null)el.textContent=d[k]});
  $$('[data-i18n-aria]').forEach(function(el){var k=el.getAttribute('data-i18n-aria');if(d[k]!=null)el.setAttribute('aria-label',d[k])});
  $$('.lang button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});
  if(save){try{localStorage.setItem('bc-lang',lang)}catch(e){}}
  BC.langHooks.forEach(function(f){f(lang)});
  BC.plateIdx=-1;BC.measure();
};
$$('.lang button').forEach(function(b){b.addEventListener('click',function(){BC.setLang(b.dataset.lang,true)})});

var copyBtn=BC.$('#copy'),timer=0;
copyBtn.addEventListener('click',function(){
  var done=function(ok){copyBtn.textContent=ok?BC.ui[BC.s.lang].copied:BC.ui[BC.s.lang].copyFail;clearTimeout(timer);
    timer=setTimeout(function(){copyBtn.textContent=BC.t('contact.copy')},2400)};
  try{navigator.clipboard.writeText('burakcelik1061@gmail.com').then(function(){done(true)},function(){done(false)})}catch(e){done(false)}
});
})();
