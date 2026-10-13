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
| `ACCESS_KEY` | một mã tự đặt, vd `Samju-2026-xxxx` (rất nên có) |
| `GITHUB_REPO` | `o0oS2/Scan` (mặc định) |
| `GITHUB_BRANCH` | `main` (mặc định) |
| `GITHUB_DIR` | `scans` (mặc định) |

Sau khi thêm biến → **Deployments → Redeploy** để áp dụng.

## 5. Dùng
Mở link `https://<ten-project>.vercel.app` → nhập `ACCESS_KEY` 1 lần/máy → xong.
- Mỗi mã quét được lưu ngay trên máy, ~1,5 giây sau tự đẩy lên `scans/*.json` trong repo.
- Mỗi 30 giây / khi mở lại app / khi có mạng trở lại: tự đồng bộ 2 chiều (máy khác quét cũng hiện, file xoá ở máy khác cũng mất theo).
- Mất mạng: vẫn quét và lưu trên máy, có mạng lại tự đẩy lên.

## Lưu ý bảo mật
- Nên để repo **Private** (dữ liệu Lot ID nằm trong repo). Vercel vẫn đọc được repo private bình thường.
- Không có `ACCESS_KEY` thì ai biết link đều đọc/ghi được thư mục `scans` – hãy đặt.
- Proxy chỉ cho đọc thư mục `scans` và ghi/xoá file `.json` trong đó, không đụng được phần còn lại của repo.
