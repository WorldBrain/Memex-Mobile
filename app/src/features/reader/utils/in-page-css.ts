import { HIGHLIGHT_CLASS } from 'src/content-script/constants'

export const inPageCSS = `
body {
    -webkit-touch-callout: none;
    padding: 0 20px;
}

h1 {
	font-size: 2rem;
	margin-top: 40px;
}

.${HIGHLIGHT_CLASS} {
    background: #00d88b;
}
`
