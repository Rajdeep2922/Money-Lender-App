/**
 * Validate attachment URLs client-side before rendering into href/src.
 */
export function safeAttachmentUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    try {
        const parsed = new URL(rawUrl, window.location.origin);
        if (parsed.username || parsed.password) return null;
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
        if (parsed.hostname === 'res.cloudinary.com') return parsed.href;
        if (parsed.origin === window.location.origin) return parsed.href;
        return null;
    } catch {
        return null;
    }
}
