import React from 'react'

import { NavigationScreen, MainNavProps, UIServices } from 'src/ui/types'
import OnboardingScreenLogic, { State, Event } from './logic'
import OnboardingLayout, {
    Props as OnboardingLayoutProps,
} from 'src/ui/layouts/onboarding'
import SaveWebsite from '../../components/save-websites'
import OrganizeContent from '../../components/organize-content'
import SyncOnboarding from '../../components/sync-onboarding'

interface Props extends MainNavProps<'Onboarding'> {
    services: UIServices<'localStorage'>
}

export default class OnboardingScreen extends NavigationScreen<
    Props,
    State,
    Event,
    'Onboarding'
> {
    constructor(props: Props) {
        super(props, { logic: new OnboardingScreenLogic(props) })
    }

    private renderOnboardingStage(
        props: Partial<
            Omit<
                OnboardingLayoutProps,
                'onNextPress' | 'onBackPress' | 'screenIndex'
            >
        >,
    ) {
        return (
            <OnboardingLayout
                {...(props as any)}
                screenIndex={this.state.onboardingStage}
                onNextPress={() => this.processEvent('goToNextStage', {})}
                onBackPress={() => this.processEvent('goToPrevStage', {})}
                onSkipPress={() => {
                    if (props.onSkipPress) {
                        props.onSkipPress()
                    } else {
                        this.processEvent('goToLastStage', {})
                    }
                }}
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
                    onSkipPress: () =>
                        this.processEvent('finishOnboarding', {
                            nextView: 'Dashboard',
                        }),
                })
        }
    }
}
