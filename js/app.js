// Core site behavior: preloader, nav, mobile menu, back-to-top, mouse glow, modals, smooth scroll, year stamps.
(function(){
  "use strict";

  // Helpers
  const qs = (s, ctx=document)=>ctx.querySelector(s);
  const qsa = (s, ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // Preloader
  window.addEventListener('load',()=>{
    const pre = qs('#preloader');
    if(pre){
      pre.style.opacity = '0';
      setTimeout(()=>pre.remove(),600);
    }
  });

  // Year in footer
  const currentYear = new Date().getFullYear();
  qsa('[id^="year"]').forEach(el=>el.textContent = currentYear);
  // Also handle ids like year-1, year-2 etc.
  qsa('[id^="year-"]').forEach(el=>el.textContent = currentYear);

  // Hamburger menu toggle for mobile
  const hamburgers = qsa('.hamburger');
  hamburgers.forEach(hamburger => {
    hamburger.addEventListener('click', ()=>{
      document.body.classList.toggle('nav-open');
      const nav = qs('.main-nav');
      if(nav) nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
    });
  });

  // Sticky header hide/show on scroll
  let lastScroll = 0;
  const header = qs('#site-header');
  window.addEventListener('scroll', ()=>{
    const st = window.scrollY || document.documentElement.scrollTop;
    if(st > lastScroll && st > 120){
      header && header.classList.add('hide');
    } else {
      header && header.classList.remove('hide');
    }
    lastScroll = st;
    // back-to-top
    const b = qs('#back-to-top');
    if(b) b.style.display = (st > 600) ? 'flex' : 'none';
  });

  // Back to top
  const back = qs('#back-to-top');
  back && back.addEventListener('click', e=>{
    e.preventDefault();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // Smooth scrolling for internal links
  document.addEventListener('click', e=>{
    const a = e.target.closest('a[href^="#"]');
    if(a){
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });

  // Mouse glow / custom cursor
  const mouseGlow = qs('#mouse-glow');
  document.addEventListener('mousemove', (e)=>{
    if(!mouseGlow) return;
    mouseGlow.style.transform = `translate3d(${e.clientX - 120}px, ${e.clientY - 120}px, 0)`;
  });

  // Video modal handling (two possible modals)
  const openVideo = (src) => {
    const modal = qs('#video-modal');
    if(!modal) return;
    const vid = modal.querySelector('video');
    const srcNode = vid.querySelector('source');
    srcNode.src = src || '';
    vid.load();
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    setTimeout(()=>modal.classList.add('open'),30);
  };
  const closeVideo = () => {
    const modal = qs('#video-modal');
    if(!modal) return;
    const vid = modal.querySelector('video');
    vid.pause();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    setTimeout(()=>modal.style.display='none',300);
  };

  // Attach play buttons
  qsa('.play-btn, .play-item').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const card = e.target.closest('[data-video]');
      const video = card && card.getAttribute('data-video');
      if(video){
        openVideo(video);
      } else {
        // if no video, gently show a quick modal telling "Coming Soon"
        alert('This project will be added soon.');
      }
    });
  });

  // Modal close buttons
  document.addEventListener('click', e=>{
    if(e.target.matches('.modal-close') || e.target.matches('.modal')){
      closeVideo();
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') closeVideo();
  });

  // Intersection observer: reveal on scroll
  const reveal = (el) => el.classList.add('reveal');
  const ro = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) reveal(entry.target);
    });
  }, {threshold:0.12});
  qsa('.service-card, .project-card, .pricing-card, .timeline li').forEach(el=>ro.observe(el));

  // Before/after slider
  const initBeforeAfter = (containerId, sliderId) => {
    const container = qs(containerId);
    if(!container) return;
    const slider = qs(sliderId);
    const after = container.querySelector('.ba-img.after');
    if(!slider || !after) return;
    let dragging = false;
    const update = (x)=>{
      const rect = container.getBoundingClientRect();
      let pos = ((x - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100,pos));
      after.style.clipPath = `inset(0 ${100-pos}% 0 0)`;
      slider.style.left = `${pos}%`;
      slider.setAttribute('aria-valuenow', Math.round(pos));
    };
    slider.addEventListener('pointerdown', ()=>dragging=true);
    window.addEventListener('pointerup', ()=>dragging=false);
    window.addEventListener('pointermove', (e)=>dragging && update(e.clientX));
    // touch fallback
    container.addEventListener('touchstart', (e)=>update(e.touches[0].clientX));
    container.addEventListener('touchmove', (e)=>update(e.touches[0].clientX));
  };

  initBeforeAfter('#before-after','#ba-slider');
  initBeforeAfter('#pa-before-after','#pa-slider');

  // Form handling: simple client-side redirect to thank-you
  const handleForm = (formId) => {
    const f = qs(`#${formId}`);
    if(!f) return;
    f.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      // Basic validation
      const valid = Array.from(f.elements).every(el=>{
        if(el.required){
          return el.value.trim() !== '';
        }
        return true;
      });
      if(!valid){
        alert('Please fill required fields.');
        return;
      }
      // Serialize minimal info and redirect with encoded name param
      const data = new URLSearchParams(new FormData(f)).toString();
      window.location.href = `thank-you.html?${data}`;
    });
  };
  handleForm('contact-form');
  handleForm('order-form');

  // Close any mobile nav when resizing to desktop
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 900){
      const nav = qs('.main-nav');
      if(nav) nav.style.removeProperty('display');
      document.body.classList.remove('nav-open');
    }
  });

  // Page transitions (simple fade)
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if(a && a.origin === location.origin && !a.hasAttribute('target') && a.href.indexOf('#') === -1){
      e.preventDefault();
      document.documentElement.style.transition = 'opacity .35s ease';
      document.documentElement.style.opacity = '0';
      setTimeout(()=> location.href = a.href, 350);
    }
  });

})();
