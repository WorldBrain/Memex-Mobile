import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Button as StdButton,
} from 'react-native'

import Button from 'src/ui/components/memex-btn'
import styles from './sync-success-stage.styles'

export interface Props {
    onBtnPress: (e: any) => void
    onBackBtnPress?: (e: any) => void
    allowRePairing?: boolean
}

const SyncSuccessStage: React.StatelessComponent<Props> = (props) => (
    <View style={styles.container}>
        {props.onBackBtnPress && (
            <TouchableOpacity style={styles.backBtn}>
                <StdButton title="Go Back" onPress={props.onBackBtnPress} />
            </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
            <View style={styles.icon}>
                <Image
                    style={styles.successIcon}
                    source={require('../assets/successIcon.png')}
                />
            </View>
            <Text style={styles.text}>
                Pairing successful. {'\n'}You're ready to go!
            </Text>
        </View>
        {props.allowRePairing ? (
            <Button
                title="Pair with new device"
                onPress={props.onBtnPress}
                warning
            />
        ) : (
            <Button title="Get Started" onPress={props.onBtnPress} />
        )}
    </View>
)

export default SyncSuccessStage
