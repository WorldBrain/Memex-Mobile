import { descriptorToRange, selectionToDescriptor } from './anchoring'

async function createHighlight() {
    document.body.style.backgroundColor = 'blue'
    const selection = document.getSelection()

    const descriptor = await selectionToDescriptor({ selection })
    console.log('desc:', descriptor)
}

function createAnnotation() {
    document.body.style.backgroundColor = 'red'
}

document.onselectionchange = async function() {
    const selection = document.getSelection()
    postMessageToRN(selection?.toString())
}

function postMessageToRN(message?: string): void {
    return (window as any).ReactNativeWebView.postMessage(message)
}
