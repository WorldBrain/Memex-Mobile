import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import GifLayout, { Props as GifLayoutProps } from '../../components/gif-layout'
import { OnboardingStage } from 'src/features/onboarding/types'

interface Props {}

export default class OnboardingScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private goToNextStage = () => {
        let value = (this.state.onboardingStage + 1) as OnboardingStage

        if (value > 2) {
            return this.props.navigation.navigate('Sync')
        }

        this.processEvent('setOnboardingStage', { value })
    }

    private renderOnboardingStage(props: Omit<GifLayoutProps, 'onBtnPress'>) {
        return (
            <GifLayout
                {...props}
                screenIndex={this.state.onboardingStage}
                onBtnPress={this.goToNextStage}
                showScreenProgress
            />
        )
    }

    render() {
        switch (this.state.onboardingStage) {
            case 0:
                return this.renderOnboardingStage({
                    titleText: 'Save websites on the go',
                    subtitleText:
                        "Easily save websites with your device's sharing features",
                    btnText: 'Next',
                })
            case 1:
                return this.renderOnboardingStage({
                    titleText: 'Highlight and add notes',
                    subtitleText:
                        'Highlight any text in your browser and attach notes',
                    btnText: 'Next',
                    isComingSoon: true,
                })
            case 2:
            default:
                return this.renderOnboardingStage({
                    titleText: 'Search your knowledge',
                    subtitleText:
                        'Sync your history & notes between desktop and mobile app',
                    btnText: 'Continue to Setup',
                    isComingSoon: true,
                })
        }
    }
}
