import { URL } from 'url'
import normalizeUrl from 'normalize-url'

import { defaultNormalizationOpts } from './defaults'
import { NormalizationOptions } from './types'
import queryParamRules from './query-string-normalization-rules'

export const PROTOCOL_PATTERN = /^\w+:\/\//

/**
 * Applies our custom query-param normalization rules for specific sites, removing all
 * but specific params from the query string.
 */
function applyQueryParamsRules(url: string): string {
    const parsed = new URL(url)
    const rulesObj = queryParamRules.get(parsed.hostname)

    // Base case; domain doesn't have any special normalization rules
    if (!rulesObj) {
        return url
    }

    // Remove all query params that don't appear in special rules
    const rulesSet = new Set(rulesObj.rules)
    const rulesType = rulesObj.type
    for (const param of [...parsed.searchParams.keys()]) {
        const shouldDelete =
            rulesType === 'keep' ? !rulesSet.has(param) : rulesSet.has(param)
        if (shouldDelete) {
            parsed.searchParams.delete(param)
        }
    }
    return parsed.href
}

export default function normalize(
    url: string,
    customOpts: NormalizationOptions = {},
): string {
    let normalized

    try {
        normalized = normalizeUrl(url, {
            ...defaultNormalizationOpts,
            ...customOpts,
        })
    } catch (err) {
        normalized = url
    }

    if (!customOpts.skipQueryRules) {
        normalized = applyQueryParamsRules(normalized)
    }

    // Remove the protocol; we don't need/want it for IDs
    return !customOpts.skipProtocolTrim
        ? normalized.replace(PROTOCOL_PATTERN, '')
        : normalized
}
