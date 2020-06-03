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
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import { ReadabilityArticle } from 'src/services/readability/types'
import { createHtmlStringFromTemplate } from 'src/features/reader/utils/in-page-html-template'
import { inPageCSS } from 'src/features/reader/utils/in-page-css'
import { loadContentScript } from 'src/features/reader/utils/load-content-script'
import { ReaderNavigationParams } from './types'
import { CONTENT_SCRIPT_PATH } from './constants'

export interface State {
    url: string
    title: string
    loadState: UITaskState
    selectedText?: string
    isTagged: boolean
    isBookmarked: boolean
    htmlSource?: string
}

export type Event = UIEvent<{
    setTextSelection: { text: string }
    toggleBookmark: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'reader' | 'overview'>
    services: UIServices<'readability' | 'resourceLoader'>
    contentScriptPath?: string
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    private get contentScriptPath(): string {
        return this.props.contentScriptPath ?? CONTENT_SCRIPT_PATH
    }

    getInitialState(): State {
        const params = this.props.navigation.getParam(
            NAV_PARAMS.READER,
        ) as ReaderNavigationParams

        if (!params?.url) {
            throw new Error("Navigation error: reader didn't receive URL")
        }

        return {
            title: params.title,
            url: 'https://' + params.url, // TODO: find a better way to get the full URL
            loadState: 'pristine',
            isBookmarked: false,
            isTagged: false,
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadPageState(previousState.url)
            await this.loadReadablePage(previousState.url, previousState.title)
        })
    }

    private async storeReadableArticle(
        url: string,
        article: ReadabilityArticle,
        createdWhen = new Date(),
    ) {
        const {
            reader: readerStorage,
            overview: overviewStorage,
        } = this.props.storage.modules

        // Update page title with what was found in readability parsing - most pages saved on Memex Go will lack titles
        await overviewStorage.updatePageTitle({ url, title: article.title })

        await readerStorage.createReadablePage({
            url,
            strategy: 'seanmcgary/readability',
            createdWhen,
            ...article,
        })
    }

    private async loadReadablePage(url: string, title: string) {
        const { reader: readerStorage } = this.props.storage.modules
        const { readability, resourceLoader } = this.props.services

        const existingReadable = await readerStorage.getReadablePage(url)
        let article: ReadabilityArticle

        if (existingReadable == null) {
            article = await readability.fetchAndParse({ url })
            await this.storeReadableArticle(url, article)
        } else {
            article = {
                title,
                content: existingReadable.content,
            } as any
        }

        const html = createHtmlStringFromTemplate({
            body: article.content,
            title: article.title,
            css: inPageCSS,
            js: await loadContentScript(resourceLoader, this.contentScriptPath),
        })

        this.emitMutation({ htmlSource: { $set: html } })
    }

    private async loadPageState(url: string) {
        const { overview: overviewStorage } = this.props.storage.modules

        this.emitMutation({
            isBookmarked: {
                $set: await overviewStorage.isPageStarred({ url }),
            },
        })
    }

    setTextSelection: EventHandler<'setTextSelection'> = ({ event }) => {
        const selectedText = event.text?.length ? event.text.trim() : undefined
        return this.emitMutation({ selectedText: { $set: selectedText } })
    }

    toggleBookmark: EventHandler<'toggleBookmark'> = async ({
        previousState,
    }) => {
        const { overview: overviewStorage } = this.props.storage.modules

        const toggleState = () =>
            this.emitMutation({ isBookmarked: { $apply: prev => !prev } })
        toggleState()

        try {
            if (previousState.isBookmarked) {
                await overviewStorage.unstarPage({ url: previousState.url })
            } else {
                await overviewStorage.starPage({ url: previousState.url })
            }
        } catch (err) {
            toggleState()
            throw err
        }
    }
}
