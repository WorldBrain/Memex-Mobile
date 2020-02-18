import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'

export default EStyleSheet.create({
    container: {
        marginTop: Platform.OS === 'ios' ? 19 : 0,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    pageList: {
        width: '100%',
        marginBottom: 0,
    },
    mainLoadSpinner: {
        marginTop: 155,
    },
    loadMoreSpinner: {
        position: 'absolute',
        bottom: 60,
    },
    reloadSpinner: {
        marginVertical: 50,
    },
})
