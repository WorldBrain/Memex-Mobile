import expect from 'expect'

export class TestData {
    constructor(
        private props: {
            url: string
            normalizedUrl: string
            hostname?: string
            domain?: string
            noteText?: string
        },
    ) {}

    get PAGE() {
        return {
            hostname: this.props.hostname ?? this.props.normalizedUrl,
            domain: this.props.domain ?? this.props.normalizedUrl,
            url: this.props.normalizedUrl,
            fullUrl: this.props.url,
            fullTitle: '',
            text: '',
        }
    }

    get NOTE() {
        if (!this.props.noteText) {
            return undefined
        }

        return {
            comment: this.props.noteText,
            createdWhen: expect.any(Date),
            lastEdited: expect.any(Date),
            pageTitle: '',
            pageUrl: this.props.normalizedUrl,
            url: `${this.props.normalizedUrl}/#${NOTE_TIMESTAMP}`,
        }
    }
}

export const PAGE_URL_1 = 'http://bla.com'
export const PAGE_URL_1_NORM = 'bla.com'
export const PAGE_URL_2 = 'http://bla.com/test#hash'
export const PAGE_URL_2_NORM = 'bla.com/test'

export const NOTE_TIMESTAMP = 123

export const NOTE_1_TEXT = 'This is a test note : dog fish cat'
