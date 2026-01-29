# Environment Configuration Guide

## Switching Between Development and Production Backends

### Quick Switch

Edit `viApp/src/config/environment.ts`:

```typescript
export const ENV_CONFIG = {
  USE_PRODUCTION: false, // ← Change this to true for production
  // ...
};
```

### Configuration Options

#### Development Mode (Local Backend)
```typescript
USE_PRODUCTION: false
```
- Uses local backend: `http://192.168.100.10:3001/api`
- Update `DEVELOPMENT_API_URL` to your computer's local IP
- Best for development and testing

#### Production Mode (Render Backend)
```typescript
USE_PRODUCTION: true
```
- Uses production backend: `https://viapp-qq6u.onrender.com/api`
- Best for production builds and live testing

### Finding Your Local IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for `inet` address

**Update the config:**
```typescript
DEVELOPMENT_API_URL: 'http://YOUR_IP_HERE:3001/api'
```

### Current Setup

The app will automatically log which backend it's using:
- 🔧 Development: Shows your local IP
- 🌐 Production: Shows Render URL

### Making Sure Backend is Running

**Local Development:**
```bash
cd backend
npm run dev
```
Server should start on: `http://localhost:3001`

**Production:**
Visit: https://viapp-qq6u.onrender.com/health
Should return: `{"status": "OK", ...}`

### Troubleshooting

1. **"Network error: Cannot connect to server"**
   - Check `USE_PRODUCTION` setting
   - Verify IP address in `DEVELOPMENT_API_URL`
   - Ensure backend server is running
   - Check firewall settings

2. **Backend URL in logs doesn't match**
   - Restart the app completely
   - Check console for "Using PRODUCTION/DEVELOPMENT backend" message

3. **Production backend slow**
   - Render free tier may sleep after inactivity
   - First request can take 30-60 seconds to wake up
   - Consider upgrading Render plan
