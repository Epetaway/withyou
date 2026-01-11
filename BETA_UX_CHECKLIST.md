# WithYou — Beta UX Validation Checklist

Use this checklist while testing the beta to verify all workflows behave as expected.

---

## AUTHENTICATION FLOW

- [ ] Can create new account with email + password
- [ ] Can log in with credentials
- [ ] Invalid credentials show error
- [ ] After login, routed to Unpaired Home (if not paired)
- [ ] No onboarding carousel shown
- [ ] Auth messages are neutral (no emotional framing)

---

## UNPAIRED HOME FLOW

### Initial State
- [ ] See message: "You are not paired yet"
- [ ] See two buttons: "Pair with partner" + "Enter invite code"
- [ ] No other content shown

### Invite Flow
- [ ] Tap "Pair with partner"
- [ ] See "Pair Invite" screen
- [ ] Tap "Generate invite code"
- [ ] Code appears (6-character alphanumeric)
- [ ] Can tap "Copy Code" (copies to clipboard)
- [ ] Can tap "Copy Link" (copies `withyou://pair?code=XXX`)
- [ ] See message: "Waiting for your partner to accept"
- [ ] No visibility into whether partner has received/viewed invite
- [ ] Screen shows static waiting state (no polling updates)

### Accept Flow
- [ ] Go back to Unpaired Home
- [ ] Tap "Enter invite code"
- [ ] See text input for invite code
- [ ] Enter valid code
- [ ] Tap "Accept and pair"
- [ ] Success: Both users see Dashboard (pairing confirmed)

---

## DASHBOARD (PAIRED HOME)

### Page Structure
- [ ] See "Dashboard" header + "Welcome back" subtitle
- [ ] See relationship stage card (shows selected stage like "Dating")
- [ ] See "Partner check-in" section

### Partner Check-in Visibility
- [ ] If partner has NOT shared a check-in: See "No shared check-ins yet"
- [ ] If partner HAS shared: See mood icon + date
- [ ] If check-in has note: Note is visible
- [ ] If check-in is private (not shared): NOT visible on dashboard

### Action Buttons
- [ ] Three buttons visible: "New check-in" + "Update preferences" + "Get ideas"
- [ ] All buttons are clickable

---

## CHECK-IN FLOW (CRITICAL TEST)

### Opening
- [ ] Tap "New check-in" from Dashboard
- [ ] See "New check-in" screen
- [ ] See prompt: "How are you feeling today?"

### Mood Selection
- [ ] Five mood options visible: "Very low" → "Very good"
- [ ] Each has an icon (sad, remove, ellipse, happy, heart)
- [ ] Can select any mood
- [ ] Selected mood is visually distinct

### Note Input
- [ ] Optional note field below mood
- [ ] Can type up to 500 characters
- [ ] Field allows multiline text
- [ ] Field is optional (can save without note)

### Share Toggle (CRITICAL)
- [ ] Toggle labeled: "Share with partner"
- [ ] Helper text: "If turned on, your partner can view this check-in."
- [ ] **Toggle is OFF by default** ← CRITICAL
- [ ] Can toggle ON/OFF
- [ ] Label is always visible

### Saving
- [ ] Tap "Save check-in" button
- [ ] Check-in is stored
- [ ] Navigate back to Dashboard
- [ ] Dashboard updates

### Privacy Test
- [ ] Save check-in with share = OFF
- [ ] Partner's dashboard does NOT show this check-in
- [ ] Save check-in with share = ON
- [ ] Partner's dashboard DOES show this check-in

---

## PREFERENCES FLOW

### Opening
- [ ] Tap "Update preferences" from Dashboard
- [ ] See "Preferences" screen with instructions

### Content
- [ ] See activity style options: "Chill" + "Active" + "Surprise"
- [ ] See food types checkboxes
- [ ] See budget level options: "Low" + "Medium" + "High"
- [ ] See energy level slider (1-5)

### Selection
- [ ] Can select activity style (one choice)
- [ ] Can select multiple food types
- [ ] Can select budget level (one choice)
- [ ] Can select energy level
- [ ] Selected items are visually distinct (filled/highlighted)

### Privacy
- [ ] UI says "These are private"
- [ ] Partner cannot see your preferences
- [ ] Preferences are auto-saved when you change them

### Validation
- [ ] Cannot save without all fields filled
- [ ] Error message shown if incomplete

---

## IDEAS FLOW

### Prerequisites
- [ ] Both you and partner have set preferences
- [ ] Dashboard shows "Get ideas" button is clickable

### Opening
- [ ] Tap "Get ideas" from Dashboard
- [ ] See "Ideas" screen

### Content
- [ ] See 3 ideas based on activity style
- [ ] Ideas are neutral (e.g., "Go hiking", "Cook together")
- [ ] No emotional language (no "strengthen your bond")
- [ ] No ranking/scoring (ideas are flat list)

### Actions
- [ ] Can tap "Refresh ideas" to get new suggestions
- [ ] Can tap "Save idea" on each idea
- [ ] Can tap "Share idea" to share externally

### No Partner Visibility
- [ ] Ideas are personal (not shared with partner)
- [ ] Partner can have different set of ideas

---

## SETTINGS FLOW

### Appearance
- [ ] See "Appearance" section
- [ ] Dark mode toggle (Switch component)
- [ ] Can toggle ON/OFF
- [ ] App theme changes when toggled

### Relationship
- [ ] See relationship stage displayed (e.g., "Dating")
- [ ] See "End pairing" button (red/danger variant)

### Account
- [ ] See "Log out" button
- [ ] See navigation options (if any)

---

## END PAIRING FLOW (CRITICAL TEST)

### Initiating
- [ ] Go to Settings
- [ ] Tap "End pairing" button (red button)
- [ ] Confirmation modal appears

### Modal
- [ ] Modal title explains action
- [ ] Modal body explains consequences
- [ ] Two buttons: "End pairing" (red) + "Cancel" (gray)

### Confirming
- [ ] Tap "End pairing"
- [ ] Pairing removed (API call succeeds)
- [ ] Navigated back to Unpaired Home
- [ ] Both users see Unpaired Home (test with partner account)

### Tone
- [ ] Language is neutral (not guilty/shameful)
- [ ] No emotional framing

---

## LOGOUT FLOW

### Process
- [ ] Tap "Log out" in Settings
- [ ] Confirmation modal appears
- [ ] Tap "Log out" to confirm
- [ ] Logged out (JWT cleared)
- [ ] Routed to Login screen

---

## MULTI-DEVICE BEHAVIOR

### Session Management
- [ ] Log in on Device A
- [ ] Log in on Device B with same account
- [ ] Both devices can act independently
- [ ] Check-in on Device A appears on Device B's Dashboard

### Pairing Status
- [ ] End pairing on Device A
- [ ] Device B immediately shows Unpaired Home (next refresh)

---

## PRIVACY BOUNDARY TESTS

### Check-in Privacy
- [ ] User A saves check-in with share = OFF
- [ ] User B's dashboard does NOT show it
- [ ] User A saves check-in with share = ON
- [ ] User B's dashboard DOES show it immediately

### Preferences Privacy
- [ ] User A updates preferences to "Chill" + "Italian food"
- [ ] User B cannot see these preferences anywhere
- [ ] Ideas are generated from both, but not displayed as "from preferences"

### No Scoring
- [ ] No mood streak counter
- [ ] No relationship grade/score
- [ ] No "compatibility percentage"

### No Notifications
- [ ] Partner sharing check-in does not trigger notification (for beta)
- [ ] Partner accepting pairing does not require notification (user checks manually)

---

## ERROR HANDLING

### Invalid Invite Code
- [ ] Try to accept non-existent code
- [ ] See error: "Invite code is not valid"

### Expired Code
- [ ] Generate code, wait 7 days (or mock in dev)
- [ ] Try to accept expired code
- [ ] See error: "This invite code has expired"

### Already Paired
- [ ] User already paired
- [ ] Try to generate new invite
- [ ] See error: "You are already paired"
- [ ] Error suggests ending current pairing first

### No Preferences Set
- [ ] Try to get ideas without setting preferences
- [ ] See error: "Set preferences to get ideas"
- [ ] "Go to preferences" button provided

---

## THERAPIST VALIDATION

- [ ] Pairing requires mutual consent (invite + accept)
- [ ] No coercion or dark patterns
- [ ] Share decision is explicit and reversible (next check-in)
- [ ] Preferences are safe (private expression)
- [ ] Ideas reduce decision fatigue
- [ ] End pairing is easy (one confirmation)
- [ ] No shame/guilt language throughout
- [ ] No emotional manipulation
- [ ] No hidden relationship states

---

## BETA SIGN-OFF

**All checklist items passed?** → App is ready for beta testing.

**Any items failed?** → Document issue + severity + reproduction steps.

---

**Test Date**: _______________  
**Tester Name**: _______________  
**Result**: ☐ PASS ☐ FAIL  
**Notes**: _______________________________________________
