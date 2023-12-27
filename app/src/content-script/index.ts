import { WebViewContentScript } from './content-script'
import { postMessageToRN } from './rn-utils'
import { HIGHLIGHT_CLASS } from './constants'

const contentScript = new WebViewContentScript({ postMessageToRN })

// TODO: This is only needed while we want to load the entire page in the WebView
//  i.e., when we move to full reader mode, we don't need this anymore (it's part of the HTML we give to the WebView)
contentScript.addStyleElementToHead(`
    .${HIGHLIGHT_CLASS} {
        background: #ffff3c66;
    }
`)

document.onselectionchange = contentScript.handleSelectionChange
;(window as any)['remoteFnEvents'] = contentScript.remoteFnEvents
