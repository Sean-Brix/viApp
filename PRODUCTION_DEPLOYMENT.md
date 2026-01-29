# Production Deployment Checklist

## Backend (Render.com)

### ✅ Completed
- [x] Server deployed to: https://viapp-qq6u.onrender.com
- [x] Database connected and migrated
- [x] Environment variables set

### Verify
- [ ] Health check endpoint working: `GET /health`
- [ ] API documentation accessible: `GET /api`
- [ ] CORS configured for mobile app
- [ ] Database backups enabled
- [ ] SSL/HTTPS enabled (should be automatic on Render)

### Environment Variables on Render

Ensure these are set in Render dashboard:

```
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

### Database Migration

If not done yet:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Frontend (Mobile App)

### ✅ Completed
- [x] API URL updated to production: `https://viapp-qq6u.onrender.com/api`
- [x] Android permissions configured
- [x] App version set to 1.0.0
- [x] Build configuration ready (eas.json)

### Before Building
- [ ] Test all features locally with production API
- [ ] Remove console.log statements (optional)
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Test real-time updates
- [ ] Test Bluetooth functionality

### Build Steps

1. **Install EAS CLI** (if not installed)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Build Production APK**
   ```bash
   cd viApp
   eas build --platform android --profile production
   ```

4. **Wait for build** (~10-20 minutes)
   - Monitor progress: https://expo.dev

5. **Download APK**
   - Link will be provided after build completes

## Testing Production Build

### Backend Testing
```bash
# Health Check
curl https://viapp-qq6u.onrender.com/health

# Login Test
curl -X POST https://viapp-qq6u.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Mobile App Testing
- [ ] Install APK on physical Android device
- [ ] Test admin login
- [ ] Test student login
- [ ] Verify dashboard loads correctly
- [ ] Test device registration
- [ ] Test vitals display
- [ ] Test alerts functionality
- [ ] Test real-time updates
- [ ] Test profile editing
- [ ] Test statistics views
- [ ] Test logout

## Post-Deployment

### 1. Monitor Backend
- Check Render logs for errors
- Monitor API response times
- Watch for failed requests

### 2. Monitor Database
- Check connection pool usage
- Monitor query performance
- Verify data integrity

### 3. User Feedback
- Collect feedback from initial users
- Monitor crash reports
- Track feature usage

## Rollback Plan

If issues occur:

### Backend
1. Revert to previous deployment in Render dashboard
2. Or re-deploy stable commit

### Mobile App
1. Rebuild previous version
2. Distribute updated APK to users

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] API endpoints require authentication
- [ ] Sensitive data is encrypted
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured (if applicable)
- [ ] Input validation is implemented
- [ ] SQL injection protection (Prisma handles this)
- [ ] CORS is properly configured

## Performance Optimization

### Backend
- [ ] Database indexes are optimized
- [ ] Query performance is acceptable
- [ ] Caching is implemented where needed
- [ ] Connection pooling is configured

### Mobile App
- [ ] Images are optimized
- [ ] API calls are minimized
- [ ] Loading states are shown
- [ ] Offline support works (if implemented)

## Documentation

- [ ] API documentation is up to date
- [ ] User manual created (if needed)
- [ ] Admin guide created
- [ ] Build instructions documented ✅
- [ ] Deployment process documented ✅

## Maintenance Plan

### Regular Tasks
- Weekly database backups verification
- Monthly dependency updates
- Security patches applied promptly
- Performance monitoring
- User feedback review

### Emergency Contacts
- Backend issues: Check Render dashboard
- Database issues: Check database provider
- App issues: Review logs and user reports

## Next Steps After Deployment

1. **Distribute APK**
   - Share with school staff
   - Install on student devices
   - Provide installation instructions

2. **Training**
   - Train administrators on system usage
   - Provide user guides
   - Set up support channel

3. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor user adoption
   - Collect feedback

4. **Iteration**
   - Plan feature updates
   - Address bugs promptly
   - Implement user feedback

## Success Metrics

Track these after deployment:
- Number of active users
- Daily vitals recorded
- Alerts generated and resolved
- App uptime
- API response times
- User satisfaction
- Feature usage statistics
