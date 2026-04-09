# Footprint Logger Platform

Professional web platform to track daily carbon-emission activities, view summaries, and receive actionable insights.

## Stack

- Frontend: React, Redux Toolkit, JavaScript, HTML, CSS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth

## Features

- Activity logging with CO2 factors and running totals
- Activity category filtering (food, transport, energy)
- Visual emissions summary with category chart bars
- Local storage persistence for logged-out usage
- User registration/login with token-based authentication
- User-specific activity logs and dashboard summaries
- Weekly summaries, streak tracking, and community average comparison
- Insight engine with highest-emission category tips
- Weekly reduction goal tracking and progress monitoring

## Run Frontend

```bash
npm install
npm run dev
```

## Run Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```
