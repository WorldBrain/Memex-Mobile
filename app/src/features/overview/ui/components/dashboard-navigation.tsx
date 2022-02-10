import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

import Navigation, { Props as NavProps } from './navigation'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export interface Props extends NavProps {
    icon: 'exit' | 'settings'
    onRightIconPress: () => void
    onLeftIconPress?: () => void
}

const DashboardNavigation: React.StatelessComponent<Props> = (props) => (
    <Container>
        <Navigation
            {...props}
            leftIcon={icons.Burger}
            leftBtnPress={props.onLeftIconPress}
            leftIconSize={'26px'}
            rightIcon={icons.Settings}
            rightBtnPress={props.onRightIconPress}
        />
    </Container>
)

const Container = styled.SafeAreaView``

export default DashboardNavigation
