# WithYou – Build Specification

## Purpose
This document defines the complete build scope for the WithYou application.  
It is the single source of truth for product behavior, technical expectations, and delivery standards.

Audience: Senior full-stack engineers, reviewers, and maintainers.

---

## Product Definition

### Problem
Couples want a private, consent-based space to communicate intentionally and plan connection without surveillance, pressure, or public exposure.

### Guiding Principles
- Privacy-first
- Consent-based pairing
- No emotional interpretation or scoring
- No manipulation or gamification
- Culturally inclusive by default
- Not a replacement for therapy

---

## Release Scope

### Beta v1 (Current)
- Authentication (email/password)
- Secure one-partner pairing (invite/accept/end)
- Relationship state routing
- Mood check-ins (1–5 scale)
- Preferences (activities, budget, energy, availability)
- Intentional ideas (3 at a time)
- Dashboard overview
- Settings + privacy explanation
- Documentation + CI/CD
- Railway deployment

### Beta v1.1 (Therapy-informed enhancement)
- Guided reflection prompts after check-ins (optional)
- Values-based preference fields (optional, private)
- Ideas mode toggle: Reconnect / Repair
- Ethical resource links

### Stage 2 (Planned)
- Weekly relationship reflection (private by default, mutual share)

---

## Non-Goals
- Financial account linking
- Push notifications
- Messaging/chat
- Social/community features
- AI emotional analysis
- Relationship scoring

---

## Definition of Done
A feature is complete only when:
- UI handles loading, empty, and error states
- API validates inputs and enforces auth
- Privacy defaults are respected
- Accessibility minimums met
- Docs updated
