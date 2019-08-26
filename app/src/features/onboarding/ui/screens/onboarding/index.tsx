import React from 'react'

import { storageKeys } from '../../../../../../app.json'
import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import GifLayout, { Props as GifLayoutProps } from '../../components/gif-layout'
import Welcome from '../../components/welcome'
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

    private async finishOnboarding() {
        await this.props.services.localStorage.set(
            storageKeys.showOnboarding,
            false,
        )

        return this.props.navigation.navigate('Sync')
    }

    private goToNextStage = () => {
        let value = (this.state.onboardingStage + 1) as OnboardingStage

        if (value > 3) {
            return this.finishOnboarding()
        }

        this.processEvent('setOnboardingStage', { value })
    }

    private renderOnboardingStage(props: Omit<GifLayoutProps, 'onBtnPress'>) {
        return (
            <GifLayout
                {...props}
                screenIndex={this.state.onboardingStage - 1}
                onBtnPress={this.goToNextStage}
                showScreenProgress
            />
        )
    }

    render() {
        switch (this.state.onboardingStage) {
            case 0:
                return <Welcome onGetStartedPress={this.goToNextStage} />
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
                    btnText: 'Continue to Setup',
                    isComingSoon: true,
                })
        }
    }
}
