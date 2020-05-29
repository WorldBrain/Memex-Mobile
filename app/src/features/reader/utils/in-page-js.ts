// TODO: bring over our highlight extraction code from memex
export const inPageJS = `
    document.onselectionchange = function() {
        selection = document.getSelection()

        window.ReactNativeWebView.postMessage(selection)
    }
`
