import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import {
    UITaskState,
    UIStorageModules,
    UIServices,
    NavigationProps,
} from 'src/ui/types'
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

export interface Props extends NavigationProps {}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        const url = this.props.navigation.getParam(NAV_PARAMS.READER_URL)
        // const url = 'https://getmemex.com'

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
}
