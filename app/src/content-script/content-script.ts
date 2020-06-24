import { EventEmitter } from 'events'
import {
    selectionToDescriptor,
    descriptorToRange,
    markRange,
} from '@worldbrain/memex-common/lib/annotations'

import { setupRemoteFunctions } from './remote-functions'
import { Anchor, MessagePoster, Highlight } from './types'
import { HIGHLIGHT_CLASS } from './constants'

export interface Props {
    window?: Window
    postMessageToRN: MessagePoster
}

export class WebViewContentScript {
    remoteFnEvents: EventEmitter

    constructor(private props: Props) {
        this.remoteFnEvents = setupRemoteFunctions({
            createHighlight: this.createHighlight,
            createAnnotation: this.createAnnotation,
            renderHighlights: this.renderHighlights,
            renderHighlight: this.renderHighlight,
            setScrollPercent: this.setScrollPercent,
        })
    }

    private get document(): Document {
        return this.window.document
    }

    private get window(): Window {
        return this.props.window ?? window
    }

    addStyleElementToHead(css: string) {
        const style = this.document.createElement('style')
        style.innerHTML = css
        this.document.head.appendChild(style)
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
        const selection = this.document.getSelection()

        if (!selection || selection.type === 'None') {
            throw new Error('Unable to get selection from DOM')
        }

        return selection
    }

    renderHighlights = async (highlights: Highlight[]) => {
        for (const highlight of highlights) {
            await this.renderHighlight(highlight)
        }
    }

    renderHighlight = async ({ anchor: { descriptor }, url }: Highlight) => {
        const range = await descriptorToRange({ descriptor })
        markRange({ range, cssClass: HIGHLIGHT_CLASS })

        this.attachEventListenersToNewHighlights(url)
    }

    private getScrollHeight = (el: Element) => el.scrollHeight - el.clientHeight

    calcAndSendScrollPercent = async () => {
        const html = this.document.body.parentNode as Element

        const percent =
            (this.document.body.scrollTop || html.scrollTop) /
            this.getScrollHeight(html)
        this.props.postMessageToRN({ type: 'scrollPercent', payload: percent })
    }

    setScrollPercent = async (percent: number) => {
        const html = this.document.body.parentNode as Element

        this.window.scrollTo(0, percent * this.getScrollHeight(html))
    }

    private attachEventListenersToNewHighlights(highlightUrl: string) {
        // The only highlight without an annotation data att should be the newly created one
        const newHighlights = this.document.querySelectorAll<HTMLElement>(
            `.${HIGHLIGHT_CLASS}:not([data-annotation])`,
        )

        newHighlights.forEach(highlightEl => {
            highlightEl.dataset.annotation = highlightUrl

            highlightEl.addEventListener('click', () =>
                this.props.postMessageToRN({
                    type: 'highlightClicked',
                    payload: highlightUrl,
                }),
            )
        })
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
