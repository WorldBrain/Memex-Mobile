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
    dropdownArrow: {},
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
    collectionTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: '700',
    },
    collectionTitle: {
        fontFamily: 'Poppins',
        fontWeight: '700',
        marginRight: 5,
        color: '$textColor',
        fontSize: '1.2rem',
    },
})
