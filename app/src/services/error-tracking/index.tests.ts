export class MockSentry {
    initArgs: any
    captured: any[] = []

    init(args: any) {
        this.initArgs = args
    }

    captureException(err: any) {
        this.captured.push(err)
    }
}
