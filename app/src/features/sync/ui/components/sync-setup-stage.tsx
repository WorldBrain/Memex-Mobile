import React from 'react'
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

import MainLayout from 'src/features/onboarding/ui/components/main-layout'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncSetupStage: React.StatelessComponent<Props> = props => (
    <MainLayout
        btnText="Sync"
        titleText="Pair with computer"
        subtitleText={`Go to Memex "settings > Backup and Sync" and scan the QR code there`}
        {...props}
    />
)

export default SyncSetupStage
