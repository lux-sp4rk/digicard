# Instagram Widget Spec for DigiCard

## Overview

Add an Instagram component to DigiCard that displays the latest post (image + caption + link), following the same pattern as the existing YouTube widget.

---

## 1. API Approach Recommendation

### Recommended: RapidAPI Instagram Scraper

**Why:** Minimal auth footprint, no Facebook Developer account required, works immediately.

| Approach              | Auth Required           | Setup Complexity | Cost                          | Reliability        |
| --------------------- | ----------------------- | ---------------- | ----------------------------- | ------------------ |
| **RapidAPI**          | API Key only            | Low              | Free tier (100-500 req/month) | Good               |
| Instagram Graph API   | Facebook App + approval | High             | Free                          | High (but complex) |
| instagram-private-api | Username/password       | Medium           | Free                          | Breaks often       |
| instaloader (Python)  | Credentials             | Medium           | Free                          | Fragile            |
| oEmbed                | App approval required   | High             | Free                          | Limited data       |

### Implementation Path

Use **RapidAPI's Instagram Scraper** endpoints:

- `GET /user-feed` - Get user's posts by username
- Extract latest post: image URL, caption, permalink, timestamp

**Env vars needed:**

```bash
RAPIDAPI_KEY=your_rapidapi_key
INSTAGRAM_USERNAME=ulisp4rk  # or actual handle once confirmed
```

---

## 2. Component Architecture

Follow the **YouTube.jsx pattern** exactly:

```
Contentful (CMS) → API Fallback (RapidAPI) → dev-data JSON Fallback
```

### File Structure

```
src/
├── components/
│   └── Instagram.jsx          # Main widget component
├── utils/
│   └── instagram.js           # API fetching logic
├── hooks/
│   └── useContentful.js       # Already exists, reuse
└── dev-data/
    └── instagramPost.json     # Fallback data

netlify/
└── functions/
    └── instagram-latest.js    # Serverless function (same pattern as youtube-latest.js)
```

---

## 3. Data Schema

### Contentful Content Type: `instagramPost`

```javascript
{
  title: String,           // Optional caption summary
  caption: String,         // Full post caption
  imageUrl: String,        // Post image URL
  permalink: String,       // https://instagram.com/p/ABC123/
  publishDate: DateTime,   // ISO 8601
  active: Boolean          // Feature flag
}
```

### API Response Schema (RapidAPI)

```javascript
{
  id: "1234567890",
  caption: "Post text here...",
  media_url: "https://...jpg",
  permalink: "https://instagram.com/p/ABC123/",
  timestamp: "2025-01-15T10:30:00Z"
}
```

### Fallback JSON Schema

```javascript
// src/dev-data/instagramPost.json
{
  "id": "fallback-1",
  "caption": "Latest post caption...",
  "imageUrl": "/featured-post.png",
  "permalink": "https://instagram.com/ulisp4rk",
  "publishDate": "2025-01-15T10:30:00Z",
  "active": true
}
```

---

## 4. Component Design

### Instagram.jsx

- Uses `useContentful(getInstagramPost)` hook (same as YouTube)
- Falls back to RapidAPI via Netlify function if CMS data unavailable
- Falls back to `dev-data/instagramPost.json` if API fails
- Theme-aware styling using `clsx` (follow existing patterns)

### Visual Design

- **Square aspect ratio** (Instagram standard)
- **Image** on top, **caption** below (truncated to 2 lines)
- **"View on Instagram"** link button
- **Theme classes:** Support all existing themes (dark, matrix, web2, xmas, catppuccin, flexoki)

### Responsive Behavior

- Mobile: Full width, smaller image
- Desktop: Max-width card centered

---

## 5. Integration Points

### App.jsx Changes

Add to `FeaturedContent` section (like YouTube/Substack):

```jsx
// In FeaturedContent.jsx, add to contentItems:
{
  type: 'instagram',
  data: instagramPost,
  publishDate: normalizeDate(instagramPost.publishDate),
  id: instagramPost.id
}
```

Or mount standalone in `App.jsx`:

```jsx
<ErrorBoundary theme={theme}>
  <Instagram theme={theme} />
</ErrorBoundary>
```

### SocialLinks Integration

Consider adding Instagram icon to SocialLinks via Contentful settings.

---

## 6. Environment Variables

Add to `.env.example`:

```bash
# Instagram (via RapidAPI)
RAPIDAPI_KEY=""
INSTAGRAM_USERNAME="ulisp4rk"
```

---

## 7. Fallback Behavior

| Scenario                   | Behavior                           |
| -------------------------- | ---------------------------------- |
| Contentful has active post | Use CMS data                       |
| CMS empty/fails            | Call RapidAPI via Netlify function |
| RapidAPI fails             | Use `dev-data/instagramPost.json`  |
| All fail                   | Component returns `null` (hidden)  |

---

## 8. Open Questions / Action Items

1. **Instagram Handle** - Could not find confirmed handle via search. Options:
   - `ulisp4rk` (consistent with other handles)
   - `lux_sp4rk` or `luxsp4rk`
   - May not exist yet (need to create)

2. **RapidAPI Account** - Need to sign up at rapidapi.com and subscribe to an Instagram API

3. **Contentful Content Type** - Create `instagramPost` content type if CMS approach desired

---

## 9. Security Notes

- NEVER commit RapidAPI key to repo
- Netlify function handles API key server-side (same as YouTube)
- Client-side only sees cached/final data

---

## 10. Implementation Priority

1. **Phase 1:** Stub components with fallback JSON (works offline)
2. **Phase 2:** Add RapidAPI integration via Netlify function
3. **Phase 3:** Add Contentful CMS integration (optional)

---

_Spec written: 2025-03-20_
_Default username assumed: `ulisp4rk` (update once confirmed)_
