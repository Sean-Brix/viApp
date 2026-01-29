# Fix Render Deployment - Quick Steps

## Current Error
```
Error: Cannot find module '/opt/render/project/src/backend/dist/server.js'
```

## The Problem
The TypeScript files aren't being compiled to JavaScript before running.

## The Solution

### In Render Dashboard:

1. **Go to your service settings**
2. **Update Build Command:**
   ```
   cd backend && npm install && npm run build
   ```

3. **Update Start Command:**
   ```
   cd backend && npm run prisma:deploy && npm start
   ```

4. **Set Root Directory (Important!):**
   - Leave blank (empty) or set to `/`
   - NOT `backend` - because we're using `cd backend` in commands

5. **Save and Redeploy**

## Alternative: If Root Directory is "backend"

If you set Root Directory to `backend`:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run prisma:deploy && npm start
```

## Verify

After deployment, check:
```bash
curl https://viapp-qq6u.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "ViApp Backend API",
  "version": "1.0.0"
}
```

## Still Not Working?

### Check Logs
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Look for build errors

### Common Issues

**Issue 1: Prisma Client not generated**
- Make sure `postinstall` script is in package.json ✅ (Already added)

**Issue 2: TypeScript not compiling**
- Check if `tsc` is in devDependencies
- Build command includes `npm run build`

**Issue 3: Wrong directory**
- Root Directory should be empty or `/`
- Build/Start commands include `cd backend`

## Environment Variables

Make sure these are set in Render:
- `DATABASE_URL` - Your MySQL connection string
- `JWT_SECRET` - Strong secret
- `JWT_REFRESH_SECRET` - Strong secret
- `NODE_ENV` = production
- `PORT` = 3001

## Quick Test Locally

Before deploying, test build locally:
```bash
cd backend
npm install
npm run build
npm start
```

If this works locally, it should work on Render.
