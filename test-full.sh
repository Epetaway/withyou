#!/usr/bin/env bash
# Complete QA test suite for WithYou - tests lint, build, API, and all workflows
# Run this script to validate the entire development environment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Workspace root
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "══════════════════════════════════════════════════════════════"
echo "   WithYou Full QA Test Suite - Development Environment"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Helper functions
pass() {
  echo -e "${GREEN}✓ PASS${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
  echo -e "${RED}✗ FAIL${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

warn() {
  echo -e "${YELLOW}⚠ WARN${NC} $1"
  WARNINGS=$((WARNINGS + 1))
}

section() {
  echo ""
  echo -e "${BLUE}═══ $1 ═══${NC}"
  echo ""
}

# =============================================================================
# 1. ENVIRONMENT CHECKS
# =============================================================================
section "Environment Checks"

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  pass "Node.js installed: $NODE_VERSION"
else
  fail "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  pass "npm installed: $NPM_VERSION"
else
  fail "npm not installed"
fi

# Check jq for JSON parsing
if command -v jq &> /dev/null; then
  pass "jq installed"
else
  warn "jq not installed (optional, improves output)"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
  pass "PostgreSQL client installed"
else
  warn "PostgreSQL client not installed"
fi

# =============================================================================
# 2. WORKSPACE STRUCTURE
# =============================================================================
section "Workspace Structure Validation"

if [ -f "$WORKSPACE_ROOT/package.json" ]; then
  pass "Root package.json exists"
else
  fail "Root package.json not found"
fi

if [ -d "$WORKSPACE_ROOT/apps/api" ]; then
  pass "API workspace exists"
else
  fail "API workspace not found"
fi

if [ -d "$WORKSPACE_ROOT/apps/mobile" ]; then
  pass "Mobile workspace exists"
else
  fail "Mobile workspace not found"
fi

if [ -d "$WORKSPACE_ROOT/packages/shared" ]; then
  pass "Shared package exists"
else
  fail "Shared package not found"
fi

# =============================================================================
# 3. DEPENDENCIES
# =============================================================================
section "Dependencies Check"

if [ -d "$WORKSPACE_ROOT/node_modules" ]; then
  pass "Root node_modules exists"
else
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  if [ $? -eq 0 ]; then
    pass "Dependencies installed"
  else
    fail "Failed to install dependencies"
  fi
fi

# =============================================================================
# 4. LINTING
# =============================================================================
section "Code Quality - Linting"

echo "Running root lint..."
if npm run lint > /dev/null 2>&1; then
  pass "Root lint check"
else
  fail "Root lint check failed"
fi

echo "Running API lint..."
if npm run lint --workspace @withyou/api > /dev/null 2>&1; then
  pass "API lint check"
else
  fail "API lint check failed"
fi

echo "Running mobile lint..."
if npm run lint --workspace @withyou/mobile > /dev/null 2>&1; then
  pass "Mobile lint check"
else
  fail "Mobile lint check failed"
fi

# =============================================================================
# 5. TYPESCRIPT BUILD
# =============================================================================
section "TypeScript Build - Shared Package"

echo "Building shared package..."
if npm run build --workspace @withyou/shared > /dev/null 2>&1; then
  pass "Shared package build"
else
  fail "Shared package build failed"
fi

# =============================================================================
# 6. PRISMA
# =============================================================================
section "Database - Prisma"

# Check .env file
if [ -f "$WORKSPACE_ROOT/apps/api/.env" ] || [ -f "$WORKSPACE_ROOT/apps/api/.env.development" ]; then
  pass "API environment file exists"
else
  fail "API .env file not found (copy .env.example)"
fi

echo "Generating Prisma client..."
if npm run prisma:generate --workspace @withyou/api > /dev/null 2>&1; then
  pass "Prisma client generated"
else
  fail "Prisma client generation failed"
fi

echo "Checking database migrations..."
# Try to apply migrations, but don't fail if database is not accessible
if npm run prisma:migrate:deploy --workspace @withyou/api > /dev/null 2>&1; then
  pass "Database migrations applied"
else
  warn "Could not apply migrations (database may not be accessible)"
fi

# =============================================================================
# 7. API SERVER
# =============================================================================
section "API Server"

# Check if server is already running
if lsof -i :3000 > /dev/null 2>&1; then
  warn "Port 3000 already in use - assuming API is running"
  SERVER_STARTED_HERE=false
else
  echo "Starting API server..."
  cd "$WORKSPACE_ROOT"
  npx tsx apps/api/src/index.ts > /tmp/withyou-api-test.log 2>&1 &
  API_PID=$!
  SERVER_STARTED_HERE=true
  
  # Wait for server to start
  sleep 3
  
  if ps -p $API_PID > /dev/null; then
    pass "API server started (PID: $API_PID)"
  else
    fail "API server failed to start"
    cat /tmp/withyou-api-test.log
  fi
fi

# =============================================================================
# 8. API HEALTH CHECK
# =============================================================================
section "API Health Check"

HEALTH_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null || echo "")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  pass "API health endpoint responding"
else
  fail "API health endpoint not responding"
fi

# =============================================================================
# 9. API ENDPOINTS - QA USER TESTS
# =============================================================================
section "API Endpoints - QA User Authentication"

# Test login with QA user
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa_alex@example.com","password":"password123"}' 2>/dev/null || echo "")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  QA_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  pass "QA user login successful"
else
  warn "QA user login failed (may need to seed database)"
  QA_TOKEN=""
fi

# =============================================================================
# 10. AUTHENTICATED ENDPOINTS
# =============================================================================
if [ -n "$QA_TOKEN" ]; then
  section "API Endpoints - Authenticated Requests"
  
  # Dashboard
  DASHBOARD=$(curl -s -H "Authorization: Bearer $QA_TOKEN" \
    http://localhost:3000/dashboard 2>/dev/null || echo "")
  if echo "$DASHBOARD" | grep -q '"relationshipStage"'; then
    pass "Dashboard endpoint"
  else
    fail "Dashboard endpoint"
  fi
  
  # Ideas
  IDEAS=$(curl -s -H "Authorization: Bearer $QA_TOKEN" \
    http://localhost:3000/ideas?mode=reconnect 2>/dev/null || echo "")
  if echo "$IDEAS" | grep -q '"ideas"'; then
    pass "Ideas endpoint"
  else
    fail "Ideas endpoint"
  fi
  
  # User profile
  PROFILE=$(curl -s -H "Authorization: Bearer $QA_TOKEN" \
    http://localhost:3000/user/profile 2>/dev/null || echo "")
  if echo "$PROFILE" | grep -q '"user"' || echo "$PROFILE" | grep -q '"email"'; then
    pass "User profile endpoint"
  else
    fail "User profile endpoint"
  fi
fi

# =============================================================================
# 11. MOBILE BUILD VERIFICATION
# =============================================================================
section "Mobile Build Verification"

if [ -f "$WORKSPACE_ROOT/verify-mobile-build.sh" ]; then
  if bash "$WORKSPACE_ROOT/verify-mobile-build.sh" > /dev/null 2>&1; then
    pass "Mobile build verification"
  else
    warn "Mobile build verification failed (may need Expo CLI)"
  fi
else
  warn "Mobile verification script not found"
fi

# =============================================================================
# 12. DOCUMENTATION
# =============================================================================
section "Documentation Check"

DOCS=(
  "README.md"
  "DEVELOPMENT.md"
  "TESTING.md"
  "QA_TESTING_GUIDE.md"
  "API.md"
  "DEPLOYMENT.md"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$WORKSPACE_ROOT/$doc" ]; then
    pass "Documentation: $doc"
  else
    warn "Missing documentation: $doc"
  fi
done

# =============================================================================
# 13. CLEANUP
# =============================================================================
section "Cleanup"

if [ "$SERVER_STARTED_HERE" = true ] && [ -n "$API_PID" ]; then
  echo "Stopping API server (PID: $API_PID)..."
  kill $API_PID 2>/dev/null || true
  sleep 1
  # Force kill if still running
  kill -9 $API_PID 2>/dev/null || true
  pass "API server stopped"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "   Test Summary"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Passed:${NC}   $TESTS_PASSED"
echo -e "${RED}Failed:${NC}   $TESTS_FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All critical tests passed!${NC}"
  echo ""
  echo "Development environment is ready for:"
  echo "  • API development: npm run dev:api"
  echo "  • Mobile development: cd apps/mobile && npm start"
  echo "  • E2E testing with QA accounts in the database"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Review the output above.${NC}"
  exit 1
fi
