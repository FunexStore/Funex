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

  // Theme Toggle (Dark/Light Mode)
  const initTheme = () => {
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.innerHTML = '🌓';
    themeBtn.setAttribute('aria-label', 'Toggle theme');

    // Add to main-nav ul
    const navUl = qs('.main-nav ul');
    if(navUl) {
      const li = document.createElement('li');
      li.appendChild(themeBtn);
      navUl.appendChild(li);
    }

    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  };
  initTheme();

  // Header Logic (Home vs Inner Pages)
  const initHeader = () => {
    const header = qs('#site-header');
    if(!header) return;

    const path = window.location.pathname;
    const isHome = path === '/' || path.endsWith('index.html') || path === '';

    if(!isHome) {
      header.classList.add('inner-page');
      // Prepend back link if it doesn't exist
      if(!qs('.back-link', header)) {
        const backLink = document.createElement('div');
        backLink.className = 'back-link';
        backLink.innerHTML = '←';
        backLink.addEventListener('click', () => {
          if (document.referrer.includes(window.location.host)) {
            history.back();
          } else {
            window.location.href = 'index.html';
          }
        });
        const navInner = qs('.nav-inner', header);
        navInner.insertBefore(backLink, navInner.firstChild);
      }
    }
  };
  initHeader();

  // Hamburger menu toggle for mobile
  const hamburgers = qsa('.hamburger');
  const navCloses = qsa('.nav-close');
  const mainNav = qs('.main-nav');

  const toggleNav = (force) => {
    document.body.classList.toggle('nav-open', force);
  };

  hamburgers.forEach(hamburger => {
    hamburger.addEventListener('click', () => toggleNav(true));
  });

  navCloses.forEach(close => {
    close.addEventListener('click', () => toggleNav(false));
  });

  // Close nav on link click
  qsa('.nav-link', mainNav).forEach(link => {
    link.addEventListener('click', () => toggleNav(false));
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
  const revealAction = (el) => el.classList.add('revealed');
  const ro = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        revealAction(entry.target);
        ro.unobserve(entry.target);
      }
    });
  }, {threshold:0.1});
  qsa('.reveal').forEach(el=>ro.observe(el));

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

  // Order Form Summary Logic
  const serviceSelect = qs('#service-select');
  if(serviceSelect) {
    const summaryService = qs('#summary-service');
    const summaryPrice = qs('#summary-price');
    const summaryTime = qs('#summary-time');

    serviceSelect.addEventListener('change', (e) => {
      const option = e.target.options[e.target.selectedIndex];
      if(option.value) {
        summaryService.textContent = option.text;
        summaryPrice.textContent = option.dataset.price || '—';
        summaryTime.textContent = option.dataset.time || '—';
      } else {
        summaryService.textContent = 'Not selected';
        summaryPrice.textContent = '—';
        summaryTime.textContent = '—';
      }
    });
  }

  // EmailJS Integration & Form Handling
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // Replace with your Public Key
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // Replace with your Service ID
  const EMAILJS_ORDER_TEMPLATE = "YOUR_ORDER_TEMPLATE_ID"; // Replace with your Template ID
  const EMAILJS_CONTACT_TEMPLATE = "YOUR_CONTACT_TEMPLATE_ID";

  if(typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  const handleFormSubmission = (formId, templateId, successCallback) => {
    const form = qs(formId);
    if(!form) return;

    const btn = qs('button[type="submit"]', form);
    const btnText = qs('.btn-text', btn) || btn;
    const btnLoader = qs('.btn-loader', btn);
    const status = qs('.form-status', form) || document.createElement('p');
    if(!qs('.form-status', form)) {
      status.className = 'form-status mt-4';
      form.appendChild(status);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple Validation
      if(!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Show loading
      btn.disabled = true;
      const originalText = btnText.textContent;
      if(btnText !== btn) btnText.style.display = 'none';
      if(btnLoader) btnLoader.style.display = 'block';
      else btn.textContent = 'Sending...';

      status.className = 'form-status mt-4';
      status.textContent = 'Sending your request...';

      const formData = new FormData(form);
      const params = Object.fromEntries(formData.entries());

      // If Public Key is still placeholder, simulate success for demo
      if(EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
        console.warn("EmailJS is in simulation mode. Replace placeholders in js/app.js with real keys.");
        setTimeout(() => {
          status.textContent = 'Simulation: Request sent successfully!';
          status.classList.add('success');
          successCallback(params);
        }, 1500);
        return;
      }

      emailjs.send(EMAILJS_SERVICE_ID, templateId, params)
        .then(() => {
          status.textContent = 'Success! Your message has been sent.';
          status.classList.add('success');
          successCallback(params);
        })
        .catch((err) => {
          console.error("EmailJS Error:", err);
          status.textContent = 'Failed to send. Please try again or contact us via WhatsApp.';
          status.classList.add('error');
          btn.disabled = false;
          if(btnText !== btn) btnText.style.display = 'inline';
          if(btnLoader) btnLoader.style.display = 'none';
          else btn.textContent = originalText;
        });
    });
  };

  const onOrderSuccess = (params) => {
    const name = params.user_name || 'Creative';
    setTimeout(() => {
      window.location.href = `thank-you.html?name=${encodeURIComponent(name)}&type=order`;
    }, 1000);
  };

  const onContactSuccess = (params) => {
    const name = params.name || 'Friend';
    setTimeout(() => {
      window.location.href = `thank-you.html?name=${encodeURIComponent(name)}&type=contact`;
    }, 1000);
  };

  handleFormSubmission('#order-form', EMAILJS_ORDER_TEMPLATE, onOrderSuccess);
  handleFormSubmission('#contact-form', EMAILJS_CONTACT_TEMPLATE, onContactSuccess);

  // FAQ Accordion
  qsa('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.parentElement;
      const open = parent.classList.toggle('open');
      const content = parent.querySelector('.faq-a');
      if (open) {
        content.style.maxHeight = content.scrollHeight + 'px';
        const chev = btn.querySelector('.chev');
        if (chev) chev.textContent = '−';
      } else {
        content.style.maxHeight = null;
        const chev = btn.querySelector('.chev');
        if (chev) chev.textContent = '+';
      }
    });
  });

  // Close any mobile nav when resizing to desktop
  window.addEventListener('resize', ()=>{
    if(window.innerWidth >= 1024){
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
