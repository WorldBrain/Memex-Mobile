import { Options } from 'normalize-url'

export interface NormalizationRule {
    /** A list of query params to address as part of the defined rule. */
    rules: string[]
    /** Denotes whether to `keep` or `remove` those query params defined in `rules`. */
    type: 'keep' | 'remove'
}

export interface NormalizationOptions extends Options {
    skipQueryRules?: boolean
    skipProtocolTrim?: boolean
}
