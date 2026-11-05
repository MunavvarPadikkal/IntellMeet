"use strict";

/**
 * Checks if an incoming Origin is permitted according to CLIENT_URL.
 * Supports:
 * - Exact matches (case-insensitive, trailing slashes trimmed)
 * - Comma-separated allowed origins (e.g. "https://app.vercel.app,http://localhost:5173")
 * - Vercel preview deployments (e.g. "https://intellmeet-*.vercel.app")
 *
 * @param {string|undefined} origin - Origin header sent by browser.
 * @param {string|undefined} clientUrl - Configured CLIENT_URL from env.
 * @returns {boolean}
 */
function isAllowedOrigin(origin, clientUrl) {
  if (!origin) {
    return true;
  }
  if (!clientUrl) {
    return false;
  }

  const cleanOrigin = origin.replace(/\/+$/, "").toLowerCase();
  const allowedList = clientUrl
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, "").toLowerCase())
    .filter(Boolean);

  if (allowedList.includes(cleanOrigin)) {
    return true;
  }

  for (const allowed of allowedList) {
    try {
      const allowedUrl = new URL(allowed);
      const originUrl = new URL(cleanOrigin);
      if (
        allowedUrl.hostname.endsWith(".vercel.app") &&
        originUrl.hostname.endsWith(".vercel.app")
      ) {
        const baseProject = allowedUrl.hostname.split(".")[0].split("-")[0];
        if (originUrl.hostname.startsWith(baseProject)) {
          return true;
        }
      }
    } catch (_unused) {
      // Ignore invalid URLs in list
    }
  }

  return false;
}

module.exports = { isAllowedOrigin };

