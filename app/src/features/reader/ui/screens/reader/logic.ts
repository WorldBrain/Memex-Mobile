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
    MainNavProps,
} from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { ContentScriptLoader } from 'src/features/reader/utils/load-content-script'
import type { Anchor, Highlight } from 'src/content-script/types'
import { EditorMode } from 'src/features/page-editor/types'
import { UIPageWithNotes } from 'src/features/overview/types'
import type { List } from 'src/features/meta-picker/types'
import { DeviceDetails } from 'src/features/page-share/ui/screens/share-modal/util'
import { CLOUDFLARE_WORKER_URLS } from '@worldbrain/memex-common/lib/content-sharing/storage/constants'
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream'
import { StatusBar } from 'react-native'

polyfillReadableStream()

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
    error?: Error
    isErrorReported: boolean
    highlights: Highlight[]
    AIsummaryText: string
    AISummaryLoading: UITaskState
    showAIResults: boolean
    statusBarHeight?: number
    AIQueryTextFieldHeight?: number
}

export type Event = UIEvent<{
    setError: { error?: Error }
    reportError: { error?: Error }
    editHighlight: { highlightUrl: string }
    createHighlight: CreateHighlightArgs
    createAnnotation: CreateHighlightArgs
    setTextSelection: { text?: string }
    navToPageEditor: { mode: EditorMode }
    toggleBookmark: null
    goBack: null
    onAIButtonPress: null
    onAIQuerySubmit: { fullPageUrl: string; prompt: string }
    clearAIquery: null
    setAIQueryTextFieldHeight: number
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
    services: UIServices<
        'readability' | 'resourceLoader' | 'errorTracker' | 'annotationSharing'
    >
    loadContentScript: ContentScriptLoader
    pageUrl: string
    hideNavigation?: boolean
    deviceInfo: DeviceDetails | null
    closeModal?: () => void
    location?: 'mainApp' | 'shareExt'
    keyboardHeight?: number | null
}

export default class Logic extends UILogic<State, Event> {
    static formUrl = (url: string) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }

        return 'https://' + url // TODO: find a better way to get the full URL
    }

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        const { params } = this.props.route
        let insertedUrl
        if (this.props.pageUrl) {
            insertedUrl = this.props.pageUrl
        }

        if (!params?.url && !insertedUrl) {
            throw new Error("Navigation error: reader didn't receive URL")
        }

        return {
            title: 'test',
            url: insertedUrl
                ? Logic.formUrl(insertedUrl)
                : Logic.formUrl(params.url),
            loadState: 'pristine',
            isErrorReported: false,
            isBookmarked: false,
            isListed: false,
            hasNotes: false,
            highlights: [],
            spaces: [],
            showAIResults: false,
            AIsummaryText: '',
            AISummaryLoading: 'pristine',
            AIQueryTextFieldHeight: 24,
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        this.emitMutation({
            statusBarHeight: { $set: StatusBar.currentHeight },
        })
        await loadInitial<State>(this, async () => {
            try {
                await this.loadPageState(previousState.url)
                await this.loadReadablePage(
                    previousState.url,
                    previousState.title,
                )
            } catch (err) {
                if (err instanceof Error) {
                    this.emitMutation({ error: { $set: err } })
                }
            }
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
        const lists = await metaPicker.findListsByPage({
            url,
            includeRemoteIds: true,
        })
        const notes = await pageEditor.findNotesByPage({ url })

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

    goBack: EventHandler<'goBack'> = async ({ previousState }) => {
        this.props.navigation.goBack()
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

    onAIButtonPress: EventHandler<'onAIButtonPress'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            showAIResults: { $set: !previousState.showAIResults },
        })
    }
    clearAIquery: EventHandler<'clearAIquery'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            AIsummaryText: { $set: '' },
            AISummaryLoading: { $set: 'pristine' },
        })
    }
    setAIQueryTextFieldHeight: EventHandler<
        'setAIQueryTextFieldHeight'
    > = async ({ event, previousState }) => {
        this.emitMutation({
            AIQueryTextFieldHeight: { $set: event },
        })
    }

    onAIQuerySubmit: EventHandler<'onAIQuerySubmit'> = async ({
        event,
        previousState,
    }) => {
        let summaryText = ''
        this.emitMutation({
            AISummaryLoading: { $set: 'running' },
        })

        const urlToFetchFrom =
            process.env.NODE_ENV === 'production'
                ? CLOUDFLARE_WORKER_URLS.production + '/summarize'
                : CLOUDFLARE_WORKER_URLS.staging + '/summarize'

        await fetch(urlToFetchFrom, {
            reactNative: { textStreaming: true },
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                originalUrl: event.fullPageUrl,
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
                console.log('text', text)
                summaryText = this.processChunk(text) || ''
                this.emitMutation({
                    AIsummaryText: { $set: JSON.parse(summaryText)['t'] },
                    AISummaryLoading: { $set: 'done' },
                })
            })
            .catch((error) => console.error('Error:', error))
    }

    //
    // Webview content-script event handlers
    //

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

        const { annotationUrl } = await pageEditor.createAnnotation({
            pageUrl: previousState.url,
            pageTitle: previousState.title ?? '',
            selector: anchor,
            body: anchor.quote,
        })

        const newHighlight: Highlight = { url: annotationUrl, anchor }
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
            noteUrl: highlight.url,
            spaces: [],
        })
    }

    editHighlight: EventHandler<'editHighlight'> = async ({
        event: { highlightUrl },
        previousState,
    }) => {
        const {
            navigation,
            storage: {
                modules: { pageEditor, metaPicker },
            },
            services: { annotationSharing },
        } = this.props

        const note = await pageEditor.findNote({ url: highlightUrl })
        if (!note) {
            throw new Error('Clicked highlight that is not tracked in DB.')
        }

        const sharingState = await annotationSharing.getAnnotationSharingState({
            annotationUrl: highlightUrl,
        })
        const listIdSet = new Set([
            ...sharingState.privateListIds,
            ...sharingState.sharedListIds,
        ])
        const lists = await metaPicker.findListsByIds({
            ids: [...listIdSet],
            includeRemoteIds: true,
        })

        navigation.navigate('NoteEditor', {
            mode: 'update',
            noteUrl: note.url,
            highlightText: note.body,
            noteText: note.comment,
            anchor: note.selector,
            pageTitle: previousState.title ?? '',
            spaces: lists.map((list) => ({
                id: list.id,
                name: list.name,
                remoteId: list.remoteId,
            })),
        })
    }

    private updatePageDataFlags = (incomingPage: UIPageWithNotes) => {
        // Allow incoming page to go back up to Dashboard so that can also react to changes
        this.props.route.params?.updatePage?.(incomingPage)
        this.emitMutation({
            isListed: { $set: (incomingPage.listIds?.length ?? 0) > 0 },
            hasNotes: { $set: incomingPage.notes?.length > 0 },
        })
    }

    navToPageEditor: EventHandler<'navToPageEditor'> = ({
        event: { mode },
        previousState,
    }) => {
        this.emitMutation({
            showAIResults: { $set: false },
        })

        this.props.navigation.navigate('PageEditor', {
            pageUrl: previousState.url,
            mode,
            updatePage: (page) => this.updatePageDataFlags(page),
        })
    }

    reportError: EventHandler<'reportError'> = ({ previousState, event }) => {
        const { errorTracker } = this.props.services
        errorTracker.track(event.error ?? previousState.error!)

        this.emitMutation({ isErrorReported: { $set: true } })
    }
}
