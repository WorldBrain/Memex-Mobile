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
import showdown from 'showdown'

polyfillReadableStream()

// import { createHtmlStringFromTemplate } from 'src/features/reader/utils/in-page-html-template'
// import { inPageCSS } from 'src/features/reader/utils/in-page-css'

interface CreateHighlightArgs {
    anchor?: Anchor
    videoTimestamp?: [string, string]
    renderHighlight?: (h: Highlight) => void
    comment?: string
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
    AISummaryText: string
    AISummaryLoading: UITaskState
    showAIResults: boolean
    statusBarHeight?: number
    AIQueryTextFieldHeight?: number
    summaryHalfScreen?: boolean
    displaySplitHeight?: number
    prompt?: string | null
    querySuggestions: string[]
    showPromptEdit: number | null
    AINoteSaveState: UITaskState
    promptEditState: string | null
}

export type Event = UIEvent<{
    setError: { error?: Error }
    reportError: { error?: Error }
    editHighlight: { highlightUrl: string }
    createHighlight: CreateHighlightArgs
    createAnnotation: CreateHighlightArgs
    saveAIOutputAsNote: { comment: string }
    createYoutubeTimestamp: any
    setTextSelection: { text?: string }
    navToPageEditor: { mode: EditorMode }
    toggleBookmark: null
    goBack: null
    onAIButtonPress: null
    onAIQuerySubmit: { fullPageUrl: string; prompt: string }
    savePromptEdit: { promptToChange: string; index: number }
    editPrompt: { index: number }
    setPrompt: { prompt: string }
    clearAIquery: null
    setAIQueryTextFieldHeight: number
    makeSummaryHalfScreen: null
    updateDisplaySplitHeight: number
    changePromptEditState?: { prompt: string }
    cancelPromptEdit: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'Reader'> {
    storage: UIStorageModules<
        'reader' | 'overview' | 'pageEditor' | 'metaPicker' | 'syncSettings'
    >
    services: UIServices<
        | 'readability'
        | 'resourceLoader'
        | 'errorTracker'
        | 'annotationSharing'
        | 'cloudSync'
    >
    loadContentScript: ContentScriptLoader
    pageUrl?: string
    hideNavigation?: boolean
    deviceInfo: DeviceDetails | null
    closeModal?: () => void
    location?: 'mainApp' | 'shareExt'
    keyboardHeight?: number | null
    showAI?: boolean
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

    private isYoutubeLink(url: string): boolean {
        return url.includes('youtube.com') || url.includes('youtu.be')
    }

    getInitialState(): State {
        const { params } = this.props.route
        let insertedUrl: string | undefined
        if (this.props.pageUrl) {
            insertedUrl = this.props.pageUrl
        }

        if (!params?.url && !insertedUrl) {
            throw new Error("Navigation error: reader didn't receive URL")
        }
        return {
            title: 'test',
            // TODO: Why does the route param's URL need to be decoded twice???
            url: insertedUrl
                ? Logic.formUrl(insertedUrl)
                : Logic.formUrl(
                      decodeURIComponent(decodeURIComponent(params.url)),
                  ),
            loadState: 'pristine',
            isErrorReported: false,
            isBookmarked: false,
            isListed: false,
            hasNotes: false,
            highlights: [],
            spaces: [],
            showAIResults: false,
            AISummaryText: '',
            AISummaryLoading: 'pristine',
            AIQueryTextFieldHeight: 24,
            summaryHalfScreen: false,
            displaySplitHeight: 0,
            prompt: null,
            promptEditState: null,
            querySuggestions: [],
            showPromptEdit: null,
            AINoteSaveState: 'pristine',
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        this.emitMutation({
            statusBarHeight: { $set: StatusBar.currentHeight },
        })

        this.props.services.cloudSync.sync()

        await loadInitial<State>(this, async () => {
            try {
                await this.loadPageState(previousState.url)
                await this.loadReadablePage(
                    previousState.url,
                    previousState.title,
                )

                const syncSettings = this.props.storage.modules.syncSettings
                const storedPromptTemplates = await syncSettings.getSetting({
                    key: 'openAI.promptSuggestions',
                })

                let querySuggestions: string[] = []

                if (storedPromptTemplates == null) {
                    querySuggestions = [
                        'Summarize this for me',
                        'Tell me the key takeaways',
                        `Explain this to me in simple terms`,
                        `Translate this into English`,
                    ]
                } else {
                    querySuggestions = storedPromptTemplates.map(
                        (item: any) => item.text,
                    )
                }

                this.emitMutation({
                    querySuggestions: { $set: querySuggestions },
                })
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

    goBack: EventHandler<'goBack'> = async ({}) => {
        const { navigation } = this.props
        if (navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.replace('Dashboard', { skipDeepLinkCheck: true })
        }
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

    updateDisplaySplitHeight: EventHandler<
        'updateDisplaySplitHeight'
    > = async ({ event, previousState }) => {
        this.emitMutation({
            displaySplitHeight: { $set: Math.floor(event) },
        })
    }
    savePromptEdit: EventHandler<'savePromptEdit'> = async ({
        event,
        previousState,
    }) => {
        const { promptToChange, index } = event
        const syncSettings = this.props.storage.modules.syncSettings

        // Retrieve the current list of prompt suggestions
        let currentPromptList = previousState.querySuggestions

        // Update the prompt at the specified index
        if (index >= 0 && index < currentPromptList.length) {
            currentPromptList[index] = promptToChange
        }

        // Create the object array for storage
        const storedPromptTemplates = currentPromptList.map((text) => ({
            isFocused: false,
            text: text,
        }))

        // Store the updated prompt suggestions
        await syncSettings.setSetting({
            key: 'openAI.promptSuggestions',
            value: storedPromptTemplates,
        })

        this.emitMutation({
            querySuggestions: { $set: currentPromptList },
            showPromptEdit: { $set: null },
        })
    }
    setPrompt: EventHandler<'setPrompt'> = async ({ event, previousState }) => {
        this.emitMutation({
            prompt: { $set: event.prompt },
        })
    }
    editPrompt: EventHandler<'editPrompt'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            showPromptEdit: { $set: event.index },
            promptEditState: { $set: null },
        })
    }
    cancelPromptEdit: EventHandler<'cancelPromptEdit'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            showPromptEdit: { $set: null },
            promptEditState: { $set: null },
        })
    }
    changePromptEditState: EventHandler<'changePromptEditState'> = async ({
        event,
    }) => {
        if (event) {
            this.emitMutation({
                promptEditState: { $set: event.prompt },
            })
        }
    }
    onAIButtonPress: EventHandler<'onAIButtonPress'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            showAIResults: { $set: !previousState.showAIResults },
        })

        if (previousState.showAIResults) {
            this.emitMutation({
                displaySplitHeight: { $set: 0 },
            })
        } else {
            this.emitMutation({
                displaySplitHeight: { $set: 300 },
            })
        }
    }
    makeSummaryHalfScreen: EventHandler<'makeSummaryHalfScreen'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            summaryHalfScreen: { $set: !previousState.summaryHalfScreen },
        })

        if (previousState.summaryHalfScreen) {
            this.emitMutation({
                displaySplitHeight: { $set: 0 },
            })
        } else {
            this.emitMutation({
                displaySplitHeight: { $set: 300 },
            })
        }
    }
    clearAIquery: EventHandler<'clearAIquery'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            AISummaryText: { $set: '' },
            AISummaryLoading: { $set: 'pristine' },
            prompt: { $set: null },
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
            prompt: { $set: event.prompt },
            AINoteSaveState: { $set: 'pristine' },
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                originalUrl: event.fullPageUrl,
                queryPrompt: event.prompt,
            }),
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
                    AISummaryText: { $set: summaryText },
                    AISummaryLoading: { $set: 'done' },
                })
            })
            .catch((error) => {
                console.error('Error:', error)
            })
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
        comment,
    }: { previousState: State } & CreateHighlightArgs): Promise<Highlight> => {
        const { pageEditor } = this.props.storage.modules

        const { annotationUrl } = await pageEditor.createAnnotation({
            pageUrl: previousState.url,
            pageTitle: previousState.title ?? '',
            selector: anchor,
            body: anchor?.quote,
            comment,
        })

        const newHighlight: Highlight = {
            url: annotationUrl,
            anchor,
        }
        if (renderHighlight != null) {
            renderHighlight(newHighlight)
        }

        this.emitMutation({
            hasNotes: { $set: true },
            highlights: {
                $apply: (state: Highlight[]) => [...state, newHighlight],
            },
        })

        return newHighlight
    }

    createYoutubeTimestamp: EventHandler<'createYoutubeTimestamp'> = async ({
        event,
        previousState,
    }) => {
        this.props.navigation.navigate('NoteEditor', {
            mode: 'create',
            pageUrl: previousState.url,
            noteText: event.videoTimestamp,
        })
    }

    createHighlight: EventHandler<'createHighlight'> = async ({
        event,
        previousState,
    }) => {
        if (this.isYoutubeLink(previousState.url)) {
            const timestamps = event.videoTimestamp

            this.props.navigation.navigate('NoteEditor', {
                mode: 'create',
                pageUrl: previousState.url,
                noteText: timestamps
                    ? `<a href="${timestamps[0]}">${timestamps[1]}</a> `
                    : '',
            })
        } else {
            await this._createHighlight({
                previousState,
                anchor: event.anchor,
                renderHighlight: event.renderHighlight,
            })
        }
    }
    saveAIOutputAsNote: EventHandler<'saveAIOutputAsNote'> = async ({
        event,
        previousState,
    }) => {
        let converter = new showdown.Converter()
        const noteAsHTML =
            '<div>' + converter.makeHtml(event.comment) + '</div>'

        this.emitMutation({
            AINoteSaveState: { $set: 'running' },
        })

        await this._createHighlight({
            previousState,
            comment: noteAsHTML,
        })

        this.emitMutation({
            AINoteSaveState: { $set: 'done' },
        })
    }

    createAnnotation: EventHandler<'createAnnotation'> = async ({
        event,
        previousState,
    }) => {
        const highlight = await this._createHighlight({
            previousState,
            anchor: event.anchor,
            renderHighlight: event.renderHighlight,
        })

        this.props.navigation.navigate('NoteEditor', {
            mode: 'update',
            highlightText: event.anchor?.quote,
            anchor: event.anchor,
            noteUrl: highlight.url,
            videoTimestamp: event.videoTimestamp,
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
