# Groceries Admin Panel

![Admin Panel CI](https://github.com/superbkibbles/groceries-admin/workflows/Admin%20Panel%20CI/badge.svg)

This is a [Next.js](https://nextjs.org) admin panel for the Groceries e-commerce platform, bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Features

- 📊 **Dashboard** - Overview of orders, products, and customers
- 🛍️ **Product Management** - Add, edit, and manage products
- 📦 **Order Management** - View and update order status
- 👥 **Customer Management** - Manage customer accounts
- 📂 **Category Management** - Organize products into categories
- ⚙️ **Settings** - Configure system and user settings
- 🌍 **Multi-language Support** - English and Arabic
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn UI

## Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Redux Toolkit
- **Forms**: Formik, React Hook Form
- **API Client**: Axios
- **File Upload**: UploadThing

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Backend API running (see [groceries-backend](https://github.com/superbkibbles/groceries-backend))

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables (optional)
# The app uses http://localhost/api/v1 by default
echo "NEXT_PUBLIC_API_URL=http://localhost/api/v1" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) with your browser to see the admin panel.

> **Note**: The app is configured with `basePath: "/admin"`, so all routes are prefixed with `/admin`.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
