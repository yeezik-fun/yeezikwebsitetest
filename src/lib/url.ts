// Link che funzionano sia su Cloudflare (sito alla radice) sia su GitHub Pages (sito in /yeezikwebsitetest/).
export const u = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;
