# BrainBoard Deployment Guide for Render

## Backend Deployment Steps:

### 1. Create Render Web Service for Backend:
- Go to https://render.com
- Click "New" -> "Web Service"
- Connect your GitHub repository
- Select the Backend folder as the root directory
- Use these settings:
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Environment**: Node
  - **Auto-Deploy**: Yes

### 2. Environment Variables for Backend:
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 3. After Backend Deployment:
- Copy your backend URL (e.g., https://brainboard-backend-xyz.onrender.com)

## Frontend Deployment Steps:

### 1. Update Frontend Environment:
Update the `.env` file in Frontend folder:
```
VITE_API_BASE_URL=https://brainboard-lzvg.onrender.com/api
```

### 2. Create Render Static Site for Frontend:
- Go to Render dashboard
- Click "New" -> "Static Site"
- Connect your GitHub repository
- Select the Frontend folder as the root directory
- Use these settings:
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`
  - **Auto-Deploy**: Yes

### 3. Update Backend CORS:
After frontend deployment, update the backend environment variable:
```
FRONTEND_URL=https://your-frontend-app.onrender.com
```

## Important Notes:

### File Persistence:
- Render's ephemeral filesystem means `data.json` will reset on each deployment
- Consider upgrading to a database (MongoDB, PostgreSQL) for production
- For now, the app will work but data won't persist between deployments

### Free Tier Limitations:
- Backend may "sleep" after 15 minutes of inactivity
- First request after sleep may take 30+ seconds
- Consider using Render's paid tier for always-on service

### URLs to Update:
1. Replace `your-backend-app` with your actual backend app name
2. Replace `your-frontend-app` with your actual frontend app name
3. Update CORS origins in backend after frontend deployment

## Testing Deployment:
1. Deploy backend first
2. Test API endpoints: `https://brainboard-lzvg.onrender.com/api/tasks`
3. Update frontend environment variables
4. Deploy frontend
5. Test full application functionality

## Alternative Database Setup (Recommended for Production):
Consider integrating with:
- MongoDB Atlas (free tier available)
- PostgreSQL on Render
- Supabase (free tier with PostgreSQL)

This would replace the `data.json` file system and provide proper data persistence.
