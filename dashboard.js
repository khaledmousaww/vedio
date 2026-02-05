const darkBtn = document.getElementById('dark-light-btn');
const simpleBtn = document.getElementById('simple-mode-btn');
const focusBtn = document.getElementById('focus-mode-btn');
const tipBtn = document.getElementById('new-tip-btn');
const tipText = document.getElementById('daily-tip-text');
const fastingBtn = document.getElementById('smart-fasting-btn');

const starModal = document.getElementById('star-modal');
const closeStar = document.getElementById('close-star-modal');
const fastingModal = document.getElementById('fasting-modal');
const closeModal = document.getElementById('close-modal');

const nameMap = { الفجر: 'Fajr', الظهر: 'Dhuhr', العصر: 'Asr', المغرب: 'Maghrib', العشاء: 'Isha' };
let prayerTimes = {};

function updateDateTime() {
  const now = new Date();
  const gregorian = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelector('.current-date').innerText = `${gregorian} | ${hijri}`;
  document.querySelector('.current-time').innerText = now.toLocaleTimeString('ar-EG');
}

function fetchPrayerTimes(lat, lon) {
  fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
    .then((res) => res.json())
    .then((data) => {
      prayerTimes = data?.data?.timings || {};
      updatePrayerCards();
    })
    .catch((err) => console.error('فشل تحميل أوقات الصلاة:', err));
}

function updatePrayerCards() {
  document.querySelectorAll('.prayer-card').forEach((card) => {
    const arName = card.querySelector('h3').innerText.trim();
    const apiName = nameMap[arName];
    if (!apiName || !prayerTimes[apiName]) return;
    card.querySelector('.prayer-time').innerText = prayerTimes[apiName].slice(0, 5);
  });
  updateCountdowns();
}

function updateCountdowns() {
  const now = new Date();
  document.querySelectorAll('.prayer-card').forEach((card) => {
    const timeText = card.querySelector('.prayer-time').innerText;
    if (!timeText.includes(':')) return;
    const [h, m] = timeText.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    let diff = target - now;
    if (diff < 0) diff += 24 * 3600000;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    card.querySelector('.countdown').innerText = `${hours}س ${minutes}د ${seconds}ث`;
  });
}

function restorePrayerLog() {
  const today = new Date().toISOString().split('T')[0];
  const log = JSON.parse(localStorage.getItem('prayerLog') || '{}');
  const dayLog = log[today] || {};
  document.querySelectorAll('.prayer-card').forEach((card) => {
    const prayerName = card.querySelector('h3').innerText;
    const prayed = card.querySelector('.prayed-btn');
    const qada = card.querySelector('.qada-btn');
    if (dayLog[prayerName] === 'صليت') { prayed.innerText = '✅ تمت'; prayed.disabled = true; }
    if (dayLog[prayerName] === 'قضيت') { qada.innerText = '✅ تمت'; qada.disabled = true; }
  });
}

darkBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');

simpleBtn?.addEventListener('click', () => document.body.classList.toggle('simple-mode'));
focusBtn?.addEventListener('click', () => document.body.classList.toggle('focus-mode'));

document.querySelectorAll('.prayed-btn, .qada-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.prayer-card');
    const prayerName = card.querySelector('h3').innerText;
    const today = new Date().toISOString().split('T')[0];
    btn.innerText = '✅ تمت';
    btn.disabled = true;
    const log = JSON.parse(localStorage.getItem('prayerLog') || '{}');
    if (!log[today]) log[today] = {};
    log[today][prayerName] = btn.classList.contains('prayed-btn') ? 'صليت' : 'قضيت';
    localStorage.setItem('prayerLog', JSON.stringify(log));
    if (starModal) starModal.style.display = 'flex';
  });
});

closeStar?.addEventListener('click', () => { starModal.style.display = 'none'; });
closeModal?.addEventListener('click', () => { fastingModal.style.display = 'none'; });

tipBtn?.addEventListener('click', () => {
  const tips = window.MIRFAQ_TIPS || [];
  if (!tips.length || !tipText) return;
  tipText.innerText = tips[Math.floor(Math.random() * tips.length)];
});

fastingBtn?.addEventListener('click', () => {
  if (fastingModal) fastingModal.style.display = 'flex';
  if ('Notification' in window) {
    if (Notification.permission === 'granted') new Notification('مِرفاق', { body: 'تذكير: صيام غداً 🌙' });
    else if (Notification.permission !== 'denied') Notification.requestPermission();
  }
});

navigator.geolocation?.getCurrentPosition(
  (p) => fetchPrayerTimes(p.coords.latitude, p.coords.longitude),
  () => fetchPrayerTimes(30.0444, 31.2357)
);

setInterval(updateDateTime, 1000);
setInterval(updateCountdowns, 1000);
updateDateTime();
restorePrayerLog();
