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

// Allow basic stack trace in `unhandledrejection` event. See https://stackoverflow.com/a/73956189
interface FakePromise extends Promise<any> {
    stack?: string
}
;(window as any).Promise = class FAKEPROMISE extends Promise<any>
    implements FakePromise {
    stack?: string

    constructor(exec: any) {
        super(exec)
        this.stack = new Error().stack
    }
}

// Set up uncaught error handlers to send them back up to RN JS
window.addEventListener('unhandledrejection', (event) => {
    const error = new Error(event.reason)
    error.stack = (event.promise as FakePromise).stack
    postMessageToRN({ type: 'error', payload: error })
})
window.onerror = (event, source, lineno, colno, err) => {
    const errorMsg = `source file: ${source}\nline #: ${lineno}\ncolumn # ${colno}`
    const error =
        err instanceof Error
            ? err
            : new Error(typeof event === 'string' ? event : errorMsg)
    postMessageToRN({ type: 'error', payload: error })
}
;(window as any)['remoteFnEvents'] = contentScript.remoteFnEvents
