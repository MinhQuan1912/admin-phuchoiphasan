# CLAUDE.md

Hướng dẫn này giúp AI coding assistants đọc hiểu nhanh trang quản trị (Admin) của hệ thống Quản Tài Viên VN (PHTS) và sửa đúng vị trí, đúng quy ước hiện có.

## Lệnh Thường Dùng

```bash
pnpm dev          # Nuxt dev server (SPA), cổng 3002
pnpm build        # Build production
pnpm generate     # Static generate
pnpm preview      # Xem thử bản build
```

Chạy lệnh **bên trong thư mục `Admin/`**. Đây là pnpm workspace riêng, tách khỏi `Frontend` và `backend`. Lưu ý: chạy `pnpm dev admin` là SAI — `admin` bị Nuxt hiểu là `rootDir` nên không đọc `nuxt.config.ts`; chỉ chạy `pnpm dev`.

## Tổng Quan

Trang quản trị nội dung bằng **Nuxt 4 chạy chế độ SPA** (`ssr: false`). Quản lý Tin tức, Thông báo phá sản và Chuyên mục; gọi REST API của `backend`.

| Nhóm | Công nghệ |
| --- | --- |
| Framework | Nuxt 4 (SPA), Vue 3, Vue Router |
| UI | @nuxt/ui 4, Tailwind CSS 4 |
| State | Pinia (setup stores) |
| Rich text | TipTap 3 (StarterKit + các extension) |
| HTTP | `$fetch` (ofetch) qua composable `useApi` |

`nuxt.config.ts`: `ssr: false`, `devServer.port: 3002`, `runtimeConfig.public.apiBase = http://localhost:3001/api`. Backend phải chạy ở cổng 3001.

## Kết Nối Backend

- **Mọi request đi qua `useApi()`** (`app/composables/useApi.ts`): tự set `baseURL = apiBase`, gắn `Authorization: Bearer <token>`, tự xóa `Content-Type` khi body là `FormData`, và **401 → logout + điều hướng `/dang-nhap`**. Không gọi `$fetch` trực tiếp tới backend.
- Response backend luôn có dạng `{ success, message, data }` — type `ApiResponse<T>` trong `app/types/index.ts` (**giữ đồng bộ với `backend/src/common/interface`**). Store thường trả `res.message` để hiển thị toast, và `res.data` là payload.
- Token lưu ở `localStorage` key `phts_admin_token` (xem `stores/auth.ts`). Vì là SPA nên đọc token/`localStorage` chỉ chạy phía client (`import.meta.client`).

## Cấu Trúc Thư Mục (`app/` là srcDir)

```text
app/
  app.vue
  layouts/
    default.vue        # Khung admin: sidebar (thu gọn/drawer mobile) + header + <slot/>
    auth.vue           # Khung trang đăng nhập
  pages/
    index.vue          # Dashboard (KPI + tin mới nhất)
    dang-nhap.vue      # Đăng nhập (layout auth, middleware guest)
    tin-tuc/           # index (list) · create · [id] (sửa)
    thong-bao-pha-san/ # index · create · [id] — dùng lại ArticleListView/ArticleForm với kind=NOTICE
    su-kien/           # index · create · [id] — kind=EVENT
    cau-hoi-thuong-gap/# index · create · [id] — kind=FAQ
    van-ban-phap-luat/ # index · create · [id] — kind=LEGAL
    chuyen-muc.vue     # Quản lý chuyên mục
    xem-thu.vue        # Tab xem thử bài viết (layout: false)
  components/
    ArticleListView.vue   # Bảng danh sách + lọc + phân trang + xóa (nhận prop kind/basePath)
    ArticleForm.vue       # Form tạo/sửa (dùng chung cho mọi CategoryKind)
    ArticleBlockEditor.vue# Editor khối nội dung (TEXT/IMAGE, kéo-thả sắp xếp)
    RichTextEditor.vue    # TipTap toolbar + nội dung cho block TEXT
    ArticlePreview.vue    # Render bài viết giống frontend (dùng ở xem-thu)
    icons/*.vue           # Icon SVG, auto-import tên Icons<Tên> (vd IconsDashboard)
  composables/
    useApi.ts             # Fetch wrapper (token, 401, FormData)
    useArticleForm.ts     # validateArticle + buildArticleFormData (multipart)
    useArticlePreview.ts  # Mở tab xem thử qua localStorage
    useToastMessage.ts    # Toast tiện dụng (success/error)
  stores/
    auth.ts               # token, admin, login/logout/fetchMe/changePassword
    article.ts            # list/stats/current, filters, create/update/setStatus/remove
    category.ts           # danh sách + CRUD chuyên mục
  middleware/
    auth.ts               # Bắt buộc đăng nhập; chưa auth → /dang-nhap?redirect=
    guest.ts              # Đã đăng nhập thì rời /dang-nhap
  types/index.ts          # ApiResponse, Article, Category, EditorBlock, enums, *_LABEL
  utils/slugify.ts        # Auto-import
  assets/css/main.css
```

Auto-import chuẩn Nuxt: components (`Icons*`, `ArticleForm`…), composables (`useApi`…), stores (`useAuthStore`…), utils. Import type thì dùng `~/types`.

## Mô Hình Nội Dung (quan trọng)

Mọi loại nội dung **chung một thực thể `Article`**, phân biệt bằng `CategoryKind` (`NEWS` \| `NOTICE` \| `EVENT` \| `FAQ` \| `LEGAL`). Vì vậy:

- `ArticleListView` và `ArticleForm` **được tái sử dụng** cho tất cả; truyền `kind`, `basePath` (`/tin-tuc`, `/thong-bao-pha-san`, `/su-kien`, `/cau-hoi-thuong-gap`), `addLabel`, `itemNoun`.
- Các trang theo loại chỉ là wrapper mỏng đặt `default-kind="…"` / `kind="…"`. Khi thêm tính năng cho một loại, cân nhắc ảnh hưởng các loại kia.
- Nhãn hiển thị lấy từ `KIND_LABEL`, `STATUS_LABEL` trong `types`.
- **Thông báo (`NOTICE`)**: có đúng 5 chuyên mục cố định do backend seed; soạn thông báo là **chọn 1 trong 5** ở ô "Chuyên mục" (bắt buộc, không tự chọn sẵn khi tạo mới). Backend không giữ thứ tự nhóm này nên ô chọn và ô lọc sắp bằng `sortNoticeTypes()` (`~/types`, thứ tự theo `NOTICE_TYPE_SLUGS` — trùng menu của website).
- **Loại có chuyên mục cố định** (`SINGLE_CATEGORY_KINDS` = `EVENT`, `FAQ`, `LEGAL`): backend seed sẵn đúng 1 chuyên mục, nên giao diện ẩn ô chọn chuyên mục và cột "Chuyên mục" — kiểm tra qua helper `hasCategoryPicker(kind)` trong `~/types`, đừng so sánh `kind !== 'EVENT'` rải rác.
- **Lượt xem** (`Article.views`, Frontend gọi `POST /articles/:slug/view` khi mở trang chi tiết, chống trùng bằng localStorage 1 lượt/bài/24h): chỉ hiện trong Admin — cột "Lượt xem" ở `ArticleListView`. Website không hiển thị số này.
- **Bài nổi bật**: checkbox trong khối "Đăng"; backend chỉ cho tối đa `MAX_FEATURED` (3, hằng trong `~/types` — phải khớp `article.service.ts` của backend) bài **đang đăng** — vượt trần thì backend tự bỏ nổi bật bài đăng cũ nhất và nói rõ trong `message` (toast hiển thị). Form gọi `articleStore.countFeaturedPublished()` để cảnh báo trước khi lưu.
- Trường `court` (tòa chuyên trách) chỉ hiện với `NOTICE`; `documentCode` (số hiệu) + `effectiveDate` (ngày hiệu lực) chỉ hiện với `LEGAL` — danh sách văn bản thay cột "Chuyên mục" bằng "Số hiệu" và cột ngày là ngày hiệu lực.

Thêm một loại nội dung mới (sau khi backend đã có giá trị enum + seed chuyên mục):

1. `app/types/index.ts` — thêm vào `CategoryKind`, `KIND_LABEL`, và `SINGLE_CATEGORY_KINDS` nếu loại đó chỉ có 1 chuyên mục.
2. `ArticleForm.vue` — thêm mục vào `kindOptions`.
3. Tạo 3 trang wrapper `app/pages/<slug>/{index,create,[id]}.vue` (chép từ `su-kien/`).
4. `layouts/default.vue` — thêm mục vào `menu` và nhánh tương ứng trong `meta`.

## Editor Nội Dung

- Bài viết là **danh sách khối** (`EditorBlock`): `TEXT` (HTML từ TipTap) hoặc `IMAGE` (`file` chưa upload + `preview` blob URL, hoặc `content` là URL cũ khi sửa).
- Khi submit, `useArticleForm.buildArticleFormData` gói thành `multipart/form-data`: `thumbnail`, `contentImages[]`, và `blocks` (JSON string, block IMAGE trỏ ảnh qua `imageIndex`). Đây đúng contract mà `backend` article.service mong đợi.
- Style thân bài ở trang xem thử lấy từ `app/assets/css/article-body.css` — file này **phải giống hệt** `Frontend/app/assets/css/article-body.css` (kiểm tra bằng `diff`), đó là cách duy nhất để xem thử khớp với website vì hai project không import chéo được. Đừng thêm rule `.article-body` vào `ArticlePreview.vue` nữa.
- Xem thử (`useArticlePreview`) ghi bản nháp JSON vào `localStorage` rồi mở tab `/xem-thu` (không mang theo `File`, ảnh mới đi bằng blob URL của tab đang soạn).

## Quy Ước Khi Sửa Code

- Thêm màn hình gọi API: viết action trong **store** (Pinia) dùng `useApi`, page/component chỉ gọi store + hiển thị `useToastMessage`.
- Route cần đăng nhập: thêm `definePageMeta({ middleware: 'auth' })`; trang cho khách (login) dùng `middleware: 'guest'`.
- Giữ envelope `{ success, message, data }` khi khai báo type response; hiển thị `res.message` cho toast.
- Icon mới: tạo SFC trong `components/icons/`, dùng qua tên `Icons<Tên>` (auto-import) — không nhét inline SVG lặp lại.
- Tailwind: dùng lại tone hiện có (biến `primary`, `rounded-[10px]`/`rounded-[14px]`, `bg-white border-gray-200`…) cho nhất quán giao diện admin.
- Vì SPA: bao truy cập `window`/`localStorage`/`document` trong `import.meta.client`.

## Debug Guide

| Vấn đề | Kiểm tra trước |
| --- | --- |
| Gọi API 401 / bị đá ra login | `composables/useApi.ts`, token trong `stores/auth.ts`, backend còn sống ở 3001 |
| Sai baseURL / CORS | `nuxt.config.ts` (`apiBase`), `CORS_ORIGIN` phía backend |
| Upload ảnh lỗi | `useArticleForm.buildArticleFormData`, contract `blocks`/`contentImages` với backend |
| Danh sách/lọc sai | `components/ArticleListView.vue`, `stores/article.ts` (filters, dedupe request) |
| Không vào được trang | `middleware/auth.ts` / `guest.ts`, `definePageMeta` của page |
| Editor mất định dạng | `components/RichTextEditor.vue` (TipTap extensions), `ArticleBlockEditor.vue` |

## Hard Constraints

- Không gọi `$fetch` thẳng tới backend — luôn qua `useApi()` để giữ auth + xử lý 401.
- Không đổi shape `ApiResponse`/type dùng chung nếu chưa kiểm tra backend tương ứng.
- Không bật SSR nếu chưa xử lý token/localStorage cho phía server.
- Giữ `ArticleForm`/`ArticleListView` dùng chung cho NEWS và NOTICE; không nhân bản component cho từng loại.
