#!/bin/bash

# ViApp Production Build Script
# This script helps you build the production APK

echo "========================================"
echo "ViApp Production Build Script"
echo "========================================"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null
then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI already installed"
fi

echo ""
echo "Checking Expo login status..."

# Check if logged in
if eas whoami &> /dev/null
then
    echo "✅ Already logged in to Expo"
else
    echo "⚠️  Not logged in. Please login:"
    eas login
fi

echo ""
echo "========================================"
echo "Building Production APK"
echo "========================================"
echo ""
echo "This will take 10-20 minutes."
echo "You'll receive an email when it's done."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🚀 Starting build..."
    echo ""
    
    cd viApp
    eas build --platform android --profile production
    
    echo ""
    echo "========================================"
    echo "Build submitted!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. Monitor progress: https://expo.dev"
    echo "2. Check your email for completion notification"
    echo "3. Download APK from the provided link"
    echo "4. Distribute to users"
    echo ""
else
    echo "Build cancelled."
    exit 0
fi
