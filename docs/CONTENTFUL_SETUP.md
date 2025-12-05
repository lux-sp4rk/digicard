# Contentful Setup Guide

This guide will help you set up Contentful CMS integration for your DigiCard portfolio.

## 1. Create a Contentful Account

1. Go to [contentful.com](https://contentful.com) and sign up for a free account
2. Create a new space (name it something like "DigiCard Portfolio")

## 2. Create Content Models

Create the following content models in your Contentful space:

### Project Content Model

- **Content Type ID**: `project`
- **Fields**:
  - `title` (Short text, required)
  - `description` (Long text, required)
  - `link` (Short text, required)
  - `image` (Media, required)
  - `imageWide` (Media, optional - for wide layout)
  - `alt` (Short text, optional)
  - `order` (Integer, required)
  - `active` (Boolean, optional, default: true)
  - `icon` (Short text, optional - React icon name like "FaReact", "BiLogoJavascript")

### Blog Post Content Model

- **Content Type ID**: `blogPost`
- **Fields**:
  - `title` (Short text, required)
  - `description` (Long text, required)
  - `content` (Rich text, optional)
  - `link` (Short text, required)
  - `image` (Media, required)
  - `publishDate` (Date & time, required)
  - `featured` (Boolean, optional)

### Profile Content Model

- **Content Type ID**: `profile`
- **Fields**:
  - `name` (Short text, required)
  - `title` (Short text, required)
  - `location` (Short text, required)
  - `bio` (Long text, required)
  - `profileImage` (Media, required)

### Settings Content Model

- **Content Type ID**: `settings`
- **Fields**:
  - `blogArchiveUrl` (Short text, required)
  - `socialLinks` (JSON object, optional)

### Social Link Content Model (Optional)

- **Content Type ID**: `socialLink`
- **Fields**:
  - `name` (Short text, required)
  - `url` (Short text, required)
  - `icon` (Short text, required - React icon name like "FaGithub", "FaLinkedin")
  - `order` (Integer, required)
  - `active` (Boolean, optional, default: true)

### YouTube Video Content Model (Optional)

- **Content Type ID**: `youtubeVideo`
- **Fields**:
  - `title` (Short text, required)
  - `description` (Long text, required)
  - `url` (Short text, required - Full YouTube URL or YouTube Shorts URL)
  - `thumbnail` (Media, optional - Custom thumbnail, will auto-generate from video if not provided)
  - `duration` (Short text, optional - Video duration like "10:45" or "0:59")
  - `publishDate` (Date & time, optional)
  - `active` (Boolean, optional, default: true)

**Supported URL formats:**

- Regular videos: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- Short URLs: `https://youtu.be/VIDEO_ID`
- Embed URLs: `https://www.youtube.com/embed/VIDEO_ID`

## 3. Add Content

1. Create entries for each content model
2. Upload your project images to Contentful
3. Set up your featured blog post
4. Configure your profile information

## 4. Get API Keys

1. Go to Settings → API Keys in your Contentful space
2. Create a new API key or use the existing one
3. Copy the **Space ID** and **Content Delivery API - access token**

## 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Add your Contentful credentials:
   ```
   VITE_CONTENTFUL_SPACE_ID=your_space_id_here
   VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
   ```

## 6. Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Your content should now load from Contentful!

## Fallback Behavior

The application is designed to gracefully fall back to static data if:

- Contentful is unavailable
- Environment variables are not set
- API requests fail

This ensures your portfolio always works, even without Contentful.

## Content Management Tips

- Use the `order` field to control project display order
- Set `featured: true` on one blog post to make it the featured post
- Upload images in web-optimized formats (WebP, optimized JPEG/PNG)
- Keep descriptions concise for better mobile display
- Use `active: false` to hide projects/links without deleting them

## Using React Icons

The project supports react-icons through string-based icon names in Contentful:

### Available Icon Libraries:

- **FontAwesome (fa)**: `FaGithub`, `FaLinkedin`, `FaReact`, `FaCode`, etc.
- **BoxIcons (bi)**: `BiLogoReact`, `BiLogoJavascript`, `BiLogoTypescript`, etc.
- **Simple Icons (si)**: `SiContentful`, `SiStrapi`, `SiNetlify`, etc.

### How to Use:

1. In Contentful, set the `icon` field to the exact icon name (e.g., "FaGithub")
2. The application will automatically render the corresponding icon
3. If an icon isn't found, a warning will be logged and no icon will display

### Example Icon Names:

- `FaGithub` - GitHub logo
- `BiLogoReact` - React logo
- `SiContentful` - Contentful logo
- `FaExternalLinkAlt` - External link icon
- `FaCode` - Code icon

### Adding New Icons:

To add more icons, edit `src/utils/iconMapper.js` and import the desired icons from react-icons.

## Component Integration

All components now use the `DynamicIcon` system:

### Usage Examples:

```jsx
import DynamicIcon from './DynamicIcon';

// Basic usage
<DynamicIcon iconName="FaGithub" />

// With styling
<DynamicIcon
  iconName="FaGithub"
  className="text-blue-500"
  size={24}
/>

// From Contentful data
<DynamicIcon iconName={project.icon} />
```

### Benefits:

- **Unified System**: All icons use the same component
- **CMS Integration**: Icons can be managed through Contentful
- **Performance**: Only loads icons that are actually used
- **Type Safety**: Warnings for missing icons
- **Consistency**: Same styling patterns across all icons

## Deployment

When deploying, make sure to set the environment variables in your hosting platform:

- Vercel: Add to Environment Variables in project settings
- Netlify: Add to Site Settings → Environment Variables
- Other platforms: Follow their specific environment variable setup process
