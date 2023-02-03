import React from 'react'
import { Image } from 'react-native'

import { MainNavProps, UIServices, StatefulUIElement } from 'src/ui/types'
import OnboardingScreenLogic, { Dependencies, State, Event } from './logic'
import OnboardingLayout, {
    Props as OnboardingLayoutProps,
} from 'src/ui/layouts/onboarding'
import SyncLayout, { Props as SyncLayoutProps } from 'src/ui/layouts/sync'
import SaveWebsite from '../../components/save-websites'
import OrganizeContent from '../../components/organize-content'
import SyncOnboarding from '../../components/sync-onboarding'
import styles from './styles'

const pairImg = require('../../assets/device-pair.png')

export default class OnboardingScreen extends StatefulUIElement<
    Dependencies,
    State,
    Event
> {
    constructor(props: Dependencies) {
        super(props, new OnboardingScreenLogic(props))
    }

    private renderNewUserOnboardingStage = (
        props: Partial<
            Pick<
                OnboardingLayoutProps,
                'onSkipPress' | 'children' | 'showBackBtn'
            >
        >,
    ) => (
        <OnboardingLayout
            {...(props as any)}
            screenIndex={this.state.onboardingStage}
            onNextPress={() => this.processEvent('goToNextStage', null)}
            onBackPress={() => this.processEvent('goToPrevStage', null)}
            onSkipPress={() => {
                if (props.onSkipPress) {
                    props.onSkipPress()
                } else {
                    this.processEvent('goToLastStage', null)
                }
            }}
        />
    )

    private renderExistingUserOnboardingStage = (
        props: Pick<
            SyncLayoutProps,
            'btnText' | 'titleText' | 'subtitleText' | 'children'
        >,
    ) => (
        <SyncLayout
            {...props}
            onBtnPress={() => this.processEvent('goToNextStage', null)}
        />
    )

    private renderNewUserOnboarding() {
        switch (this.state.onboardingStage) {
            case 0:
                return this.renderNewUserOnboardingStage({
                    children: <SaveWebsite />,
                })
            case 1:
                return this.renderNewUserOnboardingStage({
                    showBackBtn: true,
                    children: <SyncOnboarding />,
                    onSkipPress: () =>
                        this.processEvent('finishOnboarding', null),
                })
        }
    }

    private renderExistingUserOnboarding() {
        switch (this.state.onboardingStage) {
            case 0:
                return this.renderExistingUserOnboardingStage({
                    titleText: '3+ device sync now available',
                    subtitleText:
                        'You can now sync your data between as many devices as you like. You need to resync your data before you can access it from this device.',
                    btnText: 'Start Sync',
                    children: (
                        <Image
                            resizeMode="contain"
                            style={styles.mainImg}
                            source={pairImg}
                        />
                    ),
                })
            case 1:
            default:
                return this.renderExistingUserOnboardingStage({
                    titleText: 'Login from your extension',
                    subtitleText:
                        'Before you can see all your data, you need to complete the sync from your Memex browser extension.',
                    btnText: 'Continue',
                    children: (
                        <Image
                            resizeMode="contain"
                            style={styles.mainImg}
                            source={pairImg}
                        />
                    ),
                })
        }
    }

    render() {
        if (this.state.isExistingUser) {
            return this.renderExistingUserOnboarding()
        }
        return this.renderNewUserOnboarding()
    }
}
