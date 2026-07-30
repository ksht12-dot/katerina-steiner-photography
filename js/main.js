(() => {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contact-form');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header background
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Scroll reveal
  const revealTargets = document.querySelectorAll('.reveal:not(.hero .reveal)');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  // Golden window timeline fill
  const timelineFill = document.getElementById('timeline-fill');
  if (timelineFill) {
    const fillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          timelineFill.style.width = '68%';
          fillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    fillObserver.observe(timelineFill);
  }

  // Gift certificates
  //
  // Each "Buy" button links straight to that collection's Stripe Payment Link.
  // The $15 printed certificate is an optional item on the Stripe link itself,
  // so the giver pays it at checkout and the printed certificate still shows
  // the full collection value.
  //
  // Any href still containing "REPLACE" is treated as not-yet-configured: the
  // button greys out and won't navigate, so an unfinished link can never send
  // a buyer to a dead Stripe page.
  document.querySelectorAll('.gift-buy').forEach((btn) => {
    const url = btn.getAttribute('href') || '';
    if (!url.includes('REPLACE')) return;

    btn.classList.add('is-unconfigured');
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = 'Coming soon';
    btn.href = '#gifts';
    btn.addEventListener('click', (e) => e.preventDefault());
  });

  // Contact form
  //
  // Posts to the form service set in data-endpoint on the <form> (Formspree or
  // similar), which forwards inquiries to your inbox without your address ever
  // appearing on the site. While the endpoint is unset, the form falls back to
  // opening a pre-filled text message to (619) 634-1062 so it still works.
  const PHONE = '+16196341062';
  const PHONE_DISPLAY = '(619) 634-1062';

  if (form) {
    const note = document.getElementById('form-note');
    const submit = document.getElementById('form-submit');
    const endpoint = form.dataset.endpoint || '';
    const isConfigured = endpoint && !endpoint.includes('REPLACE');

    const say = (text, isError) => {
      if (!note) return;
      note.textContent = text;
      note.classList.toggle('form-note-error', Boolean(isError));
    };

    const summarise = (data) =>
      `Newborn session inquiry — ${data.get('name') || ''}\n` +
      `Email: ${data.get('email') || ''}\n` +
      `Due date / birth date: ${data.get('date') || ''}\n` +
      `Where: ${data.get('location') || ''}\n` +
      `${data.get('message') || ''}`;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      if (!isConfigured) {
        // No form service yet — hand off to the Messages app instead.
        say(`Opening a text to ${PHONE_DISPLAY} with your details…`);
        window.location.href = `sms:${PHONE}?&body=${encodeURIComponent(summarise(data))}`;
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        form.reset();
        say("Thank you — your inquiry is on its way. I'll reply within a day.");
        if (submit) submit.textContent = 'Sent';
        // Meta Pixel: a delivered inquiry is the ad campaign's Lead event.
        if (typeof fbq === 'function') fbq('track', 'Lead');
        return;
      } catch (err) {
        say(`That didn't go through. Please text me at ${PHONE_DISPLAY} and I'll get right back to you.`, true);
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Try again';
        }
      }
    });
  }
})();
