# SugarCipher Netlify Deployment Guide

## Overview
This guide will help you deploy your SugarCipher Expo app to Netlify for web access.

## Prerequisites
- Node.js 18+ installed
- Netlify account
- GitHub repository connected to Netlify

## Deployment Steps

### 1. Build the Web Version
First, build the web version of your app:

```bash
# Start the web build process
npm run start-web

# In another terminal, wait for the build to complete
# The build files will be in .expo/web-build/
```

### 2. Prepare for Netlify
Run the build script to prepare the dist folder:

```bash
npm run build:web:netlify
```

### 3. Deploy to Netlify

#### Option A: Netlify CLI (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Option B: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build command: `npm run build:web:netlify`
5. Set publish directory: `dist`
6. Deploy!

### 4. Environment Variables
Set these in Netlify dashboard:
- `NODE_VERSION`: `18`
- `NPM_VERSION`: `9`

### 5. Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS as instructed

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Clear cache: `npx expo start --clear`
- Check Metro configuration in `metro.config.js`

### Runtime Issues
- Check browser console for errors
- Verify all imports are web-compatible
- Test locally first: `npm run serve:web`

## File Structure
```
sugarcypher/
├── dist/           # Built web files (created by build)
├── netlify.toml    # Netlify configuration
├── webpack.config.js # Web build configuration
└── package.json    # Build scripts
```

## Support
If you encounter issues:
1. Check the Netlify build logs
2. Verify the local build works
3. Check Expo documentation for web deployment
