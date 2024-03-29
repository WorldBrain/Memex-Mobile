import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native'
import styles from './main-layout.styles'
import PageSummary, { Props as PageSummaryProps } from './page-summary'
import styled from 'styled-components/native'
import Navigation from 'src/features/overview/ui/components/navigation'
import * as icons from 'src/ui/components/icons/icons-list'

export interface Props extends PageBodyProps {
    onLeftPress: () => void
    onRightPress?: () => void | undefined
    titleText: string
    rightIcon: React.FC
}

export interface Props extends PageSummaryProps {}

const MainLayout: React.StatelessComponent<Props> = (props) => (
    <Container>
        <Navigation
            leftIcon={icons.BackArrow}
            leftIconSize={'24px'}
            leftIconStrokeWidth={'0px'}
            leftBtnPress={props.onLeftPress}
            titleText={props.titleText}
            rightIcon={props.rightIcon}
            rightBtnPress={props.onRightPress}
            rightIconColor={'prime1'}
            rightIconStrokeWidth={'0px'}
        />
        {/* <View style={styles.pageContainer}>
            <PageSummary {...props} />
        </View> */}
        <MainLayoutContainer>{props.children}</MainLayoutContainer>
    </Container>
)

const Container = styled.SafeAreaView`
    height: 100%;
    background: ${(props) => props.theme.colors.black};
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const MainLayoutContainer = styled.View`
    display: flex;
    flex-direction: column;
    z-index: 1;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    max-width: 400px;
`

export default MainLayout
