import { ShareExtService } from '.'
import { ShareAPI } from './types'

class MockShareAPI implements ShareAPI {
    constructor(private props: { shareText: string }) {}

    async data() {
        return { value: this.props.shareText, type: '' }
    }

    async close() {
        return
    }
}

function setupTest(opts: { shareText?: string }) {
    const service = new ShareExtService({
        shareAPI: new MockShareAPI({
            shareText: opts.shareText || 'test text',
        }),
    })

    return { service }
}

describe('ShareExtService tests', () => {
    it('should fail on non-URLs if URL is expected', async () => {
        const textA = 'http://test.com'
        const textB = 'Test page'

        const { service: serviceA } = setupTest({ shareText: textA })
        expect(await serviceA.getSharedText()).toEqual(textA)
        expect(await serviceA.getSharedUrl()).toEqual(textA)

        const { service: serviceB } = setupTest({ shareText: textB })
        expect(await serviceB.getSharedText()).toEqual(textB)
        try {
            await serviceB.getSharedUrl()
        } catch (err) {
            expect(err.message).toEqual('URL not received')
        }
    })
})
