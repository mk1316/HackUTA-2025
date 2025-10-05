# 🚀 Vercel Deployment Guide

This guide explains how to deploy the SyllabusSync application to Vercel with all three core systems.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Set up all required API keys

## 🏗️ Architecture Overview

The deployment uses a monorepo structure with three services:

- **Frontend**: Next.js app (deployed as static site)
- **Backend**: FastAPI app (deployed as serverless functions)
- **AI/ML**: FastAPI app (deployed as serverless functions)

## 🔧 Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`

### 2. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
NEXT_PUBLIC_AI_ML_URL=https://your-ai-ml-project.vercel.app
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://syllabus-sync-api
```

#### Backend Environment Variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://syllabus-sync-api
AI_ML_URL=https://your-ai-ml-project.vercel.app
FRONTEND_ORIGIN=https://your-project.vercel.app
```

#### AI/ML Environment Variables:
```
GEMINI_API_KEY=your-gemini-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

### 3. Deploy Services

#### Option A: Single Project (Recommended for Development)

1. Deploy the main project with `vercel.json` configuration
2. All services will be deployed together
3. Routes will be handled automatically:
   - `/api/ai/*` → AI/ML service
   - `/api/*` → Backend service
   - `/*` → Frontend

#### Option B: Separate Projects (Recommended for Production)

1. **Frontend Project**:
   - Deploy from `frontend/` directory
   - Use Next.js framework
   - Set environment variables for API URLs

2. **Backend Project**:
   - Deploy from `backend/` directory
   - Use Python framework
   - Set all backend environment variables

3. **AI/ML Project**:
   - Deploy from `ai_ml/` directory
   - Use Python framework
   - Set AI/ML environment variables

### 4. Update API URLs

After deployment, update your frontend environment variables to point to the deployed URLs:

```env
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
NEXT_PUBLIC_AI_ML_URL=https://your-ai-ml-project.vercel.app
```

## 🔍 Testing Deployment

### 1. Test Frontend
- Visit your deployed frontend URL
- Check if the application loads correctly

### 2. Test Backend API
```bash
curl https://your-backend-project.vercel.app/health
```

### 3. Test AI/ML Service
```bash
curl https://your-ai-ml-project.vercel.app/health
```

### 4. Test Full Integration
- Upload a PDF syllabus
- Check if AI processing works
- Verify calendar export functionality

## 🐛 Troubleshooting

### Common Issues:

1. **Python Dependencies Not Found**
   - Ensure `requirements.txt` files are in the correct directories
   - Check that all dependencies are listed with specific versions

2. **Environment Variables Not Set**
   - Verify all environment variables are configured in Vercel dashboard
   - Check that variable names match exactly (case-sensitive)

3. **CORS Errors**
   - Update `FRONTEND_ORIGIN` in backend environment variables
   - Ensure CORS middleware is properly configured

4. **API Routes Not Working**
   - Check `vercel.json` routing configuration
   - Verify that route patterns match your API structure

### Debug Commands:

```bash
# Check deployment logs
vercel logs

# Check function logs
vercel logs --function=backend/main.py
vercel logs --function=ai_ml/api.py
```

## 📊 Monitoring

1. **Vercel Analytics**: Monitor performance and usage
2. **Function Logs**: Check serverless function execution
3. **Error Tracking**: Monitor for runtime errors

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy when you push to your main branch:

1. Push changes to GitHub
2. Vercel automatically builds and deploys
3. Environment variables persist across deployments

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] CORS settings updated for production domains
- [ ] Firebase security rules configured
- [ ] Auth0 production settings configured
- [ ] API rate limiting implemented
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled

## 📞 Support

For deployment issues:
- Check Vercel documentation
- Review function logs in Vercel dashboard
- Test locally with `vercel dev` command
