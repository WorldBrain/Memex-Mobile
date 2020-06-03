export type MessagePoster = (message?: string) => void

export const postMessageToRN: MessagePoster = message =>
    (window as any).ReactNativeWebView.postMessage(message)
