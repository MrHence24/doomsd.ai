# Doomsd.AI — Live H.B.O.S. backend (local development)

This package adds the first live-model integration without replacing the current Windows 95-style prototype.

## What this adds

- A Node.js server that keeps the OpenAI API key off the browser.
- A `/api/chat` endpoint using the OpenAI Responses API.
- Persistent local session history and a compact player model in `data/sessions.json`.
- A cautious player-model update format that distinguishes stated values from observed priorities.
- Request-size and per-IP rate limits for local testing.
- `store: false` on Responses API calls; the game still stores its own local session history.
- A strict boundary: the model writes dialogue and observations only. The deterministic game engine remains authoritative for proposals, approvals, and world-state changes.

## Requirements

- Node.js 20 or newer.
- An OpenAI API key with API billing enabled.
- The existing Doomsd.AI `index.html` in this same folder.

## Setup in GitHub Codespaces

1. Add these files to the root of the existing `doomsd.ai` repository:
   - `package.json`
   - `server.js`
   - `.env.example`
   - `.gitignore`
   - `client-integration.js`
   - `README.md`
2. In the Codespaces terminal, run:

   ```bash
   npm install
   cp .env.example .env
   ```

3. Open `.env` and replace the placeholder with your API key. Never put the key in `index.html`, JavaScript sent to the browser, GitHub, or a chat message.
4. In `index.html`, find the existing `function sendCommand(cmd){...}` and replace that entire function with the contents of `client-integration.js`.
5. Start the server:

   ```bash
   npm start
   ```

6. In the Codespaces Ports panel, open port `3000`. Keep its visibility **Private** while this development server has no user authentication.
7. Check `https://YOUR-CODESPACE-URL/api/health`. It should report `ok: true` and `aiConfigured: true`.

## Model and cost controls

- The default model is `gpt-5.5`, configurable through `OPENAI_MODEL` in `.env`.
- Each request is capped at 500 output tokens.
- Only the latest 8 conversation turns plus the compact player model are sent as context.
- The local server limits requests to 20 per IP per 10-minute window.
- The server does not expose the API key to the browser.
- Set a small API project budget/alert in the OpenAI dashboard as an additional safeguard. Dashboard budgets may be alerts rather than hard spending caps; retain the server-side limits too.

## Important deployment boundary

This is a local-development foundation, not a production public service. It has no user authentication, and session data is stored as a local JSON file. Do not expose the port publicly or deploy it for strangers until authentication, durable database storage, stronger abuse controls, and deployment secrets are configured.

## Current integration behavior

The existing `respond()` function runs first and changes the game only through its deterministic rules. The live model then receives the message, a read-only snapshot of the resulting game state, and the deterministic engine's outcome. It returns H.B.O.S. dialogue and evidence-based observations about in-game player behavior. It cannot execute actions or alter metrics.

The browser retains the deterministic fallback if the server or API is unavailable.
