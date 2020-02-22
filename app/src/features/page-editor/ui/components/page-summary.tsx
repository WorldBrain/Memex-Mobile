import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native'
import Navigation from 'src/features/overview/ui/components/navigation'
import styles from './page-summary.styles'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'

export interface Props extends PageBodyProps {
    onBackPress: (e: GestureResponderEvent) => void
    onAddPress?: (e: GestureResponderEvent) => void
    titleText: string
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <Navigation
        titleText={props.titleText}
        renderLeftIcon={() => (
            <TouchableOpacity
                onPress={props.onBackPress}
                style={navigationStyles.btnContainer}
            >
                <Image
                    style={navigationStyles.backIcon}
                    resizeMode="contain"
                    source={require('src/ui/img/arrow-back.png')}
                />
            </TouchableOpacity>
        )}
        renderRightIcon={() =>
            props.onAddPress && (
                <TouchableOpacity
                    onPress={props.onAddPress}
                    style={navigationStyles.btnContainer}
                >
                    <Image
                        resizeMode="contain"
                        style={navigationStyles.addIcon}
                        source={require('src/ui/img/plus.png')}
                    />
                </TouchableOpacity>
            )
        }
    />
)

export default MainLayout
