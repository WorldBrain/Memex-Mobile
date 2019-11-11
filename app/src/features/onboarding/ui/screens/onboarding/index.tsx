import React from 'react'

import { NavigationScreen, NavigationProps, UIServices } from 'src/ui/types'
import OnboardingScreenLogic, { State, Event } from './logic'
import GifLayout, { Props as GifLayoutProps } from '../../components/gif-layout'
import Welcome from '../../components/welcome'
import { OnboardingStage } from 'src/features/onboarding/types'

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

    private renderOnboardingStage(props: Omit<GifLayoutProps, 'onBtnPress'>) {
        return (
            <GifLayout
                {...props}
                screenIndex={this.state.onboardingStage - 1}
                onBtnPress={() => this.processEvent('goToNextStage', {})}
                showScreenProgress
            />
        )
    }

    render() {
        switch (this.state.onboardingStage) {
            case 0:
                return (
                    <Welcome
                        onGetStartedPress={() =>
                            this.processEvent('goToNextStage', {})
                        }
                    />
                )
            case 1:
                return this.renderOnboardingStage({
                    titleText: 'Save websites on the go',
                    subtitleText:
                        "Easily save websites with your device's sharing features",
                    btnText: 'Next',
                })
            case 2:
                return this.renderOnboardingStage({
                    titleText: 'Highlight and add notes',
                    subtitleText:
                        'Highlight any text in your browser and attach notes',
                    btnText: 'Next',
                    isComingSoon: true,
                })
            case 3:
            default:
                return this.renderOnboardingStage({
                    titleText: 'Search your knowledge',
                    subtitleText:
                        'Sync your history & notes between desktop and mobile app',
                    btnText: this.state.isSynced
                        ? 'Close Tutorial'
                        : 'Continue to Setup',
                    isComingSoon: true,
                })
        }
    }
}
