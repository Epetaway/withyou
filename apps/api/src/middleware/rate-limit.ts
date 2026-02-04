import rateLimit from "express-rate-limit";

// General API rate limit: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints: stricter limit - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

// Invite endpoints: 10 requests per hour
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many invite requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// QA endpoints: Very strict - 5 requests per hour
export const qaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many QA requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Places endpoints: 30 requests per 15 minutes
export const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many place lookup requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
