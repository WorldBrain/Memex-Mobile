import React from 'react';
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

import MainLayout from './main-layout'

export interface Props {
    btnText: string
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SavePagesStage: React.StatelessComponent<Props> = props => (
    <MainLayout
        titleText="Save websites on the go"
        subtitleText="Easily save websites with your device's sharing features"
        {...props}
    />
)

export default SavePagesStage
