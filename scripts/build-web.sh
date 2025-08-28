#!/bin/bash

echo "🚀 Building SugarCipher for web deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Start the web build process
echo "🌐 Starting web build..."
echo "   This will take a few minutes. Please wait..."
echo "   You can monitor progress in the terminal."

# Start the web build in the background
npm run start-web &
WEB_PID=$!

# Wait for the build to complete (check for web-build directory)
echo "⏳ Waiting for build to complete..."
while [ ! -d ".expo/web-build" ]; do
    sleep 5
    echo "   Still building..."
done

echo "✅ Web build completed!"

# Stop the web server
kill $WEB_PID 2>/dev/null

# Copy build files to dist directory
echo "📁 Preparing dist directory..."
rm -rf dist
mkdir -p dist
cp -r .expo/web-build/* dist/

echo "🎉 Build complete! Files are ready in the 'dist' directory."
echo "📋 Next steps:"
echo "   1. Install Netlify CLI: npm install -g netlify-cli"
echo "   2. Deploy: netlify deploy --prod --dir=dist"
echo "   3. Or use Netlify dashboard with build command: npm run build:web:netlify"
