# QA Test Plan – WithYou

## Happy Path (Manual Smoke Test)
1. Register new user
2. Generate invite code
3. Login as second user
4. Accept invite (pair)
5. Dashboard loads correctly
6. Submit check-in (mood + optional note)
7. View ideas (reconnect mode)
8. Update preferences
9. End pairing → reset to unpaired

## API Edge Cases
- Duplicate email registration → 409 conflict
- Invalid credentials → 401 unauthorized
- Pairing blocked if user already paired
- Private check-ins not visible to partner unless shared
- Expired invites rejected
- Invalid mood value (< 1 or > 5) rejected

## Accessibility Checks
- Screen reader can announce all form labels
- Keyboard navigation: Tab → submit form
- Color contrast >= 4.5:1 (text on bg)
- Focus outline visible on all interactive elements

## Performance Benchmarks
- Auth endpoint: < 200ms
- Dashboard fetch: < 300ms
- App cold start: < 2s

## Manual Testing Checklist
- [ ] API up and healthy
- [ ] Mobile app runs locally
- [ ] Core flows (auth → pair → check-in → ideas)
- [ ] Error states (invalid input, network offline)
- [ ] Empty states (no check-ins yet)
- [ ] Loading states (network activity)
- [ ] Privacy: shared toggles work
- [ ] Settings opens privacy explanation
