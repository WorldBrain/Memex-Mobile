import { ReadabilityService } from '.'

const testUrlA = 'https://getmemex.com/'
const testUrlB = 'https://getmemex.com/test/route/'

const createSimpleHtml = (args: {
    title: string
    heading: string
    text: string
    js?: string
}) => `
    <html>
        <head>
            <title>${args.title}</title>
        </head>
        <body>
            <h1>${args.heading}</h1>
            <p>${args.text}</p>
            ${args.js ? `<script>${args.js}</script>` : ''}
        </body>
    </html>
`

describe('readability service tests', () => {
    function setup() {
        const service = new ReadabilityService({ pageFetcher: {} as any })
        return { service }
    }

    it('should be able to derive URL descriptor for Readability from URL', async () => {
        const { service } = setup()

        expect(service['deriveUrlDescriptor'](testUrlA)).toEqual({
            spec: testUrlA,
            host: 'getmemex.com',
            scheme: 'https',
            prePath: `https://getmemex.com`,
            pathBase: testUrlA,
        })

        expect(service['deriveUrlDescriptor'](testUrlB)).toEqual({
            spec: testUrlB,
            host: 'getmemex.com',
            scheme: 'https',
            prePath: `https://getmemex.com`,
            pathBase: testUrlB,
        })
    })
})
