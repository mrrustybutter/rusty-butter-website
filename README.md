# Rusty Butter Website

The official website for Rusty Butter (MrRustyButter) - featuring GitHub projects, Twitch streams, and ASMONGOLD MODE! 🎮

## Getting Started

### Prerequisites

1. Node.js 18+ and npm/pnpm
2. Twitch API credentials (required for streaming features)
3. GitHub personal access token (optional, but recommended)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Fill in your API credentials in `.env.local`:
   - **Twitch API**: Get credentials from [Twitch Developer Console](https://dev.twitch.tv/console/apps)
   - **GitHub Token** (optional): Create at [GitHub Settings > Tokens](https://github.com/settings/tokens)

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Features

- 🎮 **ASMONGOLD MODE**: Transform the entire site with Asmongold-themed content
- 📊 **GitHub Integration**: Display repositories with activity graphs
- 📺 **Twitch Integration**: Show live streams and VODs
- 🌐 **Responsive Design**: Works on all devices
- ⚡ **Fast Performance**: Built with Next.js 15 and optimized images

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. **Important**: Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`:
     - `TWITCH_CLIENT_ID`
     - `TWITCH_CLIENT_SECRET`
     - `GITHUB_TOKEN` (optional)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWITCH_CLIENT_ID` | Yes | Your Twitch application client ID |
| `TWITCH_CLIENT_SECRET` | Yes | Your Twitch application client secret |
| `GITHUB_TOKEN` | No | GitHub personal access token (increases API rate limit from 60 to 5000 requests/hour) |

## API Routes

- `/api/github/repos` - Fetch GitHub repositories
- `/api/twitch/streams` - Get Twitch stream status and VODs

## Tech Stack

- **Framework**: Next.js 15.4.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **APIs**: GitHub REST API, Twitch Helix API
