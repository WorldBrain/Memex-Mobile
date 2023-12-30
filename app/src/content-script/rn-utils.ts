import { MessagePoster } from './types'

export const postMessageToRN: MessagePoster = (message) => {
    let serialized
    // Errors need to be serialized in a different way
    if (message.type === 'error') {
        const serializedErr = JSON.stringify(
            message.payload,
            Object.getOwnPropertyNames(message.payload),
        )
        serialized = JSON.stringify({
            type: message.type,
            payload: serializedErr,
        })
    } else {
        serialized = JSON.stringify(message)
    }
    ;(window as any).ReactNativeWebView.postMessage(serialized)
}
