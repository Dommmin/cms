export function sanitizeUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
            return 'about:blank';
        }
        return url;
    } catch {
        return url;
    }
}

const SUPPORTED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'sms:']);

export function validateUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        return SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol);
    } catch {
        return false;
    }
}

export const MATCHERS = [
    (text: string): null | { index: number; length: number; text: string; url: string } => {
        const URL_REGEX =
            /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
        const match = URL_REGEX.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
        };
    },
    (text: string): null | { index: number; length: number; text: string; url: string } => {
        const EMAIL_REGEX =
            /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        const match = EMAIL_REGEX.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: `mailto:${fullMatch}`,
        };
    },
];
