import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import {
    UITaskState,
    UIStorageModules,
    UIServices,
    NavigationProps,
} from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { NAV_PARAMS } from './constants'

export interface State {
    loadState: UITaskState
    isTagged: boolean
    isBookmarked: boolean
    isTextSelected: boolean
    htmlSource?: string
    url: string
}

export type Event = UIEvent<{}>

export interface Props extends NavigationProps {
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
        const { readability } = this.props.services

        await loadInitial<State>(this, async () => {
            const cleanHtml = await readability.fetchAndCleanHtml({
                url: previousState.url,
            })

            this.emitMutation({ htmlSource: { $set: cleanHtml } })
        })
    }
}
