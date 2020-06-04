import { WebViewContentScript } from './content-script'
import { postMessageToRN } from './rn-utils'

const contentScript = new WebViewContentScript({ postMessageToRN })

document.onselectionchange = contentScript.handleSelectionChange
;(window as any)['remoteFnEvents'] = contentScript.remoteFnEvents
