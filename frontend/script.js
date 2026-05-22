const navToggle = document.querySelector('.navbar__toggle');
const navMenu = document.querySelector('.navbar__menu-wrap');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  document.querySelectorAll('.navbar__menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
const resumeDownloadBtn = document.getElementById('resumeDownloadBtn');
const heroResumeBtn = document.getElementById('heroResumeBtn');

const trackResumeDownload = async () => {
  try {
    await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'Vijay-Vishwakarma-Resume.pdf' }),
    });
  } catch (error) {
    console.warn('Download tracking failed:', error);
  }
};

const openResume = async () => {
  await trackResumeDownload();
  window.location.href = '/Vijay-Vishwakarma-Resume.pdf';
};

if (resumeDownloadBtn) {
  resumeDownloadBtn.addEventListener('click', openResume);
}

if (heroResumeBtn) {
  heroResumeBtn.addEventListener('click', openResume);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message');
      }

      contactStatus.textContent = 'Message sent successfully. I will get back to you soon.';
      contactStatus.style.color = '#79ffe1';
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = error.message;
      contactStatus.style.color = '#ff7a7a';
    }
  });
}

window.addEventListener('click', (event) => {
  if (!event.target.closest('.navbar') && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
});
