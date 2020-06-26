import { ReadabilityService, createCleanHtmlString } from '.'

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
        const doc: any = service['constructDocumentFromHtml'](html)

        // TODO: what else can we verify here?
        expect(doc.title).toEqual(title)
    })

    // TODO: the `parseDocument` call returns undefined for some reason - Document is constructed prior to that
    it.skip('should be able to clean HTML with our template', async () => {
        const { service } = setup()

        const title = 'Test title'
        const heading = 'Test heading'
        const text = 'lots of content!'
        const js = `console.log('hi!')`

        const expectedHTML = `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <h1>${title}</h1>
                ${text}
            </body>
        </html>
        `

        const html = createSimpleHtml({ title, heading, text, js })
        const urlDesc = service['deriveUrlDescriptor']('https://getmemex.com')
        const doc = service['constructDocumentFromHtml'](html)
        const article = await service['parseDocument'](urlDesc, doc)

        expect(
            createCleanHtmlString({
                body: article.content,
                title: article.title,
            }),
        ).toEqual(expectedHTML)
    })

    it('should be able to convert HTML to XHTML', () => {
        const { service } = setup()

        const before = `
        <html>
            <body>
                <br>
                <p>content</p>
                <b><i>memex</b></i>
                <input type=text disabled />
            </body>
        </html>
        `
        const after = `<html>
            <body>
                <br/>
                <p>content</p>
                <b><i>memex</i></b>
                <input type="text" disabled="disabled"/>
            </body>
        </html>`

        expect(service['convertHtmlToXhtml'](before)).toEqual(after)
    })
})
