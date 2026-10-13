# Quét Lot ID – Vercel + GitHub (tự lưu, tự đồng bộ)

Cấu trúc repo `o0oS2/Scan`:

```
index.html   manifest.json   sw.js   vercel.json
api/gh.js            ← proxy giữ token bí mật
icons/               ← (bạn tự thêm) icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
```

## 1. Tạo token (secret) trên GitHub
GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
- Repository access: **Only select repositories → Scan**
- Permissions → Repository → **Contents: Read and write**
- Copy token `github_pat_…` (chỉ hiện 1 lần). Đừng gửi token qua chat/email.

## 2. Đẩy code lên GitHub
Upload toàn bộ file (kể cả thư mục `api/`) vào nhánh `main` của repo `o0oS2/Scan`.

## 3. Deploy lên Vercel
Vercel → Add New → Project → Import `o0oS2/Scan` → Deploy (không cần Build Command).

## 4. Khai báo secret trên Vercel
Project → Settings → Environment Variables (chọn Production + Preview):

| Tên | Giá trị |
|---|---|
| `GITHUB_TOKEN` | token ở bước 1 (bắt buộc) |
| `GITHUB_REPO` | `o0oS2/Scan` (mặc định) |
| `GITHUB_BRANCH` | `main` (mặc định) |
| `GITHUB_DIR` | `scans` (mặc định) |

Sau khi thêm biến → **Deployments → Redeploy** để áp dụng.

## 5. Dùng
Mở link `https://<ten-project>.vercel.app` là dùng được, không cần nhập gì.
- Mỗi mã quét, mỗi lần sửa ghi chú đều lưu ngay trên máy và ~1 giây sau tự lưu lên `scans/*.json` trong repo.
- Danh sách được tải từ GitHub khi mở app và khi mở tab “Đã lưu”. Mất mạng vẫn quét được, có mạng lại tự đẩy lên.
- Tên danh sách: 4 ký tự đầu - 10 ký tự tiếp theo của Lot ID đầu tiên (chỉnh `NAME_A`, `NAME_B` trong `index.html`).

## Lưu ý bảo mật
- Nên để repo **Private** (dữ liệu Lot ID nằm trong repo). Vercel vẫn đọc được repo private bình thường.
- Không đặt `ACCESS_KEY` nên ai biết link đều đọc/ghi được thư mục `scans`.
- Proxy chỉ cho đọc thư mục `scans` và ghi/xoá file `.json` trong đó, không đụng được phần còn lại của repo.
