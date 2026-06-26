// 导航栏滚动阴影
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

// 移动端菜单
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// 点击导航链接后关闭菜单
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// 导航高亮：滚动时切换 active
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) {
      item.classList.add('active');
    }
  });
}
window.addEventListener('scroll', updateActiveNav);

// ===== 轮播图 =====
const track = document.getElementById('carouselTrack');
const slides = track.querySelectorAll('.carousel-slide');
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
let currentSlide = 0;
let autoPlayTimer = null;

// 生成圆点
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `第 ${i + 1} 张`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
  resetAutoPlay();
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// 自动轮播
function startAutoPlay() {
  autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoPlay() {
  clearInterval(autoPlayTimer);
  startAutoPlay();
}

startAutoPlay();

// 触摸滑动支持
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

track.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
  }
}, { passive: true });

// ===== 复制联系方式 =====
function copyText(elementId) {
  const el = document.getElementById(elementId);
  const text = el.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    const btn = el.parentElement.querySelector('.copy-btn');
    btn.textContent = '✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋';
      btn.classList.remove('copied');
    }, 1500);
  });
}

// ===== 留言板（Supabase） =====
const SUPABASE_URL = 'https://tpkkhuvbwhkcuiivdpnl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa2todXZid2hrY3VpaXZkcG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Njc5NzcsImV4cCI6MjA5ODA0Mzk3N30.hPGK-HMI9KS6IXo18q0DoZLX_7WH0xGtV8ClpUulSBE';
const PER_PAGE = 6;

const form = document.getElementById('guestbookForm');
const messagesList = document.getElementById('messagesList');
const paginationEl = document.getElementById('pagination');

const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMessages(list) {
  messagesList.innerHTML = '';
  if (list.length === 0) {
    messagesList.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px;">还没有留言，来抢沙发吧~ 🛋️</p>';
    return;
  }
  list.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <div class="message-header">
        <span class="message-author">${escapeHtml(msg.nick_name)}</span>
        <span class="message-time">${msg.create_at || ''}</span>
      </div>
      <p class="message-content">${escapeHtml(msg.content)}</p>
    `;
    messagesList.appendChild(card);
  });
}

// ---- 分页 ----
let currentPage = 1;
let totalPages = 1;

function renderPagination(total, page) {
  totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage = page;
  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

  const pages = [];
  // 始终显示首页
  pages.push(1);
  // 当前页附近的页码
  for (let i = page - 1; i <= page + 1; i++) {
    if (i > 1 && i < totalPages) pages.push(i);
  }
  // 始终显示尾页
  if (totalPages > 1) pages.push(totalPages);

  // 去重排序
  const unique = [...new Set(pages)].sort((a, b) => a - b);

  let html = '';
  // 上一页
  html += `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">‹</button>`;

  let prev = 0;
  for (const p of unique) {
    if (p - prev > 1) html += '<span class="page-ellipsis">…</span>';
    html += `<button class="page-btn${p === page ? ' active' : ''}" data-page="${p}">${p}</button>`;
    prev = p;
  }

  // 下一页
  html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">›</button>`;

  paginationEl.innerHTML = html;
}

paginationEl.addEventListener('click', e => {
  const btn = e.target.closest('.page-btn');
  if (!btn || btn.disabled) return;
  goToPage(parseInt(btn.dataset.page));
});

async function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=id.desc&offset=${from}&limit=${PER_PAGE}`, { headers });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    renderMessages(data);
    renderPagination(totalPages * PER_PAGE, page); // 用缓存的总数
    messagesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.warn('加载留言失败:', err);
  }
}

async function loadMessages() {
  try {
    // 获取总数
    const countResp = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id`, {
      headers: { ...headers, 'Prefer': 'count=exact' }
    });
    const countHeader = countResp.headers.get('content-range');
    const total = countHeader ? parseInt(countHeader.split('/')[1]) : 0;

    // 获取第一页
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=id.desc&limit=${PER_PAGE}`, { headers });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();

    renderMessages(data);
    renderPagination(total, 1);
  } catch (err) {
    console.warn('加载留言失败:', err);
  }
}

// ---- 发布留言 ----
let lastSubmitTime = 0;
form.addEventListener('submit', async e => {
  e.preventDefault();
  const now = Date.now();
  if (now - lastSubmitTime < 20000) {
    alert('发帖太频繁，请 20 秒后再试');
    return;
  }
  const name = document.getElementById('gbName').value.trim();
  const content = document.getElementById('gbMessage').value.trim();
  const contact = document.getElementById('gbContact').value.trim();
  if (!name || !content) return;

  const now = new Date();
  const create_at = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const btn = form.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = '发布中...';

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ nick_name: name, content, create_at, contact: contact || null })
    });
    if (!resp.ok) throw new Error(await resp.text());
    lastSubmitTime = Date.now();
    form.reset();
    loadMessages(); // 回到第一页
  } catch (err) {
    alert('发布失败: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '发布留言';
  }
});

loadMessages();
