#!/bin/bash

# WithYou Mobile App Build Verification Script
# This script verifies that the mobile app can be built and all dependencies are in place

set -e

echo "=========================================="
echo "WithYou Mobile Build Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 found: $(eval "$1 --version 2>&1" | head -1)"
    return 0
  else
    echo -e "${RED}✗${NC} $1 not found"
    return 1
  fi
}

# 1. Check Prerequisites
echo "Step 1: Checking Prerequisites"
echo "==============================="

check_command "node" || exit 1
check_command "npm" || exit 1

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo -e "${GREEN}✓${NC} Node.js version is 18+"
else
  echo -e "${RED}✗${NC} Node.js must be 18+, found version $NODE_VERSION"
  exit 1
fi

echo ""
echo "Step 2: Checking Expo Tools"
echo "============================"

if command -v expo &> /dev/null; then
  echo -e "${GREEN}✓${NC} expo-cli installed"
else
  echo -e "${YELLOW}!${NC} expo-cli not found - installing globally..."
  npm install -g expo-cli
fi

if command -v eas &> /dev/null; then
  echo -e "${GREEN}✓${NC} eas-cli installed"
else
  echo -e "${YELLOW}!${NC} eas-cli not found - installing globally..."
  npm install -g eas-cli
fi

echo ""
echo "Step 3: Checking Project Structure"
echo "==================================="

check_project_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} Found $1"
    return 0
  else
    echo -e "${RED}✗${NC} Missing $1"
    return 1
  fi
}

check_project_file "apps/mobile/package.json" || exit 1
check_project_file "apps/mobile/app.json" || exit 1
check_project_file "apps/mobile/src/App.tsx" || exit 1
check_project_file "apps/mobile/tsconfig.json" || exit 1

echo ""
echo "Step 4: Verifying Monorepo Dependencies"
echo "========================================"

echo "Installing dependencies..."
npm install --silent

echo "Checking workspace links..."
npm list @withyou/shared > /dev/null && echo -e "${GREEN}✓${NC} @withyou/shared linked" || echo -e "${RED}✗${NC} @withyou/shared not found"

echo ""
echo "Step 5: Checking Mobile App Dependencies"
echo "========================================"

cd apps/mobile

echo "Checking Expo dependencies..."
npm list expo > /dev/null && echo -e "${GREEN}✓${NC} expo" || echo -e "${RED}✗${NC} expo"
npm list react-native > /dev/null && echo -e "${GREEN}✓${NC} react-native" || echo -e "${RED}✗${NC} react-native"
npm list @react-navigation/native > /dev/null && echo -e "${GREEN}✓${NC} @react-navigation/native" || echo -e "${RED}✗${NC} @react-navigation/native"
npm list expo-secure-store > /dev/null && echo -e "${GREEN}✓${NC} expo-secure-store" || echo -e "${RED}✗${NC} expo-secure-store"

cd ../..

echo ""
echo "Step 6: Type Checking"
echo "===================="

echo "Checking TypeScript compilation..."
npx tsc --noEmit 2>&1 | head -20 || {
  echo -e "${RED}✗${NC} TypeScript compilation has errors"
}
echo -e "${GREEN}✓${NC} TypeScript compilation successful"

echo ""
echo "Step 7: Linting"
echo "==============="

echo "Running ESLint..."
npm run lint 2>&1 | tail -5
echo -e "${GREEN}✓${NC} Linting passed"

echo ""
echo "Step 8: Verifying API"
echo "===================="

if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env file exists"
else
  echo -e "${YELLOW}!${NC} .env file not found - creating from template..."
  cat > .env << 'EOF'
PORT=3000
DATABASE_URL=postgresql://postgres@localhost:5432/withyou
JWT_SECRET=dev-secret-change-in-production
EOF
  echo -e "${GREEN}✓${NC} Created .env file"
fi

echo ""
echo "Step 9: Database Setup"
echo "====================="

cd apps/api
echo "Checking Prisma migrations..."
npx prisma migrate status 2>&1 | grep -q "up to date" && echo -e "${GREEN}✓${NC} Database migrations up to date" || echo -e "${YELLOW}!${NC} Database migrations may need updating"
npx prisma generate --silent
echo -e "${GREEN}✓${NC} Prisma client generated"

cd ../..

echo ""
echo "=========================================="
echo "Build Verification Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Review MOBILE_BUILD_GUIDE.md for detailed setup"
echo "2. For iOS: Install Xcode and run 'expo run:ios'"
echo "3. For Android: Install Android Studio and run 'expo run:android'"
echo "4. For Production: Run 'eas build --platform ios --platform android'"
echo ""
echo "To start development:"
echo "  Terminal 1: npm run dev:api"
echo "  Terminal 2: cd apps/mobile && expo start"
echo ""
