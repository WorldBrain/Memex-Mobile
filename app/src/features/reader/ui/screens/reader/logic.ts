import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIEventHandler,
} from 'ui-logic-core'

import {
    UITaskState,
    UIStorageModules,
    UIServices,
    NavigationProps,
} from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { NAV_PARAMS } from './constants'
import { ReadabilityArticle } from 'src/services/readability/types'
import { createHtmlStringFromTemplate } from 'src/features/reader/utils/in-page-html-template'
import { inPageJS } from 'src/features/reader/utils/in-page-js'
import { inPageCSS } from 'src/features/reader/utils/in-page-css'

export interface State {
    url: string
    loadState: UITaskState
    selectedText?: string
    isTagged: boolean
    isBookmarked: boolean
    htmlSource?: string
}

export type Event = UIEvent<{
    setTextSelection: { text: string }
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'reader'>
    services: UIServices<'readability'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        const url = this.props.navigation.getParam(NAV_PARAMS.READER_URL)

        if (!url) {
            throw new Error("Navigation error: reader didn't receive URL")
        }

        return {
            url: 'https://' + url, // TODO: find a better way to get the full URL
            loadState: 'pristine',
            isTagged: false,
            isBookmarked: false,
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadReadableUrl(previousState.url)
        })
    }

    private async storeReadableArticle(
        url: string,
        article: ReadabilityArticle,
        createdWhen = new Date(),
    ) {
        await this.props.storage.modules.reader.createReadablePage({
            url,
            fullUrl: url,
            strategy: 'seanmcgary/readability',
            createdWhen,
            ...article,
        })
    }

    private async loadReadableUrl(url: string) {
        const { reader: readerStorage } = this.props.storage.modules
        const { readability } = this.props.services

        const existingReadable = await readerStorage.getReadablePage(url)
        let article: ReadabilityArticle

        if (existingReadable == null) {
            article = await readability.fetchAndParse({ url })
            await this.storeReadableArticle(url, article)
        } else {
            article = {
                title: existingReadable.title,
                content: existingReadable.content,
            } as any
        }

        const html = createHtmlStringFromTemplate({
            body: article.content,
            title: article.title,
            js: inPageJS,
            css: inPageCSS,
        })

        this.emitMutation({ htmlSource: { $set: html } })
    }

    setTextSelection: EventHandler<'setTextSelection'> = ({ event }) => {
        const selectedText = event.text?.length ? event.text.trim() : undefined
        return this.emitMutation({ selectedText: { $set: selectedText } })
    }
}
