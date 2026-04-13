# Deploy the emergency server (no LAN / Wi‑Fi IP needed)

The mobile app connects with **Socket.IO** to `EXPO_PUBLIC_SERVER_URL`. After you deploy, use your **public HTTPS URL** (for example `https://your-service.onrender.com`). The phone can use **mobile data** or any Wi‑Fi.

## Option A — Render (free tier)

1. Push this project to GitHub (or GitLab).
2. In [Render](https://render.com): **New +** → **Blueprint** (or **Web Service**).
3. If you use a **Web Service**:
   - **Root Directory**: `WomenSafetyApp-main/server` if your repo root is `projecttt`, or `server` if your repo root is `WomenSafetyApp-main`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment** variables (Render dashboard → Environment):
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`  
   (Optional until you test SMS; the app will still connect over Socket.IO.)
5. After deploy, copy the service URL (e.g. `https://women-safety-emergency-api.onrender.com`).

## Point the Expo app at the cloud URL

In `WomenSafetyApp-main/.env`:

```env
EXPO_PUBLIC_SERVER_URL=https://your-service.onrender.com
```

No trailing slash. Restart Metro with a clean cache:

```bash
npx expo start -c
```

## Option B — ngrok (tunnel your laptop; phone can use any network)

Your PC runs the server; **ngrok** gives a public `https://…` URL that forwards to `localhost:3000`. No need for the phone to be on the same Wi‑Fi or to type your LAN IP.

### 1. Install ngrok

- Download: [ngrok download](https://ngrok.com/download)  
- Or (Windows, if you use Chocolatey): `choco install ngrok`  
- One-time: sign up at [ngrok](https://ngrok.com), copy your **authtoken**, then run:

```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 2. Start the emergency server (on your PC)

```powershell
cd WomenSafetyApp-main\server
npm install
npm run dev
```

Leave this running. It should listen on port **3000** (or whatever `PORT` is in `server\.env`).

### 3. Start the tunnel

In a **second** terminal, forward the **same port** your API uses (default in `server/.env` is **5000**):

```powershell
ngrok http 5000
```

In the ngrok UI, copy the **HTTPS** forwarding URL, for example:

`https://abcd-12-34-56-78.ngrok-free.app`

(Use **https**, not http.)

### 4. Point the Expo app at ngrok

In `WomenSafetyApp-main\.env` set (no trailing slash):

```env
EXPO_PUBLIC_SERVER_URL=https://abcd-12-34-56-78.ngrok-free.app
```

Restart Metro with a clean cache:

```powershell
cd WomenSafetyApp-main
npx expo start -c
```

Reload the app on your phone. Socket.IO will connect to your PC **through** ngrok.

### ngrok tips

- **URL changes** every time you restart ngrok on the free plan (update `.env` and restart Expo).
- If something still fails, open the ngrok URL in a phone browser once; free tier may show an interstitial the first time.
- Keep both terminals open: **server** + **ngrok**.

## Option C — Cloudflare Tunnel

Similar idea to ngrok: run `cloudflared tunnel` against port 3000, then set `EXPO_PUBLIC_SERVER_URL` to the issued HTTPS URL.

## Notes

- Free Render apps **sleep** when idle; the first request may take ~30–60s to wake.
- Socket.IO over HTTPS on Render generally works; the client already allows **polling + websocket** fallback.
