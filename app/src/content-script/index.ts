import { descriptorToRange, selectionToDescriptor } from './anchoring'

async function createHighlight() {
    document.body.style.backgroundColor = 'blue'
    const selection = document.getSelection()
    const quote = selection.toString()

    const descriptor = await selectionToDescriptor({ selection })
    console.log('desc:', descriptor)
}

function createAnnotation() {
    document.body.style.backgroundColor = 'red'
}

document.onselectionchange = async function() {
    const selection = document.getSelection()
    window.ReactNativeWebView.postMessage(selection)
    const descriptor = await selectionToDescriptor({ selection })

    window.ReactNativeWebView.postMessage(descriptor?.content)
    window.ReactNativeWebView.postMessage(descriptor?.strategy)
}
