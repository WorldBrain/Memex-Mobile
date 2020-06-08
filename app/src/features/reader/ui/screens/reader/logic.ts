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
import { ContentScriptLoader } from 'src/features/reader/utils/load-content-script'
import { ReaderNavigationParams } from './types'
import { Anchor } from 'src/content-script/types'
import { NoteEditorNavigationParams } from 'src/features/overview/ui/screens/note-editor/types'

export interface State {
    url: string
    title: string
    loadState: UITaskState
    selectedText?: string
    isTagged: boolean
    isBookmarked: boolean
    isListed: boolean
    hasNotes: boolean
    htmlSource?: string
    errorMessage?: string
    annotationAnchors: Anchor[]
}

export type Event = UIEvent<{
    setErrorMessage: { message?: string }
    createHighlight: { anchor: Anchor }
    createAnnotation: { anchor: Anchor }
    setTextSelection: { text?: string }
    toggleBookmark: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends NavigationProps {
    storage: UIStorageModules<
        'reader' | 'overview' | 'pageEditor' | 'metaPicker'
    >
    services: UIServices<'readability' | 'resourceLoader'>
    loadContentScript: ContentScriptLoader
}

export default class Logic extends UILogic<State, Event> {
    static formUrl = (url: string) => {
        if (url.startsWith('http')) {
            return url
        }

        return 'https://' + url // TODO: find a better way to get the full URL
    }

    constructor(private props: Props) {
        super()
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
            url: Logic.formUrl(params.url),
            loadState: 'pristine',
            isBookmarked: false,
            isTagged: false,
            isListed: false,
            hasNotes: false,
            annotationAnchors: [],
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            try {
                await this.loadPageState(previousState.url)
                await this.loadPageAnnotations(previousState.url)
                await this.loadReadablePage(
                    previousState.url,
                    previousState.title,
                )
            } catch (err) {
                this.emitMutation({ errorMessage: { $set: err.message } })
            }
        })
    }

    private async storeReadableArticle(
        url: string,
        article: ReadabilityArticle,
        pageTitle: string,
        createdWhen = new Date(),
    ) {
        const {
            reader: readerStorage,
            overview: overviewStorage,
        } = this.props.storage.modules

        // Update page title with what was found in readability parsing - most pages saved on Memex Go will lack titles
        if (Logic.formUrl(pageTitle) === url) {
            await overviewStorage.updatePageTitle({ url, title: article.title })
        }

        await readerStorage.createReadablePage({
            url,
            strategy: 'seanmcgary/readability',
            createdWhen,
            ...article,
        })
    }

    private async loadPageAnnotations(url: string) {
        const { pageEditor } = this.props.storage.modules

        const annotations = await pageEditor.findAnnotations({ url })

        this.emitMutation({
            annotationAnchors: { $set: annotations.map(a => a.selector) },
        })
    }

    private async loadReadablePage(url: string, title: string) {
        const { reader: readerStorage } = this.props.storage.modules
        const { readability, resourceLoader } = this.props.services

        const existingReadable = await readerStorage.getReadablePage(url)
        let article: ReadabilityArticle

        if (existingReadable == null) {
            article = await readability.fetchAndParse({ url })
            await this.storeReadableArticle(url, article, title)
        } else {
            article = {
                title: existingReadable.title,
                content: existingReadable.content,
            } as any
        }

        // Don't attempt to load this in jest
        let js = ''
        if (process.env.JEST_WORKER_ID == null) {
            js = await this.props.loadContentScript(resourceLoader)
        }

        const html = createHtmlStringFromTemplate({
            body: article.content,
            title: article.title,
            css: inPageCSS,
            js,
        })

        this.emitMutation({ htmlSource: { $set: html } })
    }

    private async loadPageState(url: string) {
        const {
            overview: overviewStorage,
            pageEditor,
            metaPicker,
        } = this.props.storage.modules

        const isBookmarked = await overviewStorage.isPageStarred({ url })
        const lists = await metaPicker.findListsByPage({ url })
        const tags = await metaPicker.findTagsByPage({ url })
        const notes = await pageEditor.findNotes({ url })

        this.emitMutation({
            isBookmarked: { $set: isBookmarked },
            isListed: { $set: !!lists.length },
            hasNotes: { $set: !!notes.length },
            isTagged: { $set: !!tags.length },
        })
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

    setErrorMessage: EventHandler<'setErrorMessage'> = ({ event }) => {
        const defaultMessage = 'An error sssshappened'

        return this.emitMutation({
            errorMessage: { $set: event.message ?? defaultMessage },
        })
    }

    //
    // Webview content-script event handlers
    //
    setTextSelection: EventHandler<'setTextSelection'> = ({ event }) => {
        const selectedText = event.text?.length ? event.text.trim() : undefined
        return this.emitMutation({ selectedText: { $set: selectedText } })
    }

    createHighlight: EventHandler<'createHighlight'> = async ({
        event,
        previousState,
    }) => {
        const { pageEditor } = this.props.storage.modules

        await pageEditor.createAnnotation({
            pageUrl: previousState.url,
            pageTitle: previousState.title,
            selector: event.anchor,
            body: event.anchor.quote,
        })

        this.emitMutation({ hasNotes: { $set: true } })
    }

    createAnnotation: EventHandler<'createAnnotation'> = async ({
        event,
        previousState,
    }) => {
        this.props.navigation.navigate('NoteEditor', {
            [NAV_PARAMS.NOTE_EDITOR]: {
                mode: 'create',
                pageUrl: previousState.url,
                highlightText: event.anchor.quote,
                previousRoute: 'Reader',
                anchor: event.anchor,
                pageTitle: previousState.title,
            } as NoteEditorNavigationParams,
        })
    }
}
