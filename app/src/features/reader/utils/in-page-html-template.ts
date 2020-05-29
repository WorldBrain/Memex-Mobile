export const createHtmlStringFromTemplate = (args: {
    css?: string
    js?: string
    title: string
    body: string
}) => `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${args.css ? `<style>${args.css}</style>` : ''}
        </head>
        <body>
            <h1>${args.title}</h1>
            ${args.body}
            ${args.js ? `<script>${args.js}</script>` : ''}
        </body>
    </html>
`
