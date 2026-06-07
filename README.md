# Eshmart Agrox Admin Panel

Full-featured admin panel for the Eshmart Agrox website.

## Features

- **Firebase Auth** — email/password login, role-based access
- **Team Management** — Super Admin, Admin, Editor roles
- **WYSIWYG Editor** — TipTap-powered rich text for blog posts
- **Cloudinary uploads** — image upload with 8 MB limit
- **All client sections** manageable:
  - Hero Slides (slideshow on homepage)
  - Produce Cards (first feature section)
  - Quality Blocks (second feature section)
  - Call to Action section
  - Portfolio items
  - Services (Book Online)
  - Blog posts
  - Navigation links
  - Site settings

## Setup

1. Fill in `.env.local` with your Firebase and Cloudinary credentials
2. `npm install`
3. `npm run dev`

### Firebase Setup
- Enable **Email/Password** authentication in Firebase Console
- Create a Firestore database
- Add the first Super Admin manually in Firestore `adminUsers` collection with your Firebase Auth UID

### Cloudinary Setup
- Create a free Cloudinary account
- Create an **unsigned upload preset** in Settings > Upload
- Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Collections (Firestore)

| Collection | Purpose |
|---|---|
| `heroSlides` | Homepage hero slides |
| `produceCards` | First feature section cards (3 cards) |
| `qualityBlocks` | Second feature section blocks |
| `cta` | Bottom Call to Action section |
| `portfolio` | Portfolio showcase items |
| `services` | Book online services |
| `blog` | Blog posts |
| `navigation` | Header navigation links |
| `settings` | Global site settings (single doc) |
| `adminUsers` | Admin user profiles + roles |

## Routes

| Route | Description |
|---|---|
| `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/hero` | Hero slides |
| `/admin/produce` | Produce cards |
| `/admin/quality` | Quality blocks + CTA |
| `/admin/cta` | Call to Action section |
| `/admin/portfolio` | Portfolio items |
| `/admin/services` | Services |
| `/admin/blog` | Blog posts |
| `/admin/navigation` | Navigation links |
| `/admin/settings` | Site settings |
| `/admin/team` | Admin team management |
