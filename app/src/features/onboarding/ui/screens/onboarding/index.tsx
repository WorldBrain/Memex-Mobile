import React from 'react'

import { storageKeys } from '../../../../../../app.json'
import { NavigationScreen, NavigationProps, UIServices } from 'src/ui/types'
import OnboardingScreenLogic, { State, Event } from './logic'
import OnboardingLayout, {
    Props as OnboardingLayoutProps,
} from 'src/ui/layouts/onboarding'
import Welcome from '../../components/welcome'
import SaveWebsite from '../../components/save-websites'
import OrganizeContent from '../../components/organize-content'
import BetaOverview from '../../components/beta-overview'

interface Props extends NavigationProps {
    services: UIServices<'localStorage'>
}

export default class OnboardingScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new OnboardingScreenLogic(props) })
    }

    private finishOnboarding = async () => {
        await this.props.services.localStorage.set(
            storageKeys.showOnboarding,
            false,
        )

        await this.props.navigation.navigate('Sync')
    }

    private goToNextStage = async () => {
        if (this.state.onboardingStage + 1 > 3) {
            return this.finishOnboarding()
        }

        return this.processEvent('goToNextStage', {})
    }

    private renderOnboardingStage(
        props: Omit<
            OnboardingLayoutProps,
            'onNextPress' | 'onBackPress' | 'onSkipPress'
        >,
    ) {
        return (
            <OnboardingLayout
                {...props}
                screenIndex={this.state.onboardingStage - 1}
                onNextPress={this.goToNextStage}
                onBackPress={() => this.processEvent('goToPrevStage', {})}
                onSkipPress={this.finishOnboarding}
            />
        )
    }

    render() {
        switch (this.state.onboardingStage) {
            case 0:
                return (
                    <Welcome
                        onOnboardingPress={this.goToNextStage}
                        onGetSyncedPress={this.finishOnboarding}
                    />
                )
            case 1:
                return this.renderOnboardingStage({
                    screenIndex: 0,
                    children: <SaveWebsite />,
                })
            case 2:
                return this.renderOnboardingStage({
                    screenIndex: 1,
                    showBackBtn: true,
                    children: <OrganizeContent />,
                })
            case 3:
            default:
                return this.renderOnboardingStage({
                    screenIndex: 2,
                    showBackBtn: true,
                    children: <BetaOverview />,
                })
        }
    }
}
