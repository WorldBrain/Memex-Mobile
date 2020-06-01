export const REMOTE_FUNCTIONS = {
    createHighlight: 'createHighlight()',
    createAnnotation: 'createAnnotation()',
}

// TODO: bring over our highlight extraction code from memex
export const inPageJS = `
    function ${REMOTE_FUNCTIONS.createHighlight} {
        document.body.style.backgroundColor = 'blue';
        const selection = document.getSelection()
    }

    function ${REMOTE_FUNCTIONS.createAnnotation} {
        document.body.style.backgroundColor = 'red';
    }

    document.onselectionchange = function() {
        const selection = document.getSelection()

        window.ReactNativeWebView.postMessage(selection)
    }
`
