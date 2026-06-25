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
    const themeToggleBtns = qsa('.theme-toggle-nav');
    const themeStatusTexts = qsa('.theme-status');

    const updateThemeUI = (isLight) => {
      themeStatusTexts.forEach(el => el.textContent = isLight ? 'Light' : 'Dark');
    };

    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'light') {
      document.body.classList.add('light-mode');
      updateThemeUI(true);
    } else {
      updateThemeUI(false);
    }

    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeUI(isLight);
      });
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
      let backLink = qs('.back-link', header);

      // Create back link if it doesn't exist
      if(!backLink) {
        backLink = document.createElement('div');
        backLink.className = 'back-link';
        backLink.innerHTML = '←';
        const navInner = qs('.nav-inner', header);
        navInner.insertBefore(backLink, navInner.firstChild);
      }

      // Attach listener (ensures it works even if already in HTML)
      backLink.addEventListener('click', () => {
        if (document.referrer && document.referrer.includes(window.location.host)) {
          history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
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
  const EMAILJS_PUBLIC_KEY = "S0Vj-NqL2yqZ7_S_R"; // Placeholders for now, but following standard format
  const EMAILJS_SERVICE_ID = "service_funex";
  const EMAILJS_ORDER_TEMPLATE = "template_order";
  const EMAILJS_CONTACT_TEMPLATE = "template_contact";

  if(typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.indexOf("YOUR") === -1) {
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
      // Dynamically update FormSubmit redirect URL with parameters
      const nextInput = qs('input[name="_next"]', form);
      if (nextInput) {
        const name = qs('input[name="name"]', form)?.value || 'Client';
        const id = qs('input[name="project_id"]', form)?.value || 'FS-XXXX';
        const cost = qs('input[name="estimated_cost"]', form)?.value || '₹0';
        const isBuilder = form.id === 'project-builder-form';
        const targetPage = isBuilder ? 'confirmation.html' : 'thank-you.html';
        const typeParam = isBuilder ? '' : '&type=contact';

        // Build the URL correctly even for subdirectories (GitHub Pages)
        const baseUrl = window.location.href.split('/').slice(0, -1).join('/');
        let redirectUrl = `${baseUrl}/${targetPage}?name=${encodeURIComponent(name)}`;
        if (isBuilder) {
          redirectUrl += `&id=${encodeURIComponent(id)}&cost=${encodeURIComponent(cost)}`;
        } else {
          redirectUrl += `&type=contact`;
        }
        nextInput.value = redirectUrl;
      }

      // If we are using FormSubmit (action exists), let it submit naturally unless we have functional EmailJS
      const hasRealEmailJS = typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY.indexOf("YOUR") === -1 && EMAILJS_PUBLIC_KEY !== "S0Vj-NqL2yqZ7_S_R";

      if (!hasRealEmailJS && form.getAttribute('action') && form.getAttribute('action').includes('formsubmit.co')) {
        // Allow FormSubmit to handle it
        return;
      }

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
      if(!hasRealEmailJS) {
        console.warn("EmailJS is in simulation mode. Replace placeholders in js/app.js with real keys.");
        setTimeout(() => {
          status.textContent = 'Project request sent successfully!';
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
    const name = params.name || 'Creative';
    const id = params.project_id || 'FS-XXXX';
    const cost = params.estimated_cost || '₹0';
    setTimeout(() => {
      window.location.href = `confirmation.html?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&cost=${encodeURIComponent(cost)}`;
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
  handleFormSubmission('#project-builder-form', EMAILJS_ORDER_TEMPLATE, onOrderSuccess);

  // Project Builder Logic
  const initProjectBuilder = () => {
    const pbForm = qs('#project-builder-form');
    if(!pbForm) return;

    const serviceSel = qs('#pb-service');
    const packageRadios = qsa('input[name="pb-package"]');
    const lengthSel = qs('#pb-length');
    const addonChecks = qsa('.addon-checkbox input');

    const summaryId = qs('#summary-id');
    const summaryService = qs('#summary-service');
    const summaryPackage = qs('#summary-package');
    const summaryLength = qs('#summary-length');
    const summaryAddons = qs('#summary-addons');
    const summaryTotal = qs('#summary-total');

    const hiddenProjectId = qs('#hidden-project-id');
    const hiddenService = qs('#hidden-service');
    const hiddenPackage = qs('#hidden-package');
    const hiddenLength = qs('#hidden-length');
    const hiddenAddons = qs('#hidden-addons');
    const hiddenTotal = qs('#hidden-total');

    const pricing = {
      'music-video': { starter: 2999, pro: 5999, premium: 9999 },
      'youtube': { starter: 1999, pro: 3999, premium: 7999 },
      'reels': { starter: 699, pro: 1499, premium: 2999 }
    };

    const generateProjectId = () => {
      const id = 'FS-' + Math.floor(1000 + Math.random() * 9000);
      summaryId.textContent = id;
      hiddenProjectId.value = id;
    };
    generateProjectId();

    const updateCalculator = () => {
      const service = serviceSel.value;
      const pkg = Array.from(packageRadios).find(r => r.checked).value;
      const length = lengthSel.value;

      let total = pricing[service][pkg];

      // Service-specific summary text
      const serviceText = serviceSel.options[serviceSel.selectedIndex].text;
      summaryService.textContent = serviceText;
      summaryPackage.textContent = pkg.charAt(0).toUpperCase() + pkg.slice(1);
      summaryLength.textContent = lengthSel.options[lengthSel.selectedIndex].text;

      // Add-ons
      const selectedAddons = [];
      let addonsCost = 0;
      addonChecks.forEach(cb => {
        if(cb.checked) {
          const price = parseInt(cb.dataset.price);
          addonsCost += price;
          selectedAddons.push(cb.nextElementSibling.nextElementSibling.textContent);
        }
      });

      total += addonsCost;

      // Update Summary UI
      summaryAddons.innerHTML = selectedAddons.length > 0
        ? selectedAddons.map(a => `<li>${a}</li>`).join('')
        : '<li class="text-dim italic">None</li>';

      summaryTotal.textContent = `₹${total.toLocaleString()}`;

      // Update Hidden Fields
      hiddenService.value = serviceText;
      hiddenPackage.value = pkg;
      hiddenLength.value = lengthSel.options[lengthSel.selectedIndex].text;
      hiddenAddons.value = selectedAddons.join(', ') || 'None';
      hiddenTotal.value = `₹${total.toLocaleString()}`;
    };

    // Initial fill from URL params
    const params = new URLSearchParams(window.location.search);
    if(params.has('service')) serviceSel.value = params.get('service');
    if(params.has('package')) {
      const pkg = params.get('package');
      packageRadios.forEach(r => {
        if(r.value === pkg) r.checked = true;
      });
    }

    // Listeners
    serviceSel.addEventListener('change', updateCalculator);
    packageRadios.forEach(r => r.addEventListener('change', updateCalculator));
    lengthSel.addEventListener('change', updateCalculator);
    addonChecks.forEach(cb => cb.addEventListener('change', updateCalculator));

    updateCalculator();
  };
  initProjectBuilder();

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

  // Handle BFcache (Back-Forward Cache) to prevent blank pages on back button
  window.addEventListener('pageshow', (event) => {
    document.documentElement.style.opacity = '1';
    document.documentElement.style.transition = '';
  });

})();
