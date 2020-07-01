import { Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { actionBarHeight } from '../../components/action-bar.styles'

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    actionBar: {},
    webViewLoader: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    webView: {
        height: Dimensions.get('window').height - actionBarHeight,
        paddingTop: 40,
    },
})
