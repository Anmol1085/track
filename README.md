# Hacker Portfolio with Discord Analytics Integration

A modern, dark-themed portfolio website that automatically tracks non-sensitive visitor information (browser, OS, screen resolution, timezone, etc.) and instantly sends it to a Discord webhook via a Node.js/Express backend.

## Features

- **Modern Hacker UI**: Black aesthetic, neon green accents, cyber-grid background, glitch text effect.
- **Responsive Layout**: Works seamlessly on desktops and mobile devices.
- **Analytics Collection**: Uses pure JavaScript to gather basic system metadata safely without passwords or sensitive info.
- **Discord Integration**: Sends a cleanly formatted rich embed to your specified Discord channel immediately upon a visit.

## Project Structure

```text
/
├── .env                  # Environment variables (Discord Webhook URL)
├── package.json          # Node.js dependencies
├── server.js             # Express backend server
└── public/               # Frontend static files
    ├── index.html        # HTML layout
    ├── style.css         # Styling and animations
    └── script.js         # Analytics collection logic
```

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A Discord account and a Server where you have permission to create webhooks.

### 2. Installation

Clone this repository or open the project folder in your terminal, then install the dependencies:

```bash
npm install
```

### 3. Discord Webhook Setup

1. Open Discord, go to your Server Settings -> Integrations -> Webhooks.
2. Click **New Webhook**, name it (e.g., "Portfolio Analytics"), choose a channel, and copy the **Webhook URL**.
3. Open the `.env` file in the root of the project and replace the placeholder with your copied URL:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
PORT=3000
```

### 4. Running Locally

Start the local server:

```bash
npm start
```
(or `node server.js`)

Open your browser and visit `http://localhost:3000`. Your visit should instantly trigger a message in your Discord channel!

### 5. Deployment

You can deploy this repository to free hosting services like **Render** or **Railway**.

**For Render / Railway:**
1. Push this code to a GitHub repository.
2. Go to Render or Railway and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `npm start` (or `node server.js`).
6. Go to the **Environment Variables** section in the deployment dashboard and add `DISCORD_WEBHOOK_URL` with your webhook URL.
7. Deploy! The express server will automatically run and serve your static files.
