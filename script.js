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

// ===== 留言板（YesAPI） =====
const YESAPI_APP_KEY = 'C4E8DAB50F101FEF0A1FCF65CC21A7C1';
const YESAPI_SECRET = '0a8CLQRiXcJ1BHbpgCMiEN6EgZQGaUidFKFxYHqLAcfV039LjRuVNr4N827ieZhf';
const YESAPI_BASE = 'https://hn216.api.yesapi.cn/api.php';
const TABLE_NAME = 'message';

const form = document.getElementById('guestbookForm');
const messagesList = document.getElementById('messagesList');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addMessageToDOM(msg, prepend = true) {
  const card = document.createElement('div');
  card.className = 'message-card';
  card.innerHTML = `
    <div class="message-header">
      <span class="message-author">${escapeHtml(msg.nick_name)}</span>
      <span class="message-time">${msg.create_at || ''}</span>
    </div>
    <p class="message-content">${escapeHtml(msg.content)}</p>
  `;
  if (prepend) {
    messagesList.prepend(card);
  } else {
    messagesList.appendChild(card);
  }
}

// 加载留言列表
async function loadMessages() {
  try {
    const params = new URLSearchParams({
      s: 'App.Table.GetList',
      app_key: YESAPI_APP_KEY,
      model_name: TABLE_NAME,
      where: JSON.stringify([['id', '>', '0']]),
      page: '1',
      perpage: '50',
      order_by: JSON.stringify({ id: 'DESC' })
    });

    const resp = await fetch(`${YESAPI_BASE}?${params}`);
    const data = await resp.json();

    if (data.ret === 200 && data.data && data.data.list) {
      // 清空示例留言
      messagesList.innerHTML = '';
      data.data.list.forEach(msg => addMessageToDOM(msg, false));
    }
  } catch (err) {
    console.warn('加载留言失败:', err);
  }
}

// 发布留言
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('gbName').value.trim();
  const content = document.getElementById('gbMessage').value.trim();
  if (!name || !content) return;

  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const btn = form.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = '发布中...';

  try {
    const params = new URLSearchParams({
      s: 'App.Table.Create',
      app_key: YESAPI_APP_KEY,
      model_name: TABLE_NAME,
      data: JSON.stringify({ nick_name: name, content: content, create_at: time })
    });

    const resp = await fetch(YESAPI_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const result = await resp.json();

    if (result.ret === 200) {
      addMessageToDOM({ nick_name: name, content: content, create_at: time }, true);
      form.reset();
    } else {
      alert('发布失败，请稍后重试');
    }
  } catch (err) {
    alert('网络错误，请稍后重试');
  } finally {
    btn.disabled = false;
    btn.textContent = '发布留言';
  }
});

loadMessages();
