import { WebViewContentScript } from './content-script'
import { postMessageToRN } from './rn-utils'
import { HIGHLIGHT_CLASS } from './constants'
import { theme } from 'src/ui/components/theme/theme'

const contentScript = new WebViewContentScript({ postMessageToRN })

// TODO: This is only needed while we want to load the entire page in the WebView
//  i.e., when we move to full reader mode, we don't need this anymore (it's part of the HTML we give to the WebView)
contentScript.addStyleElementToHead(`
    .${HIGHLIGHT_CLASS} {
        background: #e6f1ff;
    }
`)

document.onselectionchange = contentScript.handleSelectionChange
    ; (window as any)['remoteFnEvents'] = contentScript.remoteFnEvents
