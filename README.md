# Eshmart Agrox Admin

Admin dashboard for managing site content, roles, and admin users for the Eshmart Agrox website.

## Project overview

- Admin UI built with Next.js 16 and React 19.
- Firebase Authentication client is used to sign in users.
- Firebase Admin SDK is used server-side for Firestore access and admin user management.
- Firestore stores site content, admin profiles, and role definitions.
- JWT session cookies keep admins authenticated between requests.

## What is included

- Admin pages for:
  - dashboard
  - site settings
  - navigation
  - home page content
  - footer
  - shop/products
  - portfolio
  - services
  - blog
  - order tracking
  - admin user management
  - role & permission management
- API routes for auth, content, admins, roles, seeding, and media metadata.
- Firebase client + admin configuration helpers.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in Firebase client values and admin service account values.
3. Set `JWT_SECRET` to a strong, unique value of at least 32 characters.

### Example local env

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAvqdNB-i_CvMY0InzsdpHfx6Fr2qon4mI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eshmartagrox.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=eshmartagrox
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=eshmartagrox.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=838090569883
NEXT_PUBLIC_FIREBASE_APP_ID=1:838090569883:web:2c792781771ccfb5b76e3e

FIREBASE_ADMIN_PROJECT_ID=eshmartagrox
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eshmartagrox.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

JWT_SECRET=<your-32-char-secret>
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Running locally

```bash
npm install
npm run dev
```

The admin app runs on `http://localhost:3001`.

## Authentication flow

- The login page uses Firebase Auth to sign in an admin user.
- After sign-in, the client sends the ID token to `/api/auth/login`.
- The server verifies the Firebase token, resolves the admin profile, and issues a JWT session cookie.
- `/api/auth/logout` clears the session cookie.

## Seed data and initial setup

- The app automatically seeds default roles and site content when API routes initialize.
- A Firebase Auth user must still be created manually in the Firebase Console.
- After creating the user, add a matching Firestore document in `admins/{uid}` with `roleId: "role-super-admin"`.

## Notes

- `/api/content` is public so the admin UI can fetch site content without requiring authentication.
- `/api/auth/logout` is allowed without a valid session so logout always clears the cookie.
- Media upload support is handled by client-side Firebase Storage; that flow is intentionally excluded from this fix.
