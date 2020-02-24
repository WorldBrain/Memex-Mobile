export interface FakeNavigationRequest {
    type: 'navigate'
    target: string
    params?: FakeNavigationParams
}

export interface FakeNavigationParams {
    [key: string]: any
}

export class FakeNavigation {
    private requests: FakeNavigationRequest[] = []

    constructor(private params?: FakeNavigationParams) {}

    navigate(target: string, params?: FakeNavigationParams) {
        this.requests.push({ type: 'navigate', target, params })
    }

    popRequests(): FakeNavigationRequest[] {
        const requests = this.requests
        this.requests = []
        return requests
    }

    getParam(name: string, defaultVal?: any) {
        const value = this.params ? this.params[name] : null
        return value ?? defaultVal ?? null
    }
}
