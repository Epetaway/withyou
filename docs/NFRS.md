# Non-Functional Requirements

## Security
- bcrypt password hashing (10+ rounds)
- JWT authentication (HS256)
- Rate limiting: 100 req/min per IP
- Input validation via shared Zod schemas
- CORS: Allow mobile domain only
- HTTPS enforced in production

## Privacy
- Private by default (no data shared without explicit action)
- Mutual sharing only (both partners must agree)
- No analytics on emotional/relational content
- Data deletion on account termination

## Accessibility
- 44px minimum tap targets (mobile)
- Input labels required (no placeholder-only)
- Focus states visible (keyboard navigation)
- No color-only meaning (icons + text)
- WCAG 2.1 Level AA target

## Performance
- API response time < 300ms (p95)
- Mobile app startup < 2s (p95)
- Graceful offline handling (future)
- No blocking network calls on app load

## Reliability
- API uptime 99.5%
- Database backups daily
- Error logging + monitoring
- Graceful degradation on service failure
