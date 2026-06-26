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
const YESAPI_BASE = 'https://yesapi-proxy.narakuu0.workers.dev/api.php';
const TABLE_NAME = 'message';

const form = document.getElementById('guestbookForm');
const messagesList = document.getElementById('messagesList');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- MD5 签名 ----
function md5cycle(x, k) {
  let a = x[0], b = x[1], c = x[2], d = x[3];
  a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
  a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
  a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
  a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
  x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
}
function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
function md51(s) {
  const n = s.length; let state = [1732584193, -271733879, -1732584194, 271733878]; let i;
  for (i = 64; i <= n; i += 64) { md5cycle(state, md5blk(s.substring(i - 64, i))); }
  s = s.substring(i - 64); const tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) { md5cycle(state, tail); for (i = 0; i < 16; i++) tail[i] = 0; }
  tail[14] = n * 8; md5cycle(state, tail); return state;
}
function md5blk(s) {
  const md5blks = []; for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
  } return md5blks;
}
const hex_chr = '0123456789abcdef'.split('');
function rhex(n) { let s = ''; for (let j = 0; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F]; return s; }
function hex(x) { return x.map(rhex).join(''); }
function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
function md5(s) { return hex(md51(s)); }

// YesAPI 签名：MD5(app_key + s + secret + 排序后的参数值拼接)
function makeSign(service, extraParams) {
  const vals = [];
  Object.keys(extraParams).sort().forEach(k => { vals.push(extraParams[k]); });
  return md5(YESAPI_APP_KEY + service + YESAPI_SECRET + vals.join(''));
}

// 构造请求参数
function buildParams(service, extraParams) {
  const sign = makeSign(service, extraParams);
  const p = new URLSearchParams();
  p.set('s', service);
  p.set('app_key', YESAPI_APP_KEY);
  p.set('sign', sign);
  Object.keys(extraParams).forEach(k => p.set(k, extraParams[k]));
  return p;
}

// ---- 留言 DOM ----
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

// ---- 加载留言列表 ----
async function loadMessages() {
  try {
    const params = buildParams('App.Table.GetList', {
      model_name: TABLE_NAME,
      page: '1',
      perpage: '50',
      where: JSON.stringify([['id', '>', '0']]),
      order_by: JSON.stringify({ id: 'DESC' })
    });

    const resp = await fetch(`${YESAPI_BASE}?${params}`);
    const data = await resp.json();

    if (data.ret === 200 && data.data && data.data.list) {
      messagesList.innerHTML = '';
      data.data.list.forEach(msg => addMessageToDOM(msg, false));
    }
  } catch (err) {
    console.warn('加载留言失败:', err);
  }
}

// ---- 发布留言 ----
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
    const params = buildParams('App.Table.Create', {
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
      alert('发布失败: ' + (result.msg || '请稍后重试'));
    }
  } catch (err) {
    alert('网络错误: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '发布留言';
  }
});

loadMessages();
