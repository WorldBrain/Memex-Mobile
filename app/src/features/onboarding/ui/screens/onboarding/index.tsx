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
import SyncOnboarding from '../../components/sync-onboarding'

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

    private renderOnboardingStage(
        props: Omit<
            OnboardingLayoutProps,
            'onNextPress' | 'onBackPress' | 'onSkipPress' | 'screenIndex'
        >,
    ) {
        return (
            <OnboardingLayout
                {...props}
                screenIndex={this.state.onboardingStage}
                onNextPress={() => this.processEvent('goToNextStage', {})}
                onBackPress={() => this.processEvent('goToPrevStage', {})}
                onSkipPress={() => this.processEvent('finishOnboarding', {})}
            />
        )
    }

    render() {
        switch (this.state.onboardingStage) {
            case 0:
                return this.renderOnboardingStage({
                    children: <SaveWebsite />,
                })
            case 1:
                return this.renderOnboardingStage({
                    showBackBtn: true,
                    children: <OrganizeContent />,
                })
            case 2:
            default:
                return this.renderOnboardingStage({
                    showBackBtn: true,
                    children: <SyncOnboarding />,
                })
        }
    }
}
