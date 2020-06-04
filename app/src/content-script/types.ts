export interface Descriptor {
    strategy: string
    content: any
}

export interface Anchor {
    quote: string
    descriptor: Descriptor
}

export type Message = SelectionMessage | HighlightMessage | AnnotationMessage

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

export type MessagePoster = (message: Message) => void
