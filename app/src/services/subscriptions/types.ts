export interface SubscriptionsService {
    getCurrentUserClaims(): Promise<Claims | null>
    getCheckoutLink(options: SubscriptionCheckoutOptions): Promise<string>
    getManageLink(options?: SubscriptionCheckoutOptions): Promise<string>
}

export interface Claims {
    subscriptions: SubscriptionMap
    features: FeatureMap
    lastSubscribed: number | null
}
export interface SubscriptionMap {
    [key: string]: { expiry: number }
}
export interface FeatureMap {
    [key: string]: { expiry: number }
}
export type UserFeatures = 'backup' | 'sync'
export type UserPlans =
    | 'free'
    | 'pro-1-device'
    | 'pro-2-devices'
    | 'pro-3-devices'
    | 'pro-4-devices'
    | 'pro-1-device-yrl'
    | 'pro-2-devices-yrl'
    | 'pro-3-devices-yrl'
    | 'pro-4-devices-yrl'

export interface SubscriptionCheckoutOptions {
    planId: string
}
