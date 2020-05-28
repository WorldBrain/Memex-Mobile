import { ReadabilityService } from '.'

const testUrlA = 'https://getmemex.com'
const testUrlB = 'https://getmemex.com/test/route'
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
        const service = new ReadabilityService({})
        return { service }
    }

    it('should be able to derive URL descriptor for Readability from URL', async () => {
        const { service } = setup()

        expect(service['deriveUrlDescriptor'](testUrlA)).toEqual({
            spec: testUrlA,
            host: 'getmemex.com',
            scheme: 'https',
            prePath: `https://getmemex.com`,
            pathBase: `https://getmemex.com`,
        })

        expect(service['deriveUrlDescriptor'](testUrlB)).toEqual({
            spec: testUrlB,
            host: 'getmemex.com',
            scheme: 'https',
            prePath: `https://getmemex.com`,
            pathBase: `https://getmemex.com/test/`,
        })
    })

    it('should be able to create DOM from HTML', async () => {
        const { service } = setup()
        const title = 'Test title'
        const heading = 'Test heading'
        const text = 'lots of content!'
        const js = `console.log('hi!')`

        const html = createSimpleHtml({ title, heading, text, js })
        const doc: any = service['constructDocFromHtml'](html)

        // TODO: what else can we verify here?
        expect(doc.title).toEqual(title)
    })
})
