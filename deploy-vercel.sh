#!/bin/bash

# PDPDF Vercel Deployment Script
# This script prepares the project for deployment to Vercel

set -e

echo "🚀 Preparing PDPDF for Vercel deployment..."

# 1. Environment Setup
echo "📋 Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    exit 1
fi

# 2. Build Test
echo "🔨 Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# 3. SEO Validation
echo "🔍 Validating SEO configuration..."

# Check if sitemap is accessible
if [ -f "src/app/sitemap.ts" ]; then
    echo "✅ Sitemap configuration found"
else
    echo "❌ Sitemap configuration missing"
fi

# Check if robots.txt is configured
if [ -f "src/app/robots.ts" ]; then
    echo "✅ Robots.txt configuration found"
else
    echo "❌ Robots.txt configuration missing"
fi

# 4. Google AdSense Check
echo "💰 Checking Google AdSense configuration..."
if grep -q "ca-pub-6879569899763830" .env.production; then
    echo "✅ AdSense Client ID configured"
else
    echo "⚠️  AdSense Client ID not found in .env.production"
fi

# 5. Performance Check
echo "⚡ Running performance checks..."
echo "Checking bundle size..."
du -sh .next 2>/dev/null || echo "No .next directory found"

# 6. Security Headers Check
echo "🔒 Validating security configuration..."
if [ -f "vercel.json" ]; then
    echo "✅ Vercel configuration found"
else
    echo "⚠️  vercel.json not found"
fi

# 7. Final Deployment Instructions
echo ""
echo "🎉 PDPDF is ready for Vercel deployment!"
echo ""
echo "📝 Deployment Instructions:"
echo "1. Connect your GitHub repo to Vercel"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-6879569899763830"
echo "   - NEXT_PUBLIC_ADSENSE_SLOT_TOP=[Real Slot ID]"
echo "   - NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE=[Real Slot ID]"
echo "   - NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM=[Real Slot ID]"
echo "   - NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=[Real Slot ID]"
echo "   - NEXT_PUBLIC_APP_URL=https://pdpdf.vercel.app"
echo "3. Deploy and your site will be live at: https://pdpdf.vercel.app"
echo ""
echo "🎯 SEO Setup:"
echo "- Sitemap: https://pdpdf.vercel.app/sitemap.xml"
echo "- Robots: https://pdpdf.vercel.app/robots.txt"
echo "- Submit sitemap to Google Search Console"
echo "- Apply for Google AdSense approval with real slot IDs"
echo ""
echo "✨ Ready to deploy! 🚀"
