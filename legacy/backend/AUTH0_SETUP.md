# Auth0 Setup Guide for SyllabusSync Backend

## 📋 Overview

This guide will help you set up Auth0 authentication for the SyllabusSync backend API.

## 🚀 Step-by-Step Setup

### Step 1: Create Auth0 Account

1. Go to [https://auth0.com/](https://auth0.com/)
2. Click "Sign Up" and create an account
3. Complete the signup process

### Step 2: Create a Tenant

1. After logging in, you'll be prompted to create a tenant
2. Choose a tenant domain (e.g., `syllabus-sync` → `syllabus-sync.us.auth0.com`)
3. Select your region (choose closest to your users)
4. Click "Create"

### Step 3: Create an Application (for Frontend)

1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **"Create Application"**
3. Fill in:
   - **Name**: `SyllabusSync Frontend`
   - **Type**: Select **"Single Page Web Application"**
4. Click **"Create"**

5. In the **Settings** tab, configure:
   - **Allowed Callback URLs**:
     ```
     http://localhost:5173,
     http://localhost:5173/callback,
     https://your-frontend.vercel.app,
     https://your-frontend.vercel.app/callback
     ```
   - **Allowed Logout URLs**:
     ```
     http://localhost:5173,
     https://your-frontend.vercel.app
     ```
   - **Allowed Web Origins**:
     ```
     http://localhost:5173,
     https://your-frontend.vercel.app
     ```
   - **Allowed Origins (CORS)**:
     ```
     http://localhost:5173,
     https://your-frontend.vercel.app
     ```

6. **Save Changes**

7. Note down these values (needed for frontend):
   - **Domain**: `your-tenant.us.auth0.com`
   - **Client ID**: (shown in Settings)

### Step 4: Create an API (for Backend)

**This is the most important step for your backend!**

1. Go to **Applications** → **APIs**
2. Click **"Create API"**
3. Fill in:
   - **Name**: `SyllabusSync API`
   - **Identifier**: `https://syllabus-sync-api` 
     *(This is your API Audience - must match exactly in backend)*
   - **Signing Algorithm**: `RS256`
4. Click **"Create"**

5. In the API settings:
   - Go to **Permissions** tab
   - Add these scopes (optional, for granular permissions):
     - `read:syllabi` - Read syllabus data
     - `write:syllabi` - Create/update syllabi
     - `read:calendar` - Read calendar events
     - `write:calendar` - Sync to calendar
     - `read:profile` - Read user profile
     - `write:profile` - Update user profile

6. Go to **Settings** tab and note:
   - **Identifier**: This is your `AUTH0_AUDIENCE`

### Step 5: Update Backend Environment Variables

Update your `.env` file in the backend directory:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://syllabus-sync-api
```

**Replace `your-tenant` with your actual Auth0 tenant domain!**

### Step 6: Configure Auth0 for Your Frontend Team

Share these values with your frontend team:

```
Auth0 Domain: your-tenant.us.auth0.com
Client ID: (from Application settings)
Audience: https://syllabus-sync-api
```

They'll need to integrate Auth0 in their React app using `@auth0/auth0-react`.

### Step 7: Test Auth0 Integration

1. Restart your backend server:
   ```bash
   cd /Users/piyushsingh/HackUTA-2025/backend
   uvicorn main:app --reload
   ```

2. Test the auth status endpoint (should work without auth):
   ```bash
   curl http://localhost:8000/auth/status
   ```

3. Test a protected endpoint (should fail without token):
   ```bash
   curl http://localhost:8000/auth/me
   # Should return 403 Forbidden
   ```

## 📝 Frontend Integration Example

Your frontend team will need to:

1. Install Auth0 React SDK:
   ```bash
   npm install @auth0/auth0-react
   ```

2. Configure Auth0Provider in their app:
   ```javascript
   import { Auth0Provider } from '@auth0/auth0-react';

   <Auth0Provider
     domain="your-tenant.us.auth0.com"
     clientId="your-client-id"
     authorizationParams={{
       redirect_uri: window.location.origin,
       audience: "https://syllabus-sync-api",
       scope: "openid profile email read:syllabi write:syllabi"
     }}
   >
     <App />
   </Auth0Provider>
   ```

3. Get access token and call your API:
   ```javascript
   import { useAuth0 } from '@auth0/auth0-react';

   const { getAccessTokenSilently } = useAuth0();

   const token = await getAccessTokenSilently();
   
   const response = await fetch('https://your-backend.vercel.app/upload', {
     headers: {
       Authorization: `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## 🔐 Security Best Practices

1. **Never commit Auth0 credentials** - Keep `.env` in `.gitignore`
2. **Use environment variables** in Vercel for production
3. **Enable MFA** for Auth0 dashboard access
4. **Rotate secrets** if compromised
5. **Monitor Auth0 logs** for suspicious activity

## 🧪 Testing Authentication

### Generate Test Token (for development)

1. Go to your API in Auth0 Dashboard
2. Click **"Test"** tab
3. Copy the test access token
4. Use it to test your endpoints:

```bash
# Replace YOUR_TOKEN with the actual token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/auth/me
```

## ✅ Verification Checklist

- [ ] Auth0 account created
- [ ] Tenant configured
- [ ] Application created for frontend
- [ ] API created for backend
- [ ] Backend `.env` updated with AUTH0_DOMAIN and AUTH0_AUDIENCE
- [ ] Frontend team has Auth0 credentials
- [ ] Callback URLs configured correctly
- [ ] CORS settings configured
- [ ] Backend auth endpoints tested

## 🚨 Troubleshooting

### "Invalid token" errors
- Check that `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` match exactly
- Verify token hasn't expired
- Ensure frontend is requesting token with correct audience

### CORS errors
- Add frontend URL to "Allowed Origins (CORS)" in Auth0 Application settings
- Check backend CORS configuration in `main.py`

### "Unable to find appropriate key" error
- Auth0 JWKS endpoint might be unreachable
- Check your Auth0 domain is correct
- Verify internet connection

## 📚 Additional Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [FastAPI with Auth0](https://auth0.com/docs/quickstart/backend/python)
- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)

## 🆘 Need Help?

If you encounter issues:
1. Check Auth0 Dashboard logs
2. Check backend logs for detailed error messages
3. Verify all URLs and credentials are correct
4. Contact Auth0 support if needed
