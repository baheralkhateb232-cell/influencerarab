(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainNav');
  const body = document.body;

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
    }));
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }) : null;

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min((i % 5) * 65, 260)}ms`;
    if (observer) observer.observe(el); else el.classList.add('in');
  });

  const params = new URLSearchParams(location.search);
  const success = document.getElementById('successMessage');
  if (params.get('sent') === '1' && success) {
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
