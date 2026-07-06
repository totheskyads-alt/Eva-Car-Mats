/* =========================================================
   EVA Car Mats Ireland — shared JS
   ========================================================= */
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  // ---- year stamp ----
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // ---- mobile menu toggle ----
  const toggle = $('.menu-toggle');
  const navClose = $('.nav-close');
  const navPanel = $('.nav-primary');
  if(toggle){
    const closeAllDropdowns = () => {
      $$('.nav-has-dropdown').forEach(d => {
        d.classList.remove('open');
        const btn = d.querySelector('.nav-dropdown-toggle');
        if(btn) btn.setAttribute('aria-expanded', 'false');
      });
    };
    const openMenu = () => {
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      closeAllDropdowns();
    };
    toggle.addEventListener('click', () => {
      document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
    if(navClose){ navClose.addEventListener('click', closeMenu); }
    // close when clicking backdrop (outside panel)
    document.addEventListener('click', (e) => {
      if(!document.body.classList.contains('menu-open')) return;
      if(navPanel && !navPanel.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  // ---- mobile services dropdown accordion ----
  $$('.nav-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      if(window.innerWidth > 768) return; // desktop handled by CSS :hover
      const parent = btn.closest('.nav-has-dropdown');
      const isOpen = parent.classList.contains('open');
      // close others
      $$('.nav-has-dropdown').forEach(d => {
        d.classList.remove('open');
        const b = d.querySelector('.nav-dropdown-toggle');
        if(b) b.setAttribute('aria-expanded', 'false');
      });
      if(!isOpen){
        parent.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // ---- header shadow on scroll ----
  const header = $('.site-header');
  if(header){
    const sync = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  // ---- toast helper ----
  window.toast = (msg) => {
    let t = document.querySelector('.toast');
    if(!t){
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => t.classList.remove('show'), 4000);
  };

  // ---- color swatch picker ----
  $$('.color-swatches').forEach(group => {
    group.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch');
      if(!sw) return;
      group.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      const input = sw.querySelector('input');
      if(input) input.checked = true;
    });
    // preselect first
    const first = group.querySelector('.swatch');
    if(first) first.classList.add('selected');
    const firstInput = first?.querySelector('input');
    if(firstInput) firstInput.checked = true;
  });

  // ---- model card picker ----
  $$('.model-grid').forEach(grid => {
    const multi = grid.dataset.multi === 'true';
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.model-card');
      if(!card) return;
      if(!multi){
        grid.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
      }
      card.classList.toggle('selected');
      // mirror into hidden input
      const hidden = grid.parentElement.querySelector('input[data-model-target]');
      if(hidden){
        const selected = Array.from(grid.querySelectorAll('.model-card.selected'))
          .map(c => c.dataset.value);
        hidden.value = selected.join(', ');
      }
    });
  });


  // ---- WhatsApp click-to-chat + anti-bot helpers ----
  const WA_NUMBER = '353894655600';
  function evaLabel(n){
    const map={name:'Name',phone:'Phone',email:'Email',make:'Make',model:'Model',year:'Year',
      vehicleType:'Vehicle type',material:'Material',colour:'Colour',color:'Colour',stitching:'Stitching',
      seats:'Seats',interest:'Interested in',contactMethod:'Preferred contact',contact_method:'Preferred contact',
      language:'Language',message:'Message',mats:'Mats',edging:'Edging',tint:'Tint',notes:'Notes',
      registration:'Registration',fleet:'Fleet size',service:'Service'};
    return map[n] || (n.charAt(0).toUpperCase()+n.slice(1).replace(/[_-]/g,' '));
  }
  function evaHoneypotTripped(form){ const h=form.querySelector('[name="website_url"]'); return !!(h && h.value.trim()); }
  function evaTooFast(form){ const t=parseInt(form.getAttribute('data-loaded-at')||'0',10); return t>0 && (Date.now()-t)<1500; }
  function evaFormToText(form){
    const parts=[];
    form.querySelectorAll('input,select,textarea').forEach(el=>{
      const n=el.name; if(!n||n==='website_url') return;
      if((el.type==='radio'||el.type==='checkbox')&&!el.checked) return;
      const v=(el.value||'').trim(); if(!v) return;
      parts.push(evaLabel(n)+': '+v);
    });
    return parts;
  }
  function evaSendWhatsApp(form){
    const text='New enquiry — EVA Car Mats website\n\n'+evaFormToText(form).join('\n');
    const url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text);
    const w=window.open(url,'_blank'); if(!w) window.location.href=url;
  }
  $$('form').forEach(f=>f.setAttribute('data-loaded-at',String(Date.now())));

  // ---- form handling: validate + simulate submission ----
  $$('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(evaHoneypotTripped(form)||evaTooFast(form)){ form.reset(); toast('Thanks — we\'ll be in touch shortly.'); return; }
      let ok = true;
      const required = form.querySelectorAll('[required]');
      required.forEach(input => {
        const field = input.closest('.field') || input.parentElement;
        if(!input.value.trim()){
          field.classList.add('invalid');
          ok = false;
        } else {
          field.classList.remove('invalid');
        }
      });
      if(!ok){
        toast('Please complete the highlighted fields');
        return;
      }
      const btn = form.querySelector('[type="submit"]');
      if(btn){
        btn.disabled = true;
        const orig = btn.innerHTML;
        btn.innerHTML = 'Sending…';
        evaSendWhatsApp(form);
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = orig;
          form.reset();
          form.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
          form.querySelectorAll('.swatch:first-child').forEach(s => {
            s.classList.add('selected');
            const i = s.querySelector('input'); if(i) i.checked = true;
          });
          form.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
          toast('Opening WhatsApp to send your enquiry — just press send.');
        }, 600);
      }
    });
    // clear invalid on input
    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if(field) field.classList.remove('invalid');
    });
  });

  // ---- vehicle make/model cascade (simple realistic data) ----
  const VEHICLE_DATA = {
    'Toyota': ['Corolla', 'Prius', 'Avensis', 'Yaris', 'Auris', 'Camry', 'C-HR', 'RAV4', 'Hilux'],
    'Volkswagen': ['Passat', 'Golf', 'Polo', 'Tiguan', 'Touran', 'Caddy', 'Transporter', 'Sharan'],
    'Skoda': ['Octavia', 'Superb', 'Fabia', 'Kodiaq', 'Karoq', 'Scala'],
    'Hyundai': ['Ioniq', 'i30', 'i20', 'Tucson', 'Kona', 'Santa Fe'],
    'Kia': ['Niro', 'Sportage', 'Ceed', 'Sorento', 'Picanto'],
    'Ford': ['Mondeo', 'Focus', 'Fiesta', 'Kuga', 'Transit', 'Transit Custom', 'Ranger'],
    'BMW': ['3 Series', '5 Series', '1 Series', 'X1', 'X3', 'X5'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'Sprinter', 'Vito'],
    'Nissan': ['Qashqai', 'Juke', 'Leaf', 'X-Trail', 'Navara', 'NV200'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Trafic', 'Master'],
    'Peugeot': ['208', '308', '3008', '5008', 'Partner', 'Boxer'],
    'Opel': ['Astra', 'Corsa', 'Insignia', 'Vivaro', 'Movano'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'V60', 'S60'],
    'Citroën': ['C3', 'C4', 'Berlingo', 'Jumpy', 'Jumper'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Other': ['Other (specify in notes)']
  };

  $$('select[data-make]').forEach(makeSel => {
    // populate
    makeSel.innerHTML = '<option value="">Select make…</option>' +
      Object.keys(VEHICLE_DATA).map(m => `<option>${m}</option>`).join('');
    const modelSel = document.querySelector(`select[data-model][data-pair="${makeSel.dataset.make}"]`)
      || makeSel.closest('form')?.querySelector('select[data-model]');
    if(modelSel){
      modelSel.innerHTML = '<option value="">Select make first…</option>';
      modelSel.disabled = true;
      makeSel.addEventListener('change', () => {
        const models = VEHICLE_DATA[makeSel.value] || [];
        if(models.length){
          modelSel.innerHTML = '<option value="">Select model…</option>' +
            models.map(m => `<option>${m}</option>`).join('');
          modelSel.disabled = false;
        } else {
          modelSel.innerHTML = '<option value="">Select make first…</option>';
          modelSel.disabled = true;
        }
      });
    }
  });

  // ---- populate year selects ----
  $$('select[data-year-select]').forEach(sel => {
    const now = new Date().getFullYear();
    let html = '<option value="">Year…</option>';
    for(let y = now + 1; y >= 1998; y--){
      html += `<option>${y}</option>`;
    }
    sel.innerHTML = html;
  });

  // ---- cookie consent banner ----
  (function(){
    const banner = document.getElementById('cookie-banner');
    const setH = (h) => document.documentElement.style.setProperty('--cookie-h', h + 'px');
    if(!banner){ setH(0); return; }
    const consent = localStorage.getItem('eva-cookie-consent');
    if(consent){ banner.classList.add('hidden'); setH(0); return; }
    const updateH = () => setH(banner.classList.contains('visible') ? banner.offsetHeight : 0);
    setTimeout(() => { banner.classList.add('visible'); updateH(); }, 800);
    window.addEventListener('resize', updateH);
    const accept = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');
    const dismiss = (choice) => {
      localStorage.setItem('eva-cookie-consent', choice);
      const granted = choice==='accepted';
      const v = granted ? 'granted' : 'denied';
      if(typeof gtag==='function'){ gtag('consent','update',{ad_storage:v,analytics_storage:v,ad_user_data:v,ad_personalization:v}); }
      (window.dataLayer=window.dataLayer||[]).push({event: granted?'consent_accepted':'consent_rejected'});
      banner.classList.remove('visible');
      setH(0);
      setTimeout(() => banner.classList.add('hidden'), 400);
    };
    if(accept) accept.addEventListener('click', () => dismiss('accepted'));
    if(decline) decline.addEventListener('click', () => dismiss('declined'));
    window.evaOpenCookieSettings=function(){ banner.classList.remove('hidden'); void banner.offsetWidth; banner.classList.add('visible'); updateH(); };
  })();

  // ---- WhatsApp floating button ----
  (function(){
    if(document.querySelector('.wa-fab')) return;
    const a = document.createElement('a');
    a.href = 'https://wa.me/353894655600?text=' + encodeURIComponent("Hi, I'm interested in EVA car mats.");
    a.className = 'wa-fab';
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Chat with us on WhatsApp');
    a.title = 'Chat on WhatsApp';
    a.innerHTML = '<svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M16.04 4C9.96 4 5 8.95 5 15.02c0 2.13.6 4.13 1.64 5.84L5 28l7.33-1.6a11.1 11.1 0 0 0 3.7.64h.01c6.08 0 11.04-4.95 11.04-11.02C27.08 8.95 22.12 4 16.04 4Zm0 20.13h-.01c-1.16 0-2.3-.31-3.3-.9l-.24-.14-3.94.86.84-3.84-.16-.25a8.86 8.86 0 0 1-1.36-4.74c0-4.92 4.01-8.92 8.94-8.92 2.39 0 4.63.93 6.32 2.62a8.86 8.86 0 0 1 2.62 6.31c0 4.92-4.01 8.94-8.95 8.94Zm4.9-6.68c-.27-.13-1.59-.78-1.83-.87-.25-.09-.43-.13-.61.13-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.13-1.13-.42-2.16-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.12-.12.27-.32.4-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.46-.83-2-.22-.53-.44-.46-.61-.46l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.83.13.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.59-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31Z"/></svg>';
    document.body.appendChild(a);
  })();


  window.evaSendWhatsApp=evaSendWhatsApp;window.evaHoneypotTripped=evaHoneypotTripped;window.evaTooFast=evaTooFast;
})();
