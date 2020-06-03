import { EventEmitter } from 'events'

import { selectionToDescriptor } from './anchoring'
import { setupRemoteFunctions } from './remote-functions'
import { MessagePoster } from './utils'

export interface Props {
    document?: Document
    postMessageToRN: MessagePoster
}

export class WebViewContentScript {
    remoteFnEvents: EventEmitter

    constructor(private props: Props) {
        this.remoteFnEvents = setupRemoteFunctions({
            createAnnotation: this.createAnnotation,
            createHighlight: this.createHighlight,
        })
    }

    private get document(): Document {
        return this.props.document ?? document
    }

    handleSelectionChange = () => {
        const selection = this.document.getSelection()

        this.props.postMessageToRN(selection?.toString())
    }

    private createAnnotation = async () => {
        this.document.body.style.backgroundColor = 'red'
    }

    private createHighlight = async () => {
        this.document.body.style.backgroundColor = 'blue'
        const selection = document.getSelection()

        const descriptor = await selectionToDescriptor({ selection })
        const p = this.document.createElement('p')
        p.innerHTML = descriptor?.content

        this.document.body.appendChild(p)
    }
}
