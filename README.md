# Claydohscope Store

A modern e-commerce store built with Next.js and Supabase.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Supabase](https://supabase.com) project with:
   - Email/Password authentication enabled
   - Products and Orders tables created
   - Storage bucket for product images (optional)
   - Row Level Security (RLS) policies configured

### Environment Variables

You'll need to set the following environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project's anon/public key
- `NEXT_PUBLIC_ADMIN_USER`: The admin user's email address

### Deployment Steps

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `claydohscope-store` repository
   - Configure environment variables:
     - Copy values from your `.env.local`
     - Add them to Vercel's environment variables section
   - Click "Deploy"

3. **Post-Deployment Checks**
   - Visit your deployed site
   - Verify admin login at `/admin`
   - Test product management
   - Verify order processing
   - Check image uploads

```

```
