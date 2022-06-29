import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIEventHandler,
    UIMutation,
} from 'ui-logic-core'
import { Dimensions, ScaledSize } from 'react-native'

import {
    UITaskState,
    UIStorageModules,
    UIServices,
    MainNavProps,
} from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { ReadabilityArticle } from 'src/services/readability/types'
import { ContentScriptLoader } from 'src/features/reader/utils/load-content-script'
import { Anchor, Highlight } from 'src/content-script/types'
import { EditorMode } from 'src/features/page-editor/types'
import { UIPageWithNotes } from 'src/features/overview/types'
import type { List } from 'src/features/meta-picker/types'
// import { createHtmlStringFromTemplate } from 'src/features/reader/utils/in-page-html-template'
// import { inPageCSS } from 'src/features/reader/utils/in-page-css'

interface CreateHighlightArgs {
    anchor: Anchor
    renderHighlight: (h: Highlight) => void
}

export interface State {
    url: string
    title: string
    loadState: UITaskState
    selectedText?: string
    isBookmarked: boolean
    spaces: List[]
    isListed: boolean
    hasNotes: boolean
    htmlSource?: string
    contentScriptSource?: string
    rotation: 'landscape' | 'portrait'
    error?: Error
    isErrorReported: boolean
    highlights: Highlight[]
}

export type Event = UIEvent<{
    reportError: null
    setError: { error?: Error }
    editHighlight: { highlightUrl: string }
    createHighlight: CreateHighlightArgs
    createAnnotation: CreateHighlightArgs
    setTextSelection: { text?: string }
    navToPageEditor: { mode: EditorMode }
    toggleBookmark: null
    goBack: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'Reader'> {
    storage: UIStorageModules<
        'reader' | 'overview' | 'pageEditor' | 'metaPicker'
    >
    services: UIServices<'readability' | 'resourceLoader' | 'errorTracker'>
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
        const { params } = this.props.route

        if (!params?.url) {
            throw new Error("Navigation error: reader didn't receive URL")
        }

        const screen = Dimensions.get('screen')

        return {
            rotation: screen.width > screen.height ? 'landscape' : 'portrait',
            title: params.title,
            url: Logic.formUrl(params.url),
            loadState: 'pristine',
            isErrorReported: false,
            isBookmarked: false,
            isListed: false,
            hasNotes: false,
            highlights: [],
            spaces: [],
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            Dimensions.addEventListener('change', this.handleDimensionsChange)
            try {
                await this.loadPageState(previousState.url)
                await this.loadReadablePage(
                    previousState.url,
                    previousState.title,
                )
            } catch (err) {
                this.emitMutation({ error: { $set: err } })
            }
        })
    }

    cleanup() {
        Dimensions.removeEventListener('change', this.handleDimensionsChange)
    }

    private handleDimensionsChange = ({
        screen,
    }: {
        window: ScaledSize
        screen: ScaledSize
    }) => {
        this.emitMutation({
            rotation: {
                $set: screen.width > screen.height ? 'landscape' : 'portrait',
            },
        })
    }

    private async storeReadableArticle(
        url: string,
        article: ReadabilityArticle,
        pageTitle: string,
        createdWhen = new Date(),
    ) {
        const { reader: readerStorage, overview: overviewStorage } =
            this.props.storage.modules

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

    private async loadReadablePage(url: string, title: string) {
        // const { reader: readerStorage } = this.props.storage.modules
        // const { readability, resourceLoader } = this.props.services
        const { resourceLoader } = this.props.services

        // const existingReadable = await readerStorage.getReadablePage(url)
        // let article: ReadabilityArticle

        // if (existingReadable == null) {
        //     article = await readability.fetchAndParse({ url })
        //     await this.storeReadableArticle(url, article, title)
        // } else {
        //     article = {
        //         title: existingReadable.title,
        //         content: existingReadable.content,
        //     } as any
        // }

        // Don't attempt to load this in jest
        let js = ''
        if (process.env.JEST_WORKER_ID == null) {
            js = await this.props.loadContentScript(resourceLoader)
        }

        this.emitMutation({ contentScriptSource: { $set: js } })

        // const html = createHtmlStringFromTemplate({
        //     body: article.content,
        //     title: article.title,
        //     css: inPageCSS,
        //     js,
        // })

        // this.emitMutation({ htmlSource: { $set: html } })
    }

    private async loadPageState(url: string) {
        const {
            overview: overviewStorage,
            pageEditor,
            metaPicker,
        } = this.props.storage.modules

        const isBookmarked = await overviewStorage.isPageStarred({ url })
        const lists = await metaPicker.findListsByPage({ url })
        const notes = await pageEditor.findNotes({ url })

        this.emitMutation({
            isBookmarked: { $set: isBookmarked },
            isListed: { $set: !!lists.length },
            hasNotes: { $set: !!notes.length },
            highlights: {
                $set: notes
                    .filter(
                        (note) => note.body?.length && note.selector != null,
                    )
                    .map((a) => ({
                        anchor: a.selector,
                        url: a.url,
                    })),
            },
            spaces: {
                $set: lists,
            },
        })
    }

    toggleBookmark: EventHandler<'toggleBookmark'> = async ({
        previousState,
    }) => {
        const { overview: overviewStorage } = this.props.storage.modules

        const toggleState = () =>
            this.emitMutation({ isBookmarked: { $apply: (prev) => !prev } })
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

    setError: EventHandler<'setError'> = ({ event }) => {
        return this.emitMutation({
            error: { $set: event.error },
        })
    }

    //
    // Webview content-script event handlers
    //
    setTextSelection: EventHandler<'setTextSelection'> = ({ event }) => {
        const selectedText = event.text?.length ? event.text.trim() : undefined
        return this.emitMutation({ selectedText: { $set: selectedText } })
    }

    private _createHighlight = async ({
        anchor,
        renderHighlight,
        previousState,
    }: { previousState: State } & CreateHighlightArgs): Promise<Highlight> => {
        const { pageEditor } = this.props.storage.modules

        const { object } = await pageEditor.createAnnotation({
            pageUrl: previousState.url,
            pageTitle: previousState.title,
            selector: anchor,
            body: anchor.quote,
        })

        const newHighlight = { url: object.url, anchor }
        renderHighlight(newHighlight)

        this.emitMutation({
            hasNotes: { $set: true },
            highlights: {
                $apply: (state: Highlight[]) => [...state, newHighlight],
            },
        })

        return newHighlight
    }

    createHighlight: EventHandler<'createHighlight'> = async ({
        event,
        previousState,
    }) => {
        await this._createHighlight({ ...event, previousState })
    }

    createAnnotation: EventHandler<'createAnnotation'> = async ({
        event,
        previousState,
    }) => {
        const highlight = await this._createHighlight({
            ...event,
            previousState,
        })

        this.props.navigation.navigate('NoteEditor', {
            mode: 'update',
            highlightText: event.anchor.quote,
            anchor: event.anchor,
            pageUrl: previousState.url,
            noteUrl: highlight.url,
        })
    }

    editHighlight: EventHandler<'editHighlight'> = async ({
        event: { highlightUrl },
        previousState,
    }) => {
        const { navigation, storage } = this.props

        const note = await storage.modules.pageEditor.findNote({
            url: highlightUrl,
        })

        if (!note) {
            throw new Error('Clicked highlight that is not tracked in DB.')
        }

        navigation.navigate('NoteEditor', {
            mode: 'update',
            noteUrl: note.url,
            highlightText: note.body,
            noteText: note.comment,
            anchor: note.selector,
            pageTitle: previousState.title,
            pageUrl: previousState.url,
        })
    }

    goBack = this.props.navigation.goBack

    private updatePageDataFlags = (incomingPage: UIPageWithNotes) => {
        // Allow incoming page to go back up to Dashboard so that can also react to changes
        this.props.route.params.updatePage(incomingPage)
        this.emitMutation({
            isListed: { $set: incomingPage.listIds?.length > 0 },
            hasNotes: { $set: incomingPage.notes?.length > 0 },
        })
    }

    navToPageEditor: EventHandler<'navToPageEditor'> = ({
        event: { mode },
        previousState,
    }) => {
        this.props.navigation.navigate('PageEditor', {
            pageUrl: previousState.url,
            mode,
            updatePage: (page) => this.updatePageDataFlags(page),
        })
    }

    reportError: EventHandler<'reportError'> = ({ previousState }) => {
        const { errorTracker } = this.props.services

        errorTracker.track(previousState.error!)

        this.emitMutation({ isErrorReported: { $set: true } })
    }
}
