@echo off
echo 🚀 Deploying Confession Image Generator to Vercel...
echo.

echo 🧹 Cleaning up previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

echo.
echo � Checking installation...
if exist node_modules\canvas\package.json (
    echo ✅ Canvas library installed successfully
) else (
    echo ❌ Canvas library installation failed
    echo Trying alternative installation...
    npm install canvas@2.11.2 --legacy-peer-deps --verbose
)

echo.
echo �🔄 Deploying to Vercel...
npx vercel --prod

echo.
echo ✅ Deployment completed!
echo 🌐 Your API should now be live at your Vercel URL
echo 🧪 Test it at: https://your-app-name.vercel.app/api/test-image
echo.
echo 📋 Next steps:
echo 1. Copy your Vercel URL from the deployment output above
echo 2. Update IMAGE_SERVER_URL in your Google Apps Script
echo 3. Test the API using the test page
echo.
pause
