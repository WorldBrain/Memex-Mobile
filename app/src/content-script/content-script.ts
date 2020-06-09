import { EventEmitter } from 'events'
import {
    selectionToDescriptor,
    descriptorToRange,
    markRange,
} from '@worldbrain/memex-common/lib/annotations'

import { setupRemoteFunctions } from './remote-functions'
import { Anchor, MessagePoster } from './types'
import { HIGHLIGHT_CLASS } from './constants'

export interface Props {
    document?: Document
    postMessageToRN: MessagePoster
}

export class WebViewContentScript {
    remoteFnEvents: EventEmitter

    constructor(private props: Props) {
        this.remoteFnEvents = setupRemoteFunctions({
            createHighlight: this.createHighlight,
            createAnnotation: this.createAnnotation,
            renderHighlights: this.renderHighlights,
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
        // NOTE: There seems to be a bug with the `Selection.toString()` in RN WebView where
        //   it often returns the empty string. Instead we'll try to derive it from the selectors
        // const quote = selection.toString()
        const descriptor = await selectionToDescriptor({ selection })

        if (!descriptor) {
            throw new Error(`Unable to derive descriptor from text selection`)
        }

        return { quote: grabQuoteFromSelectors(descriptor.content), descriptor }
    }

    private getDOMSelection(): Selection {
        const selection = document.getSelection()

        if (!selection || selection.type === 'None') {
            throw new Error('Unable to get selection from DOM')
        }

        return selection
    }

    renderHighlights = async (anchors: Anchor[]) =>
        anchors.forEach(anchor => this.renderHighlight(anchor))

    private async renderHighlight({ descriptor }: Anchor) {
        const range = await descriptorToRange({ descriptor })
        markRange({ range, cssClass: HIGHLIGHT_CLASS })
    }
}

function grabQuoteFromSelectors(selectors: any[]): string {
    const textQuoteSelector = selectors.find(
        selector => selector.type === 'TextQuoteSelector',
    )

    if (!textQuoteSelector) {
        throw new Error('No text quote selector to grab quote from')
    }

    return textQuoteSelector.exact
}
