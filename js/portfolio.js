// Accordion for FAQ
(function(){
  const qsa = (s, ctx=document)=>Array.from(ctx.querySelectorAll(s));
  qsa('.faq-q').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const parent = btn.parentElement;
      const open = parent.classList.toggle('open');
      const content = parent.querySelector('.faq-a');
      if(open){
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.querySelector('.chev').textContent = '−';
      } else {
        content.style.maxHeight = null;
        btn.querySelector('.chev').textContent = '+';
      }
    });
    // ensure initial height
    const content = btn.parentElement.querySelector('.faq-a');
    content.style.maxHeight = null;
  });
})();
