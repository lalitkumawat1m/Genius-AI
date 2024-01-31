
# Genius AI

An AI Saas tool that can Generate Music, Video, Photo, Code & Chat.

It is built using Nextjs, TailwindCss+ShadcnUi, Zustand, Clerk, Prisma, Postgresql, and Stripe.

## Screenshots

<img width="875" alt="Screenshot 2024-01-31 084121" src="https://github.com/lalitkumawat1m/Genius-AI/assets/91591901/c32e4ccd-ee93-4386-98af-0ccddbc27632">


## Features

 - Full responsiveness
 - Tailwind animations and effects
 - Image Generation Tool (Open AI)
 - Video Generation Tool (Replicate AI)
 - Conversation Generation Tool (Open AI)
 - Music Generation Tool (Replicate AI)
 - Clerk Authentication (Email, Google, 9+ Social Logins)
 - Client form validation and handling using react-hook-form
  - Stripe monthly subscription
 - Free tier with API limiting
 - How to write POST, DELETE, and GET routes in route handlers (app/api)
 - Server error handling using react-toast
 - Page loading state
 - How to fetch data in server react components by directly accessing the database (WITHOUT API! like Magic!)
 - How to handle relations between Server and Child components!
 - How to reuse layouts


## Setup .env file

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

OPENAI_API_KEY=
REPLICATE_API_TOKEN=

POSTGRES_URL_NON_POOLING=

STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```


## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

## Setup Prisma

Add Postgresql Database (I used vercel Postgresql)


```bash
  npx prisma db push
```


Start the App

```bash
  npm run dev
```
