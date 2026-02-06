# Mobile App Integration - Implementation Guide

**Status**: Ready to Start  
**Backend API**: ✅ Complete and Tested  
**Database**: ✅ Fully Populated with Test Data

---

## Quick Start

The backend is fully configured and running. To test the mobile app integration:

1. **API Status**: Running on `localhost:3000` ✅
2. **Test Accounts Available**:
   - `dev1@example.com` / `password123` (has Apple Watch)
   - `dev2@example.com` / `password123` (has Google Watch)
3. **Two-Person Challenge**: Pre-created between dev1 and dev2
4. **One Week of Test Data**: Health metrics ready for display

---

## Phase 1: Create Challenge Screens

### 1. Activity Challenges List Screen
**File**: `apps/mobile/src/screens/paired/ActivityChallengesScreen.tsx`

**Display**:
- List of all challenges (pending + active)
- Challenge card showing:
  - Title and description
  - Challenge type badge (Steps, Heart Rate, etc.)
  - Target value and duration
  - Status (pending/active/completed)
  - Current user's progress %
  - Partner name and their progress %

**Actions**:
- Tap to view details
- "Accept Challenge" button (if pending)
- "Decline Challenge" button (if pending)
- "View Leaderboard" button (if active)

**API Integration**:
```typescript
// GET /activity-challenges
useEffect(() => {
  fetch(`${API_BASE}/activity-challenges`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => setChallenges(data.challenges))
}, [token])
```

### 2. Challenge Details & Leaderboard
**File**: `apps/mobile/src/screens/paired/ChallengeDetailsScreen.tsx`

**Display**:
- Full challenge information
- Split view:
  - **Left**: Challenge details (target, duration, days remaining)
  - **Right**: Live leaderboard
    - Ranking #1, #2 with badges
    - Percentage complete for each user
    - Last update timestamp

**Real-time Updates**:
```typescript
useEffect(() => {
  const socket = io(API_BASE, { auth: { token } })
  
  socket.on('challenge:updated', (data) => {
    // Update challenge progress and leaderboard
    setChallenge(prev => ({ ...prev, ...data }))
  })
  
  return () => socket.disconnect()
}, [token])
```

---

## Phase 2: Wearable Device Management

### 3. Wearable Devices Screen
**File**: `apps/mobile/src/screens/paired/WearableDevicesScreen.tsx`

**Display**:
- List of connected devices showing:
  - Device name (e.g., "Apple Watch Series 8")
  - Device type with icon
  - Status: "Active" / "Inactive"
  - Last synced time
  - Next sync scheduled

**Actions**:
- "Connect New Device" button
- "Disconnect" button (with confirmation)
- "Sync Now" button for manual refresh
- "View Metrics" button to see recent data

**API Integration**:
```typescript
// GET /wearables/devices
const loadDevices = async () => {
  const response = await fetch(`${API_BASE}/wearables/devices`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const { devices } = await response.json()
  setWearables(devices)
}

// DELETE /wearables/devices/:id
const disconnectDevice = async (deviceId) => {
  await fetch(`${API_BASE}/wearables/devices/${deviceId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  loadDevices()
}
```

### 4. Connect Device Modal
**File**: `apps/mobile/src/modals/ConnectWearableModal.tsx`

**Flow**:
1. Select device type (Apple Watch, Google Watch, Apple Health, Google Fit)
2. Enter device name (optional)
3. Initiate OAuth flow
4. Return to app with access token
5. Confirm device connection

**OAuth Implementation**:
```typescript
const connectAppleWatch = async () => {
  // 1. Launch Apple Health OAuth
  const authCode = await launchAppleHealthAuth()
  
  // 2. Send to API
  const response = await fetch(`${API_BASE}/wearables/devices/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      deviceType: 'apple_watch',
      deviceName: 'My Apple Watch',
      authCode
    })
  })
  
  const { device } = await response.json()
  setConnectedDevice(device)
}
```

---

## Phase 3: Health Metrics Display

### 5. Health Metrics Screen
**File**: `apps/mobile/src/screens/paired/HealthMetricsScreen.tsx`

**Display** (for last 7 days):
- Daily cards showing:
  - Date
  - Steps with progress bar (goal: 10,000)
  - Heart rate (BPM)
  - Active minutes
  - Calories burned
  - Sleep duration

**Functionality**:
- Swipe between dates
- Filter by metric type
- Compare with partner's metrics
- View trends over time

**API Integration**:
```typescript
// GET /wearables/metrics?startDate=...&endDate=...
const loadMetrics = async (startDate, endDate) => {
  const response = await fetch(
    `${API_BASE}/wearables/metrics?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  )
  const { metrics } = await response.json()
  setMetrics(metrics)
}
```

---

## Phase 4: Create Challenge Flow

### 6. Create Challenge Modal
**File**: `apps/mobile/src/modals/CreateChallengeModal.tsx`

**UI Elements**:
1. Challenge type selector (radio buttons)
   - Steps
   - Heart Rate
   - Combined
   - Daily Active Minutes

2. Challenge details
   - Title input
   - Description input
   - Target value input (e.g., "10000" for steps)
   - Duration slider (1-90 days)
   - Reward/stakes input (optional)

3. Send button

**API Integration**:
```typescript
const sendChallenge = async (challengeData) => {
  const response = await fetch(
    `${API_BASE}/activity-challenges/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        challengeType: challengeData.type,
        title: challengeData.title,
        targetValue: challengeData.target,
        duration: challengeData.duration,
        reward: challengeData.reward
      })
    }
  )
  
  const { challenge } = await response.json()
  // Show success message
  // Close modal
  // Refresh challenges list
}
```

---

## Phase 5: Navigation Updates

### 7. Update Paired Navigation
**File**: `apps/mobile/src/navigation/PairedTabs.tsx`

**Add New Tabs**:
```typescript
<Tab.Screen 
  name="Challenges"
  component={ActivityChallengesScreen}
  options={{
    tabBarLabel: 'Challenges',
    tabBarIcon: ({ color }) => (
      <MaterialCommunityIcons name="trophy" color={color} size={24} />
    )
  }}
/>

<Tab.Screen 
  name="Wearables"
  component={WearableDevicesScreen}
  options={{
    tabBarLabel: 'Wearables',
    tabBarIcon: ({ color }) => (
      <MaterialCommunityIcons name="watch" color={color} size={24} />
    )
  }}
/>

<Tab.Screen 
  name="Metrics"
  component={HealthMetricsScreen}
  options={{
    tabBarLabel: 'Metrics',
    tabBarIcon: ({ color }) => (
      <MaterialCommunityIcons name="heart-pulse" color={color} size={24} />
    )
  }}
/>
```

---

## File Structure Reference

```
apps/mobile/src/
├── screens/
│   └── paired/
│       ├── ActivityChallengesScreen.tsx [NEW]
│       ├── ChallengeDetailsScreen.tsx [NEW]
│       ├── WearableDevicesScreen.tsx [NEW]
│       ├── HealthMetricsScreen.tsx [NEW]
│       └── ... existing screens
├── modals/
│   ├── ConnectWearableModal.tsx [NEW]
│   ├── CreateChallengeModal.tsx [NEW]
│   └── ... existing modals
├── components/
│   ├── ChallengeCard.tsx [NEW]
│   ├── LeaderboardView.tsx [NEW]
│   ├── MetricCard.tsx [NEW]
│   ├── DeviceCard.tsx [NEW]
│   └── ... existing components
├── hooks/
│   ├── useChallenges.ts [NEW]
│   ├── useWearables.ts [NEW]
│   └── ... existing hooks
├── navigation/
│   ├── PairedTabs.tsx [UPDATED]
│   └── ... other navigation files
└── types/
    └── index.ts [UPDATED with new types]
```

---

## Custom Hooks to Create

### Hook 1: useChallenges
```typescript
// apps/mobile/src/hooks/useChallenges.ts
export const useChallenges = (token: string) => {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/activity-challenges`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        setChallenges(data.challenges)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [token])

  return { challenges, loading, error }
}
```

### Hook 2: useWearables
```typescript
// apps/mobile/src/hooks/useWearables.ts
export const useWearables = (token: string) => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  // Similar implementation to useChallenges
  // GET /wearables/devices endpoint
  
  const disconnectDevice = async (deviceId) => {
    await fetch(
      `${API_BASE}/wearables/devices/${deviceId}`,
      { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
    )
    // Reload devices
  }

  return { devices, loading, disconnectDevice }
}
```

### Hook 3: useHealthMetrics
```typescript
// apps/mobile/src/hooks/useHealthMetrics.ts
export const useHealthMetrics = (token: string, days = 7) => {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const loadMetrics = async () => {
      const response = await fetch(
        `${API_BASE}/wearables/metrics?startDate=${startDate.toISOString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      const data = await response.json()
      setMetrics(data.metrics)
      setLoading(false)
    }

    loadMetrics()
  }, [token, days])

  return { metrics, loading }
}
```

---

## Testing Procedures

### Manual Testing Checklist

- [ ] Can connect an Apple Watch device
- [ ] Can connect a Google Watch device
- [ ] Device list shows all connected devices
- [ ] Can disconnect a device
- [ ] Health metrics display correctly
- [ ] Can create a challenge
- [ ] Challenge appears in partner's challenge list
- [ ] Can accept a pending challenge
- [ ] Can view leaderboard (current user highlighted)
- [ ] Leaderboard updates when metrics are synced
- [ ] WebSocket updates work in real-time

### API Test Data Available

In development, you can use:
```
User 1: dev1@example.com / password123
  - Connected: Apple Watch Series 8
  - Progress: 60,000 steps (6 days)
  - Position: 2nd place

User 2: dev2@example.com / password123
  - Connected: Galaxy Watch 6
  - Progress: 75,000 steps (7 days)
  - Position: 1st place

Challenge: "Daily Steps Challenge"
  - Type: steps
  - Target: 10,000/day
  - Duration: 30 days
  - Status: active
```

---

## UI Design Recommendations

### Color Scheme
- **Primary Challenge Color**: Green (completion/active)
- **Leaderboard 1st Place**: Gold (#FFD700)
- **Leaderboard 2nd Place**: Silver (#C0C0C0)
- **Stats**: Blue (steps), Red (heart rate), Purple (calories)

### Icons (via MaterialCommunityIcons)
- Challenge: `trophy`
- Wearable: `watch`, `heart-pulse`
- Sync: `sync`
- Steps: `walk`
- Heart Rate: `heart-pulse`
- Calories: `fire`
- Sleep: `sleep`

### Performance Tips
- Lazy load challenge details
- Cache device list (refresh on mount)
- Paginate metrics if showing >30 days
- Use React.memo for list items
- Implement virtual scrolling for long lists

---

## Next Major Steps (Prioritized)

1. **Create Base Screens** (Est. 4-6 hours)
   - ActivityChallengesScreen
   - WearableDevicesScreen
   - HealthMetricsScreen

2. **Implement OAuth Flows** (Est. 3-4 hours)
   - Apple HealthKit integration
   - Google Fit integration
   - Token handling

3. **Add Real-time Features** (Est. 2-3 hours)
   - WebSocket listeners
   - Auto-refresh leaderboards
   - Live metric updates

4. **Create Supporting Components** (Est. 2-3 hours)
   - ChallengeCard
   - LeaderboardView
   - MetricCard

5. **Styling & Theming** (Est. 2-3 hours)
   - Apply consistent theme
   - Create reusable styled components
   - Test responsive design

**Estimated Total**: 13-19 hours of development

---

## Success Criteria

✅ When complete, the mobile app will:
- Display all user challenges with up-to-date leaderboards
- Show connected wearable devices
- Display 7+ days of health metrics
- Allow users to connect/disconnect devices
- Allow users to create and send challenges to partner
- Update in real-time via WebSocket when partner syncs data
- Provide meaningful progress visualization

---

## Questions?

Refer to these files for API details:
1. [WEARABLE_INTEGRATION_COMPLETE.md](./WEARABLE_INTEGRATION_COMPLETE.md) - Full API reference
2. [API.md](./API.md) - General API contract
3. `/apps/api/src/routes/wearables.ts` - Exact endpoint implementations
4. `/apps/api/src/routes/activity-challenges.ts` - Challenge endpoint implementations

The backend is production-ready and fully tested. Happy coding! 🚀
