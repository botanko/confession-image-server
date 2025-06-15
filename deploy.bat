@echo off
echo 🚀 Deploying Confession Image Generator to Vercel...
echo.

echo 📦 Installing dependencies...
npm install

echo.
echo 🔄 Deploying to Vercel...
npx vercel --prod

echo.
echo ✅ Deployment completed!
echo 🌐 Your API should now be live at your Vercel URL
echo 🧪 Test it at: https://your-app-name.vercel.app/api/test-image
echo.
pause
