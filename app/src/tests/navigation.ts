export interface FakeNavigationRequest {
    type: 'navigate'
    target: string
}
export class FakeNavigation {
    private requests: FakeNavigationRequest[] = []

    navigate(target: string) {
        this.requests.push({ type: 'navigate', target })
    }

    popRequests() {
        const requests = this.requests
        this.requests = []
        return requests
    }
}
