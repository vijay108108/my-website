const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminLoginStatus = document.getElementById('adminLoginStatus');
const loginPanel = document.getElementById('loginPanel');
const dashboardPanel = document.getElementById('dashboardPanel');
const inquiryCount = document.getElementById('inquiryCount');
const downloadCount = document.getElementById('downloadCount');
const inquiryTable = document.querySelector('#inquiryTable tbody');
const downloadTable = document.querySelector('#downloadTable tbody');

const getToken = () => localStorage.getItem('adminToken');
const setToken = token => localStorage.setItem('adminToken', token);

const formatDate = iso => new Date(iso).toLocaleString();

const readJsonResponse = async response => {
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

const fetchDashboard = async () => {
  try {
    const token = getToken();
    if (!token) return;

    const [statsRes, inquiriesRes, downloadsRes] = await Promise.all([
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('/api/admin/downloads', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!statsRes.ok || !inquiriesRes.ok || !downloadsRes.ok) {
      throw new Error('Failed to load admin data.');
    }

    const stats = await readJsonResponse(statsRes);
    const inquiriesData = await readJsonResponse(inquiriesRes);
    const downloadsData = await readJsonResponse(downloadsRes);
    const inquiries = Array.isArray(inquiriesData.inquiries) ? inquiriesData.inquiries : [];
    const downloads = Array.isArray(downloadsData.downloads) ? downloadsData.downloads : [];

    inquiryCount.textContent = stats.inquiryCount || 0;
    downloadCount.textContent = stats.downloadCount || 0;

    inquiryTable.innerHTML = inquiries
      .map(inquiry => `
        <tr>
          <td>${inquiry.name}</td>
          <td>${inquiry.email}</td>
          <td>${inquiry.message}</td>
          <td>${formatDate(inquiry.createdAt)}</td>
        </tr>
      `)
      .join('');

    downloadTable.innerHTML = downloads
      .map(download => `
        <tr>
          <td>${download.fileName}</td>
          <td>${download.ip || 'unknown'}</td>
          <td>${download.userAgent || 'unknown'}</td>
          <td>${formatDate(download.createdAt)}</td>
        </tr>
      `)
      .join('');
  } catch (error) {
    adminLoginStatus.textContent = error.message;
    adminLoginStatus.style.color = '#ff7a7a';
    if (error.message.toLowerCase().includes('unauthorized')) {
      localStorage.removeItem('adminToken');
      showLogin();
    }
  }
};

const showDashboard = () => {
  loginPanel.classList.add('hidden');
  dashboardPanel.classList.remove('hidden');
  fetchDashboard();
};

function showLogin() {
  loginPanel.classList.remove('hidden');
  dashboardPanel.classList.add('hidden');
}

adminLoginForm.addEventListener('submit', async event => {
  event.preventDefault();
  adminLoginStatus.textContent = '';

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail.value,
        password: adminPassword.value,
      }),
    });

    if (!response.ok) {
      const error = await readJsonResponse(response);
      throw new Error(error.error || 'Unable to sign in');
    }

    const data = await readJsonResponse(response);
    setToken(data.token);
    showDashboard();
  } catch (error) {
    adminLoginStatus.textContent = error.message;
    adminLoginStatus.style.color = '#ff7a7a';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    showDashboard();
  }
});
