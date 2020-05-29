import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIEventHandler,
    UIMutation,
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

export interface State {
    loadState: UITaskState
    isTagged: boolean
    isBookmarked: boolean
    isTextSelected: boolean
    htmlSource?: string
    url: string
}

export type Event = UIEvent<{
    toggleTextSelection: null
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
            isTextSelected: false,
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

        this.emitMutation({
            htmlSource: {
                $set: readability.applyHtmlTemplateToArticle({ article }),
            },
        })
    }

    toggleTextSelection: EventHandler<'toggleTextSelection'> = () => {
        this.emitMutation({
            isTextSelected: { $apply: prev => !prev },
        })
    }
}
