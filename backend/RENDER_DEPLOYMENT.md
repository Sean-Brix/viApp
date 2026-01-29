# Deploying ViApp Backend to Render

## Quick Setup

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

2. **Set Environment Variables**
   In Render dashboard, add these environment variables:
   - `DATABASE_URL` - Your MySQL connection string
   - `JWT_SECRET` - Strong secret for JWT tokens
   - `JWT_REFRESH_SECRET` - Strong secret for refresh tokens

3. **Deploy**
   - Render will automatically deploy
   - Wait for build to complete

### Option 2: Manual Configuration

If render.yaml doesn't work, configure manually:

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Settings**
   ```
   Name: viapp-backend
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run prisma:deploy && npm start
   ```

3. **Set Environment Variables**
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `DATABASE_URL` = `mysql://user:pass@host:3306/viapp_db`
   - `JWT_SECRET` = `your-strong-secret-key`
   - `JWT_REFRESH_SECRET` = `your-refresh-secret-key`
   - `JWT_EXPIRES_IN` = `15m`
   - `JWT_REFRESH_EXPIRES_IN` = `7d`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

## Database Setup

### Option 1: PlanetScale (Recommended)
1. Create account at https://planetscale.com
2. Create new database
3. Copy connection string
4. Add to Render environment variables

### Option 2: Railway MySQL
1. Create account at https://railway.app
2. Create MySQL database
3. Copy connection string
4. Add to Render environment variables

### Option 3: Render PostgreSQL
Render also supports PostgreSQL:
1. Create PostgreSQL database in Render
2. Update Prisma schema to use PostgreSQL
3. Copy connection string to `DATABASE_URL`

## After Deployment

### 1. Run Database Migrations
The `npm run prisma:deploy` in the start command handles this automatically.

### 2. Verify Deployment
Check these endpoints:
- Health: `https://your-app.onrender.com/health`
- API Docs: `https://your-app.onrender.com/api`

### 3. Test API
```bash
curl https://your-app.onrender.com/health
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

## Troubleshooting

### Build Fails: "Cannot find module"

**Solution:** Make sure build command runs:
```
npm install && npm run build
```

### Start Fails: "dist/server.js not found"

**Solution 1:** Update build command to include TypeScript compilation:
```
npm install && npm run build
```

**Solution 2:** Check `tsconfig.json` outDir:
```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### Database Connection Fails

**Solution:** Check `DATABASE_URL` format:
```
mysql://username:password@host:port/database?sslaccept=strict
```

For PlanetScale:
```
mysql://username:password@host/database?ssl={"rejectUnauthorized":true}
```

### Prisma Client Not Generated

**Solution:** Ensure `postinstall` script runs:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Port Issues

**Solution:** Render sets `PORT` automatically. Make sure your code uses:
```typescript
const PORT = process.env.PORT || 3001;
```

## Updating Deployment

### Push Changes
```bash
git add .
git commit -m "Update backend"
git push origin master
```

Render will automatically rebuild and redeploy.

### Manual Deploy
In Render dashboard:
1. Go to your service
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

## Environment Variables Reference

Required:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

Optional:
- `NODE_ENV` - Set to `production`
- `PORT` - Render sets this automatically
- `JWT_EXPIRES_IN` - Token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)

## Cost

Render Free Tier:
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds

To prevent sleeping:
1. Upgrade to paid plan ($7/month)
2. Or use a cron job to ping the health endpoint every 14 minutes

## Monitoring

### View Logs
In Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Filter by severity

### Health Checks
Render automatically monitors:
- HTTP health checks every 30 seconds
- Automatic restart on failures

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check deployment logs for specific errors
