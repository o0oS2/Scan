// Vercel Serverless Function: proxy an toàn tới GitHub Contents API.
// Token nằm ở biến môi trường của Vercel, KHÔNG bao giờ gửi xuống trình duyệt.
//
// Biến môi trường (Vercel → Settings → Environment Variables):
//   GITHUB_TOKEN   (bắt buộc)  fine-grained PAT, chỉ repo Scan, quyền Contents: Read and write
//   ACCESS_KEY     (khuyên dùng) mã truy cập; không có mã thì ai biết link đều ghi/đọc được dữ liệu
//   GITHUB_REPO    (mặc định o0oS2/Scan)
//   GITHUB_BRANCH  (mặc định main)
//   GITHUB_DIR     (mặc định scans)
const crypto = require('crypto');

const TOKEN  = process.env.GITHUB_TOKEN || '';
const REPO   = process.env.GITHUB_REPO || 'o0oS2/Scan';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const DIR    = (process.env.GITHUB_DIR || 'scans').replace(/^\/+|\/+$/g, '');
const KEY    = process.env.ACCESS_KEY || '';

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const authed = !KEY || same(req.headers['x-access-key'] || '', KEY);

  // Kiểm tra cấu hình / mã truy cập
  if (req.query.ping) {
    return res.status(200).json({
      configured: !!TOKEN, needKey: !!KEY, authed,
      repo: authed ? REPO : '', branch: BRANCH, dir: DIR,
    });
  }
  if (!TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN chưa được cấu hình trên Vercel' });
  if (!authed) return res.status(401).json({ error: 'Sai mã truy cập' });

  const method = req.method;
  if (!['GET', 'PUT', 'DELETE'].includes(method)) return res.status(405).json({ error: 'Method not allowed' });

  // Chỉ cho phép đúng thư mục dữ liệu; ghi/xoá chỉ với file .json trực tiếp trong thư mục đó
  const p = String(req.query.p || '');
  const qi = p.indexOf('?');
  const pathOnly = qi < 0 ? p : p.slice(0, qi);
  let decoded;
  try { decoded = decodeURIComponent(pathOnly); } catch (e) { return res.status(400).json({ error: 'Bad path' }); }
  const base = '/contents' + (DIR ? '/' + DIR : '');
  if (decoded.split('/').includes('..')) return res.status(403).json({ error: 'Forbidden' });
  const isDir  = decoded === base;
  const isFile = decoded.startsWith(base + '/') && /^[^/]+\.json$/.test(decoded.slice(base.length + 1));
  if (!(isDir || isFile)) return res.status(403).json({ error: 'Forbidden' });
  if (method !== 'GET' && !isFile) return res.status(403).json({ error: 'Forbidden' });

  let url = 'https://api.github.com/repos/' + REPO + pathOnly;
  let body;
  if (method === 'GET') {
    url += '?ref=' + encodeURIComponent(BRANCH);
  } else {
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = Object.assign({}, b || {}, { branch: BRANCH });
    body = JSON.stringify(b);
  }

  const accept = /^application\/vnd\.github/.test(req.headers.accept || '')
    ? req.headers.accept : 'application/vnd.github+json';
  try {
    const r = await fetch(url, {
      method, body,
      headers: {
        Authorization: 'Bearer ' + TOKEN,
        Accept: accept,
        'Content-Type': 'application/json',
        'User-Agent': 'scan-lot-id',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    const text = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: 'Không gọi được GitHub: ' + e.message });
  }
};
