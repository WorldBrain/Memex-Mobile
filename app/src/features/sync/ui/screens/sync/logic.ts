import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { Event as QRReadEvent } from 'react-native-qrcode-scanner'
import { storageKeys } from '../../../../../../app.json'

import { SyncStatus } from 'src/features/sync/types'
import { NavigationProps, UIServices } from 'src/ui/types'

export interface State {
    status: SyncStatus
}
export type Event = UIEvent<{
    setSyncStatus: { value: SyncStatus }
    doSync: { qrEvent: QRReadEvent }
    skip: {}
    startScanning: {}
    confirmSuccess: {}
}>

export interface SyncScreenDependencies extends NavigationProps {
    services: UIServices<'localStorage' | 'sync'>
}
export default class SyncScreenLogic extends UILogic<State, Event> {
    constructor(private dependencies: SyncScreenDependencies) {
        super()
    }

    getInitialState(): State {
        return {
            status: 'setup',
        }
    }

    async init() {
        const syncKey = await this.dependencies.services.localStorage.get<
            boolean
        >(storageKeys.syncKey)

        if (syncKey) {
            this.dependencies.navigation.navigate('MVPOverview')
        }
    }

    async doSync(incoming: IncomingUIEvent<State, Event, 'doSync'>) {
        this.emitMutation({ status: { $set: 'syncing' } })
        try {
            await this.dependencies.services.sync.initialSync.answerInitialSync(
                {
                    initialMessage: incoming.event.qrEvent.data,
                },
            )
            await this.dependencies.services.sync.initialSync.waitForInitialSync()
            await this.dependencies.services.localStorage.set(
                storageKeys.syncKey,
                true,
            )
            await this.emitMutation({ status: { $set: 'success' } })
        } catch (e) {
            this.emitMutation({ status: { $set: 'failure' } })
        }
    }

    confirmSuccess() {
        this.dependencies.navigation.navigate('MVPOverview')
    }

    startScanning(
        incoming: IncomingUIEvent<State, Event, 'startScanning'>,
    ): UIMutation<State> {
        return { status: { $set: 'scanning' } }
    }
}
