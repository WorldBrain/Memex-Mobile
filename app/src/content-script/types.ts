export interface Descriptor {
    strategy: string
    content: any
}

export interface Highlight {
    url: string
    anchor: Anchor
}

export interface Anchor {
    quote: string
    descriptor: Descriptor
}

export type Message =
    | SelectionMessage
    | HighlightMessage
    | AnnotationMessage
    | HighlightClickedMessage
    | ScrollMessage
    | DebugMessage

// TODO: Better way to do this with TS type system?
export interface SelectionMessage {
    type: 'selection'
    payload?: string
}
export interface HighlightMessage {
    type: 'highlight'
    payload: Anchor
}
export interface AnnotationMessage {
    type: 'annotation'
    payload: Anchor
}
export interface HighlightClickedMessage {
    type: 'highlightClicked'
    payload: string
}
export interface DebugMessage {
    type: 'debug'
    payload?: any
}
export interface ScrollMessage {
    type: 'scrollPercent'
    payload: number
}

export type MessagePoster = (message: Message) => void
