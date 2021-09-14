import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 20,
        marginTop: 40,
        maxHeight: 40,
    },
    mainContainerBtm: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#f2f2f2',
        maxHeight: 80,
    },
    topContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 100,
    },
    bottomContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    collectionsBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    collectionsIcon: {
        height: 25,
        width: 25,
        marginRight: 5,
        opacity: 0.3,
    },
    collectionsText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})
