export interface KeepAwakeAPI {
    activate(): void
    deactivate(): void
}

export class KeepAwakeService implements KeepAwakeAPI {
    isActive: boolean = false
    constructor(private deps: { keepAwakeLib?: KeepAwakeAPI }) {}

    activate() {
        this.deps.keepAwakeLib?.activate()
        this.isActive = true
    }

    deactivate() {
        this.deps.keepAwakeLib?.deactivate()
        this.isActive = false
    }
}
