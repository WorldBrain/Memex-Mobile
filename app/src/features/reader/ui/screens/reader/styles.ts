import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

import { actionBarHeight } from '../../components/action-bar.styles'

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'black',
    },
    actionBar: {},
    webViewLoader: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    webView: {
        height: Dimensions.get('window').height - actionBarHeight,
        paddingTop: height > 1000 ? 20 : 40,
    },
})
