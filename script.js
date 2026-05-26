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

const LOCAL_API_BASE_URL = 'http://localhost:5000';

const getApiBaseUrl = () => {
  if (window.API_BASE_URL) {
    return window.API_BASE_URL.replace(/\/$/, '');
  }

  const isFilePage = window.location.protocol === 'file:';
  const isLocalPage = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  const isBackendPort = window.location.port === '5000';

  if (isFilePage || (isLocalPage && !isBackendPort)) {
    return LOCAL_API_BASE_URL;
  }

  return '';
};

const API_BASE_URL = getApiBaseUrl();
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const readJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Server returned an invalid response. Please try again.');
  }
};

const getRequestErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return 'Unable to connect to the backend. Make sure it is running at http://localhost:5000.';
  }

  return error.message || 'Unable to send message. Please try again.';
};

const trackResumeDownload = async () => {
  try {
    await fetch(apiUrl('/api/download'), {
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
      contactStatus.textContent = 'Sending...';
      contactStatus.style.color = '#d8e7ff';

      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Unable to send message');
      }

      contactStatus.textContent = data.message || 'Message sent successfully. I will get back to you soon.';
      contactStatus.style.color = '#79ffe1';
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = getRequestErrorMessage(error);
      contactStatus.style.color = '#ff7a7a';
    }
  });
}

window.addEventListener('click', (event) => {
  if (navMenu && navToggle && !event.target.closest('.navbar') && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
});
