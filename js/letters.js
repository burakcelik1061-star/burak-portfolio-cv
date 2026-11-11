/* Splits headings into letters so each one can turn up on its own (see [data-split] in effects.css).
   The heading keeps its text as an aria-label; the letter spans are hidden from assistive tech. */
(function(){
'use strict';
var BC=window.BC,$$=BC.$$;
function split(el){
  var text=el.textContent,words=text.split(' '),i=0,n=text.replace(/ /g,'').length;
  el.setAttribute('aria-label',text);el.textContent='';
  el.style.setProperty('--n',n);
  words.forEach(function(w,wi){
    var wd=document.createElement('span');wd.className='wd';wd.setAttribute('aria-hidden','true');
    Array.from(w).forEach(function(c){var ch=document.createElement('span');ch.className='ch';ch.textContent=c;ch.style.setProperty('--i',i++);wd.appendChild(ch)});
    el.appendChild(wd);if(wi<words.length-1)el.appendChild(document.createTextNode(' '));
  });
}
BC.resplit=function(){$$('[data-split]').forEach(split)};
BC.resplit();
BC.langHooks.push(BC.resplit);
/* the e-mail address: letters lift in a wave on hover */
var mail=BC.$('#mail'),addr=mail.textContent;
mail.setAttribute('aria-label',addr);mail.textContent='';
Array.from(addr).forEach(function(c,i){var ch=document.createElement('span');ch.className='ch';ch.setAttribute('aria-hidden','true');ch.textContent=c;ch.style.setProperty('--i',i);mail.appendChild(ch)});
})();
