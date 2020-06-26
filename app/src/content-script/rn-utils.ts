import { MessagePoster } from './types'

export const postMessageToRN: MessagePoster = message => {
    const serialized = JSON.stringify(message)
    ;(window as any).ReactNativeWebView.postMessage(serialized)
}
