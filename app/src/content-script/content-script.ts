import { EventEmitter } from 'events'

import { selectionToDescriptor } from './anchoring'
import { setupRemoteFunctions } from './remote-functions'
import { Anchor, MessagePoster } from './types'

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

        this.props.postMessageToRN({
            type: 'selection',
            payload: selection?.toString(),
        })
    }

    private setupAnnotationSteps = (
        type: 'highlight' | 'annotation',
    ) => async () => {
        const selection = this.getDOMSelection()
        const anchor = await this.extractAnchorSelection(selection)

        this.props.postMessageToRN({ type, payload: anchor })

        this.renderHighlight(anchor)
    }

    createAnnotation = this.setupAnnotationSteps('annotation')
    createHighlight = this.setupAnnotationSteps('highlight')

    private async extractAnchorSelection(
        selection: Selection,
    ): Promise<Anchor> {
        const quote = selection.toString()
        const descriptor = await selectionToDescriptor({ selection })

        if (!descriptor) {
            throw new Error(
                `Unable to derive descriptor from text selection: ${quote}`,
            )
        }

        return { quote, descriptor }
    }

    private getDOMSelection(): Selection {
        const selection = document.getSelection()

        if (!selection || selection.type === 'None') {
            throw new Error('Unable to get selection from DOM')
        }

        return selection
    }

    private renderHighlight(anchor: Anchor) {
        // TODO: implement
    }
}
