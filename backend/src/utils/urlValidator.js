/**
 * Validate attachment URLs server-side against an explicit allow-list.
 * Rejects javascript:, data:, credentials in URL, and arbitrary third-party hosts.
 */
function isAllowedAttachmentUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return false;
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return false;
    }

    if (parsed.username || parsed.password) return false;
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') return false;

    if (parsed.hostname === 'res.cloudinary.com') {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
            return false;
        }
        return true;
    }

    const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    return allowedOrigins.includes(parsed.origin);
}

module.exports = { isAllowedAttachmentUrl };
