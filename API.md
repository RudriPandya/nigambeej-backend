# Nigam Beej — Backend API Reference

NestJS REST API backed by MySQL (TypeORM). Authentication uses JWT stored as an `access_token` HttpOnly cookie.

---

## Base URL

```
http://localhost:<PORT>
```

Set `PORT` in your `.env` (defaults to NestJS default `3000`).

---

## Authentication

All routes prefixed with `/admin/` require a valid JWT cookie (`access_token`).

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/auth/login` | POST | No | Login and set cookie |
| `/auth/logout` | POST | No | Clear auth cookie |
| `/auth/me` | GET | Yes | Return current user |

### POST /auth/login

**Body**
```json
{ "email": "admin@example.com", "password": "secret" }
```

**Response**
```json
{ "success": true, "user": { "id": 1, "email": "...", "name": "...", "role": "admin" } }
```

Sets `access_token` HttpOnly cookie on success.

### GET /auth/me

Returns the authenticated user object (password excluded).

---

## Products

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/products` | GET | No | List products |
| `/products/featured` | GET | No | Featured products |
| `/products/:slug` | GET | No | Single product by slug |
| `/categories` | GET | No | All categories with subcategories |
| `/admin/products` | GET | Yes | Admin product list (paginated) |
| `/admin/products` | POST | Yes | Create product (multipart) |
| `/admin/products/:id` | PUT | Yes | Update product (multipart) |
| `/admin/products/:id/featured` | PATCH | Yes | Toggle featured flag |
| `/admin/products/:id` | DELETE | Yes | Delete product |

### GET /products

| Query | Type | Description |
|-------|------|-------------|
| `lang` | string | Language code (e.g. `en`, `hi`) |
| `category` | string | Filter by category slug |
| `subcategory` | string | Filter by subcategory slug |
| `page` | number | Page number (enables pagination) |
| `limit` | number | Items per page (max 100, default 24) |

### POST /admin/products

`multipart/form-data` — optional `image` file (JPEG/PNG/WebP, max 5 MB).

---

## Blog

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/blog` | GET | No | List published posts |
| `/blog/:slug` | GET | No | Single post by slug |
| `/admin/blog` | GET | Yes | Admin list (paginated) |
| `/admin/blog/:id` | GET | Yes | Single post by ID |
| `/admin/blog` | POST | Yes | Create post (multipart) |
| `/admin/blog/:id` | PUT | Yes | Update post (multipart) |
| `/admin/blog/:id` | DELETE | Yes | Delete post |

### GET /blog

| Query | Type | Description |
|-------|------|-------------|
| `lang` | string | Language code |
| `page` | number | Default 1 |
| `limit` | number | Default 9 |

### POST /admin/blog

`multipart/form-data` — optional `cover` image file.

---

## Gallery

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/gallery` | GET | No | List gallery images |
| `/admin/gallery` | GET | Yes | Admin list |
| `/admin/gallery` | POST | Yes | Upload image (multipart) |
| `/admin/gallery/:id` | PUT | Yes | Update metadata |
| `/admin/gallery/:id` | DELETE | Yes | Delete image |

### GET /gallery

| Query | Type | Description |
|-------|------|-------------|
| `tab` | string | Filter by tab key (e.g. `all`, custom tabs) |

### POST /admin/gallery

`multipart/form-data` — `image` file + optional `tabKey`, `altText`.

---

## Hero Slides

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/hero` | GET | No | List slides |
| `/admin/hero` | GET | Yes | Admin list |
| `/admin/hero` | POST | Yes | Create slide (multipart) |
| `/admin/hero/:id` | PUT | Yes | Update slide (multipart) |
| `/admin/hero/:id` | DELETE | Yes | Delete slide |

### GET /hero

| Query | Type | Description |
|-------|------|-------------|
| `lang` | string | Language code for translations |

### POST /admin/hero

`multipart/form-data` — optional `image` file.

---

## Media (Press / Image Library)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/media` | GET | No | List media images |
| `/admin/media` | GET | Yes | Admin list |
| `/admin/media` | POST | Yes | Upload image (multipart) |
| `/admin/media/:id` | DELETE | Yes | Delete image |

### POST /admin/media

`multipart/form-data` — `image` file + optional `altText`.

---

## Videos

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/videos` | GET | No | List videos |
| `/admin/videos` | GET | Yes | Admin list |
| `/admin/videos` | POST | Yes | Create video |
| `/admin/videos/:id` | PUT | Yes | Update video |
| `/admin/videos/:id` | DELETE | Yes | Delete video |

### GET /videos

| Query | Type | Description |
|-------|------|-------------|
| `lang` | string | Language code for translated fields |

Videos hold external URLs (e.g. YouTube embeds), no file upload required.

---

## Homepage Stats

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/stats` | GET | No | List stats |
| `/admin/stats` | GET | Yes | Admin list |
| `/admin/stats` | POST | Yes | Create stat |
| `/admin/stats/:id` | PUT | Yes | Update stat |
| `/admin/stats/:id` | DELETE | Yes | Delete stat |

---

## Contact Inquiries

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/contact` | POST | No | Submit inquiry |
| `/admin/inquiries` | GET | Yes | List inquiries (paginated) |
| `/admin/inquiries/:id/read` | PATCH | Yes | Mark as read |

### POST /contact

**Body**
```json
{ "name": "...", "email": "...", "phone": "...", "message": "..." }
```

### GET /admin/inquiries

| Query | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 20 |

---

## Career Applications

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/careers` | POST | No | Submit application (multipart) |
| `/admin/careers` | GET | Yes | List applications (paginated) |
| `/admin/careers/:id/read` | PATCH | Yes | Mark as read |
| `/admin/careers/:id/cv` | GET | Yes | Download CV file |

### POST /careers

`multipart/form-data` — optional `cv` file (PDF / DOC / DOCX, max 5 MB).

### GET /admin/careers

| Query | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 20 |

---

## Site Settings

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/settings` | GET | No | All public settings (key-value) |
| `/admin/settings` | GET | Yes | All settings (admin) |
| `/admin/settings` | PUT | Yes | Batch upsert settings |
| `/admin/settings/about-image` | POST | Yes | Upload about-page image |
| `/admin/settings/upload-image` | POST | Yes | Upload generic setting image |

### PUT /admin/settings

**Body** — flat key-value object:
```json
{
  "site_title": "Nigam Beej",
  "contact_email": "info@example.com"
}
```

### POST /admin/settings/upload-image

`multipart/form-data` — `image` file + `key` (setting key to store the path under).

---

## Translations

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/translations/:lang` | GET | No | Get overrides for a language |
| `/admin/translations` | GET | Yes | List all overrides |
| `/admin/translations` | POST | Yes | Batch upsert overrides |

### GET /translations/:lang

Returns a nested object grouped by namespace:
```json
{
  "common": { "nav.home": "Home" },
  "products": { "cta.buy": "Buy Now" }
}
```

### POST /admin/translations

**Body**
```json
{
  "items": [
    { "lang": "hi", "namespace": "common", "keyPath": "nav.home", "value": "होम" }
  ]
}
```

---

## Health Check

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/` | GET | No | Service health |

**Response**
```json
{ "status": "ok", "service": "Nigam Beej API" }
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASS` | `` | MySQL password |
| `DB_NAME` | `nigam_beej_db` | Database name |
| `JWT_SECRET` | — | JWT signing secret (required) |
| `JWT_EXPIRY` | `24h` | Token expiry duration |
| `NODE_ENV` | — | Set to `production` to disable schema sync |

---

## File Upload Notes

- Accepted image types: JPEG, PNG, WebP (enforced by `imageFileFilter`)
- Max image size: 5 MB (`MAX_IMAGE_SIZE`)
- Uploaded files are saved under `uploads/<subfolder>/` relative to the project root
- CV uploads additionally accept DOC and DOCX; max 5 MB
- Image paths stored in the DB are relative (e.g. `products/abc123.jpg`); prefix with your static file serve URL to build full URLs

---

## Database

MySQL with `utf8mb4` charset. Schema auto-sync is enabled in non-production environments (`synchronize: true`). Entities:

`AdminUser`, `Category`, `CategoryTranslation`, `Subcategory`, `SubcategoryTranslation`, `Product`, `ProductTranslation`, `ProductVideo`, `ProductVideoTranslation`, `BlogPost`, `BlogPostTranslation`, `GalleryImage`, `MediaImage`, `HeroSlide`, `HeroSlideTranslation`, `HomepageStat`, `ContactInquiry`, `CareerApplication`, `SiteSetting`, `TranslationOverride`
