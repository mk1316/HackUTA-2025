# Auth0 Next.js Integration Setup

This project includes a complete Auth0 integration with Next.js for secure authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @auth0/nextjs-auth0
```

### 2. Environment Variables
Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

Update `.env.local` with your Auth0 credentials:

```env
# Auth0 Configuration
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_AUTH0_SCOPE=openid profile email
NEXT_PUBLIC_AUTH0_AUDIENCE=https://syllabus-sync-api

# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Auth0 Dashboard Configuration

#### Application Settings:
- **Application Type**: Regular Web Application
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

#### API Settings:
- **API Audience**: `https://syllabus-sync-api`
- **Scopes**: `openid`, `profile`, `email`

### 4. Run the Application
```bash
npm run dev
```

## 🎯 Features

### ✅ Authentication Flow
- **Login Page**: `/login` - Beautiful neon-styled Auth0 login
- **Dashboard**: `/dashboard` - Protected page with user info
- **API Routes**: `/api/auth/*` - Auth0 authentication endpoints
- **Protected API**: `/api/protected` - Test backend integration

### ✅ Security Features
- **Protected Routes**: Middleware protection for sensitive pages
- **Access Tokens**: Automatic token management for backend API calls
- **Session Management**: Secure session handling with Auth0
- **Error Handling**: Comprehensive error handling for auth failures

### ✅ UI/UX Features
- **Neon Styling**: Dark theme with glowing neon effects
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Smooth loading animations
- **Error Messages**: User-friendly error handling

## 🔧 API Integration

### Backend API Calls
The frontend automatically includes the Auth0 access token in API requests:

```javascript
// Example: Calling your backend API
const response = await fetch('/api/protected');
// This route automatically includes the Bearer token
```

### Token Usage
Access tokens are automatically included in requests to your backend:

```javascript
// In your backend API route
const { accessToken } = session;
const backendResponse = await fetch(`${backendUrl}/api/protected`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

## 📁 File Structure

```
frontend/
├── app/
│   ├── api/
│   │   ├── auth/[...auth0]/route.js    # Auth0 API routes
│   │   └── protected/route.js           # Protected API endpoint
│   ├── login/page.tsx                  # Login page
│   ├── dashboard/page.tsx              # Protected dashboard
│   └── layout.tsx                      # App layout with UserProvider
├── components/
│   └── Auth0LoginCard.tsx              # Auth0 login component
├── lib/
│   └── auth0.js                        # Auth0 configuration
├── middleware.js                       # Route protection
└── env.example                         # Environment variables template
```

## 🎨 Styling

The login page features:
- **Neon Background**: Animated gradient with moving light streaks
- **Glassmorphism Card**: Frosted glass effect with neon borders
- **Animated Button**: Glowing neon button with hover effects
- **Responsive Design**: Mobile-friendly layout

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env.local` to version control
2. **HTTPS**: Use HTTPS in production for secure cookie transmission
3. **Domain Configuration**: Ensure Auth0 domain matches your application
4. **Token Security**: Access tokens are automatically managed by Auth0

## 🚀 Production Deployment

### Vercel Deployment
1. Set environment variables in Vercel dashboard
2. Update Auth0 callback URLs for production domain
3. Deploy with `vercel deploy`

### Environment Variables for Production
```env
NEXT_PUBLIC_AUTH0_DOMAIN=your-production-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-production-client-id
AUTH0_CLIENT_SECRET=your-production-client-secret
NEXT_PUBLIC_AUTH0_REDIRECT_URI=https://your-domain.com/api/auth/callback
NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI=https://your-domain.com
```

## 🐛 Troubleshooting

### Common Issues:
1. **"Invalid callback URL"**: Check Auth0 dashboard callback URLs
2. **"Invalid client"**: Verify client ID and secret
3. **"Token expired"**: Check token lifetime settings in Auth0
4. **CORS errors**: Ensure allowed origins are configured

### Debug Mode:
Enable debug logging by adding to `.env.local`:
```env
AUTH0_DEBUG=true
```

## 📚 Documentation

- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Ready to Use!

Your Auth0 integration is now complete and ready for development!
