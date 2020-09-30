export interface FakeNavigationRequest {
    type: 'navigate' | 'goBack'
    target?: string
    params?: FakeNavigationParams
}

export interface FakeNavigationParams {
    [key: string]: any
}

export class FakeNavigation {
    private requests: FakeNavigationRequest[] = []

    constructor(public params?: FakeNavigationParams) {}

    navigate = (target: string, params?: FakeNavigationParams) => {
        this.requests.push({ type: 'navigate', target, params })
    }

    goBack = (): void => {
        this.requests.push({ type: 'goBack' })
    }

    popRequests = (): FakeNavigationRequest[] => {
        const requests = this.requests
        this.requests = []
        return requests
    }
}

export class FakeRoute {
    constructor(public params: FakeNavigationParams = {}) {}
}
