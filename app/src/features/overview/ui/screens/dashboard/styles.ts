import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        marginTop: Platform.OS === 'ios' && height < 1000 ? 20 : 0,
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
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
    },
})
