import { NormalizationOptions } from './types'

export const defaultNormalizationOpts: NormalizationOptions = {
    normalizeProtocol: true, // Prepend `http://` if URL is protocol-relative
    stripHash: true, // Remove trailing hash fragment
    stripWWW: true, // Remove any leading `www.`
    removeTrailingSlash: true,
    removeQueryParameters: [/^utm_\w+/i], // Remove each of these query params (default for now)
    removeDirectoryIndex: [/^(default|index)\.\w{2,4}$/], // Remove things like tralining `/index.js` or `/default.php`
}
