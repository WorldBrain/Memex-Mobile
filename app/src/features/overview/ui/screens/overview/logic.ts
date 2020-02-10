import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { NavigationProps, UIServices, UIStorageModules } from 'src/ui/types'
import { storageKeys } from '../../../../../../app.json'

import { ResultType } from '../../../types'

export interface State {
    selectedResultType: ResultType
    showCollectionsView: boolean
    showSideMenu: boolean
}
export type Event = UIEvent<{
    setResultType: { resultType: ResultType }
    setShowCollectionsView: { show: boolean }
    setShowSideMenu: { show: boolean }
}>

export interface Props extends NavigationProps {
    services: UIServices<'localStorage'>
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            showCollectionsView: false,
            showSideMenu: false,
            selectedResultType: 'special',
        }
    }

    async init() {
        await this.navToOnboardingIfNeeded()
    }

    private async navToOnboardingIfNeeded() {
        const showOnboarding = await this.props.services.localStorage.get<
            boolean
        >(storageKeys.showOnboarding)

        if (showOnboarding || showOnboarding === null) {
            this.props.navigation.navigate('Onboarding')
        }
    }

    setResultType(
        incoming: IncomingUIEvent<State, Event, 'setResultType'>,
    ): UIMutation<State> {
        return { selectedResultType: { $set: incoming.event.resultType } }
    }

    setShowCollectionsView(
        incoming: IncomingUIEvent<State, Event, 'setShowCollectionsView'>,
    ): UIMutation<State> {
        return { showCollectionsView: { $set: incoming.event.show } }
    }

    setShowSideMenu(
        incoming: IncomingUIEvent<State, Event, 'setShowSideMenu'>,
    ): UIMutation<State> {
        return { showSideMenu: { $set: incoming.event.show } }
    }
}
