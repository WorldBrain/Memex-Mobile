import { PageFetcherService } from '.'

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

describe('page fetcher service tests', () => {
    function setup() {
        const service = new PageFetcherService()
        return { service }
    }

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

    it('should be able to convert HTML to XHTML', () => {
        const { service } = setup()

        const before = `
        <html>
            <body>
                <br>
                <p>content</p>
                <b><i>memex</i></b>
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
