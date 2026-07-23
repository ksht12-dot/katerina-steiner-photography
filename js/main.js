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

  // Contact form -> mailto fallback (no backend configured)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const date = data.get('date') || '';
      const location = data.get('location') || '';
      const message = data.get('message') || '';

      const subject = `Newborn session inquiry — ${name}`;
      const body =
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Due date / birth date: ${date}\n` +
        `Preferred location: ${location}\n\n` +
        `Message:\n${message}`;

      const mailto = `mailto:katephotomn@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }
})();
