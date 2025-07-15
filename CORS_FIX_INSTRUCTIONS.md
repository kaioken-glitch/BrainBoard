# 🔧 CORS Fix - Backend Environment Update

## URGENT: Update Backend Environment Variables on Render

### 1. Go to Render Dashboard:
- Visit: https://render.com/dashboard
- Find and click on your backend service: **brainboard-backend**

### 2. Update Environment Variables:
Click on **"Environment"** tab and set these variables:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://brainboard-oe9h.onrender.com
```

### 3. Redeploy Backend:
- After saving environment variables, your backend will automatically redeploy
- Wait for deployment to complete (usually 1-2 minutes)

### 4. Test the Fix:
- Once redeployed, refresh your frontend: https://brainboard-oe9h.onrender.com
- The CORS error should be resolved and your app should load data properly

## Why This Fixes the Issue:
- Your backend now explicitly allows requests from your frontend domain
- The CORS policy will include the proper `Access-Control-Allow-Origin` header
- Your frontend can successfully fetch data from the API

## If Still Having Issues:
1. Check the backend logs on Render for CORS messages
2. Ensure the environment variable is exactly: `https://brainboard-oe9h.onrender.com`
3. Wait a few minutes for the backend to fully restart

Your app should work perfectly after this update! 🚀
