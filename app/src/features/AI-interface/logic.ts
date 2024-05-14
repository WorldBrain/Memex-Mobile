import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIEventHandler,
} from 'ui-logic-core'

import { loadInitial } from 'src/ui/utils'
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream'
polyfillReadableStream()

import { UITaskState } from 'src/ui/types'
import { CLOUDFLARE_WORKER_URLS } from '@worldbrain/memex-common/lib/content-sharing/storage/constants'

export interface State {
    loadState: UITaskState
    AISummaryLoading: UITaskState
    AIsummaryText: string
    prompt: string
    url: string
}

export type Event = UIEvent<{
    onAIQuerySubmit: { prompt: string; fullPageUrl: string }
    clearQuery: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props {
    url: string
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            url: '',
            AISummaryLoading: 'pristine',
            AIsummaryText: '',
            prompt: '',
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {})
    }

    private isYoutubeLink(url: string): boolean {
        return url.includes('youtube.com') || url.includes('youtu.be')
    }

    processChunk(chunk: string) {
        var regex = /"t":"([^"]*)"/g
        var matches = chunk.match(regex)

        var concatenatedString = ''

        if (matches && matches.length > 0) {
            var values = matches.map(function (match) {
                return match.split('":"')[1].slice(0, -1)
            })

            for (var i = 0; i < values.length; i++) {
                if (values[i].length > 0) {
                    concatenatedString += values[i]
                }
            }
            if (concatenatedString.length > 0) {
                concatenatedString = concatenatedString
                    .replace(/([^\\n])\\(?!n)/g, '')
                    .replace(/\n/g, '\\n')

                concatenatedString = '{"t":"' + concatenatedString + '"}'
                concatenatedString = (concatenatedString + '\n\n').toString()
                return concatenatedString
            } else {
                return null
            }
        }
    }
    clearQuery: EventHandler<'clearQuery'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            AIsummaryText: { $set: '' },
            prompt: { $set: '' },
        })
    }

    onAIQuerySubmit: EventHandler<'onAIQuerySubmit'> = async ({
        event,
        previousState,
    }) => {
        let summaryText = ''
        this.emitMutation({
            AISummaryLoading: { $set: 'running' },
            prompt: { $set: event.prompt },
        })

        const urlToFetchFrom =
            process.env.NODE_ENV === 'production'
                ? CLOUDFLARE_WORKER_URLS.production + '/summarize'
                : CLOUDFLARE_WORKER_URLS.staging + '/summarize'

        let prompt = event.prompt

        if (this.isYoutubeLink(previousState.url)) {
            prompt =
                prompt +
                '. Include inline timestamps to the referenced sections whenever possible'
        }

        await fetch(urlToFetchFrom, {
            reactNative: { textStreaming: true },
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                originalUrl: this.props.url,
                queryPrompt: event.prompt,
            }),
            stream: true,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.text() // get the response text
            })
            .then((text) => {
                summaryText = this.processChunk(text) || ''

                summaryText = summaryText
                    .replace(/{"t":"/g, '')
                    .replace(/"}/g, '')
                    .replace(/\\n/g, '\n')

                this.emitMutation({
                    AIsummaryText: { $set: summaryText },
                    AISummaryLoading: { $set: 'done' },
                })
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }
}
