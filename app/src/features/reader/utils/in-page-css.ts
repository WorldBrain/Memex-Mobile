import { HIGHLIGHT_CLASS } from 'src/content-script/constants'

import { theme } from 'src/ui/components/theme/theme'

export const inPageCSS = `
body {
    -webkit-touch-callout: none;
    padding: 40px 20px 0 20px;
}

h1 {
	font-size: 2rem;
	margin-top: 40px;
}

.${HIGHLIGHT_CLASS} {
    background: ${theme.colors.backgroundHighlight};
}
`
