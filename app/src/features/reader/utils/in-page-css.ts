import { HIGHLIGHT_CLASS } from 'src/content-script/constants'

export const inPageCSS = `
body {
    -webkit-touch-callout: none;
}

.${HIGHLIGHT_CLASS} {
    background: #00d88b;
}
`
