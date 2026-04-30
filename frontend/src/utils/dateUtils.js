/**
 * Date utility — human-readable relative time (no external dependencies)
 */

/**
 * Returns "X min ago", "2 hours ago", "3 days ago", etc.
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDistanceToNow = (date) => {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = Math.max(0, now - then); // ms

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
