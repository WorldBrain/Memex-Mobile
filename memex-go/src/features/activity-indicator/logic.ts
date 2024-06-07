import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { Linking } from 'react-native'
import type { UIServices, UITaskState } from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { getFeedUrl } from '@worldbrain/memex-common/lib/content-sharing/utils'

export interface State {
    loadState: UITaskState
    hasActivity: boolean
}

export type Event = UIEvent<{
    pressBtn: null
}>

export interface Dependencies {
    customFeedOpener?: () => Promise<void>
    services: UIServices<'activityIndicator'>
}

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class Logic extends UILogic<State, Event> {
    constructor(private deps: Dependencies) {
        super()
    }

    getInitialState(): State {
        return {
            hasActivity: false,
            loadState: 'pristine',
        }
    }

    init: EventHandler<'init'> = async ({}) => {
        await loadInitial<State>(this, async () => {
            const status = await this.deps.services.activityIndicator.checkActivityStatus()
            this.emitMutation({
                hasActivity: { $set: status === 'has-unseen' },
            })
        })
    }

    pressBtn: EventHandler<'pressBtn'> = async ({ previousState }) => {
        if (previousState.hasActivity) {
            this.emitMutation({ hasActivity: { $set: false } })
            await this.deps.services.activityIndicator.markActivitiesAsSeen()
        }

        if (this.deps.customFeedOpener) {
            await this.deps.customFeedOpener()
        } else {
            await Linking.openURL(getFeedUrl())
        }
    }
}
