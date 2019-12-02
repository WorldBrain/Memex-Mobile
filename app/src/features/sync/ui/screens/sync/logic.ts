import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { Event as QRReadEvent } from 'react-native-qrcode-scanner'
import { storageKeys } from '../../../../../../app.json'

import { SyncStatus } from 'src/features/sync/types'
import { NavigationProps, UIServices } from 'src/ui/types'

export interface SyncScreenState {
    status: SyncStatus
    errMsg?: string
}
export type SyncScreenEvent = UIEvent<{
    setSyncStatus: { value: SyncStatus }
    doSync: { qrEvent: QRReadEvent }
    skip: {}
    startScanning: {}
    confirmSuccess: {}
}>

export interface SyncScreenDependencies extends NavigationProps {
    services: UIServices<'localStorage' | 'sync'>
    suppressErrorLogging?: boolean
}
export default class SyncScreenLogic extends UILogic<
    SyncScreenState,
    SyncScreenEvent
> {
    constructor(private dependencies: SyncScreenDependencies) {
        super()
    }

    getInitialState(): SyncScreenState {
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
            return
        }

        if (typeof globalThis !== 'undefined') {
            ;(globalThis as any).feedQrData = (data: string) =>
                this.processUIEvent('doSync', {
                    event: { qrEvent: { data } as any },
                    previousState: {} as any,
                })
        }
    }

    async cleanup() {
        delete (globalThis as any).feedQrData
    }

    async doSync(
        incoming: IncomingUIEvent<SyncScreenState, SyncScreenEvent, 'doSync'>,
    ) {
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
            if (!this.dependencies.suppressErrorLogging) {
                console.error('Error during initial sync')
                console.error(e)
            }
            this.emitMutation({
                status: { $set: 'failure' },
                errMsg: {
                    $set: `MSG: ${e.message}\nNAME: ${e.name} \n STACK: ${e.stack}`,
                },
            })
        }
    }

    confirmSuccess() {
        this.dependencies.navigation.navigate('MVPOverview')
    }

    startScanning(
        incoming: IncomingUIEvent<
            SyncScreenState,
            SyncScreenEvent,
            'startScanning'
        >,
    ): UIMutation<SyncScreenState> {
        return { status: { $set: 'scanning' } }
    }
}
