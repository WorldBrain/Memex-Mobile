import type { EventEmitter } from 'events'
import {
    selectionToDescriptor,
    descriptorToRange,
    markRange,
} from '@worldbrain/memex-common/lib/annotations'
import { isUrlYTVideo } from '@worldbrain/memex-common/lib/utils/youtube-url'
import { getHTML5VideoTimestamp } from '@worldbrain/memex-common/lib/editor/utils'
import { setupRemoteFunctions } from './remote-functions'
import type { Anchor, MessagePoster, Highlight } from './types'
import { HIGHLIGHT_CLASS } from './constants'
import { getSelectionHtml } from '@worldbrain/memex-common/lib/annotations/utils'

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
            jumpToTimestamp: (url: string) => this.jumpToTimestamp(url),
        })
    }

    private isYoutubeLink(url: string): boolean {
        return url.includes('youtube.com') || url.includes('youtu.be')
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
        const url = window.location.href
        if (!this.isYoutubeLink(url)) {
            const selection = this.getDOMSelection()
            if (selection) {
                const anchor = await this.extractAnchorSelection(selection)
                this.props.postMessageToRN({
                    type,
                    payload: {
                        anchor: anchor ?? null,
                        videoTimestamp: null,
                    } as any,
                })
            }
        } else {
            const videoTimestamp = isUrlYTVideo(this.window.location.href)
                ? getHTML5VideoTimestamp(0)
                : undefined
            this.props.postMessageToRN({
                type,
                payload: {
                    videoTimestamp: videoTimestamp ?? null,
                } as any,
            })
        }
    }

    jumpToTimestamp = async (url: string) => {
        try {
            const urlParams = new URLSearchParams(new URL(url).search)
            const value = urlParams.get('t')

            let video = document.getElementsByTagName('video')[0]
            if (value) {
                video.currentTime = parseFloat(value)
            }
            this.props.postMessageToRN({
                type: 'debug',
                payload: {
                    message: 'successfully timestamped' + value,
                } as any,
            })
        } catch (e) {
            this.props.postMessageToRN({
                type: 'debug',
                payload: {
                    error: e,
                } as any,
            })
        }
    }

    createAnnotation = this.setupAnnotationSteps('annotation')
    createHighlight = this.setupAnnotationSteps('highlight')

    private async extractAnchorSelection(
        selection: Selection,
    ): Promise<Anchor> {
        // NOTE: There seems to be a bug with the `Selection.toString()` in RN WebView where
        //   it often returns the empty string. Instead we'll try to derive it from the selectors
        // const quote = selection.toString()

        const HTMLquote = getSelectionHtml(selection)
        const descriptor = await selectionToDescriptor({
            selection,
            isPdf: false,
        })

        if (!descriptor) {
            throw new Error(`Unable to derive descriptor from text selection`)
        }

        return { quote: HTMLquote, descriptor }
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
            try {
                await this.renderHighlight(highlight)
            } catch (err) {
                this.props.postMessageToRN({
                    type: 'error',
                    payload: err as Error,
                })
            }
        }
    }

    renderHighlight = async ({ anchor: { descriptor }, url }: Highlight) => {
        const range = await descriptorToRange({ descriptor, isPdf: false })
        if (range != null) {
            markRange({ range, cssClass: HIGHLIGHT_CLASS })
            this.attachEventListenersToNewHighlights(url)
        }
    }

    private attachEventListenersToNewHighlights(highlightUrl: string) {
        // The only highlight without an annotation data att should be the newly created one
        const newHighlights = this.document.querySelectorAll<HTMLElement>(
            `.${HIGHLIGHT_CLASS}:not([data-annotation])`,
        )

        newHighlights.forEach((highlightEl) => {
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
        (selector) => selector.type === 'TextQuoteSelector',
    )

    if (!textQuoteSelector) {
        throw new Error('No text quote selector to grab quote from')
    }

    return textQuoteSelector.exact
}
