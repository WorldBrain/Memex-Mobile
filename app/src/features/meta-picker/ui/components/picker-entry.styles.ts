import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        paddingHorizontal: '1.5rem',
    },
    containerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    textContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    entry: {
        paddingHorizontal: '0.5rem',
        paddingVertical: height > 1000 ? '0.1rem' : '0.3rem',
        borderRadius: 5,
        textAlign: 'left',
    },
    entryBackground: {
        backgroundColor: '#83c9f4',
    },
    entryText: {
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
        color: '$textColor',
        fontWeight: '400',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        width: '100%',
    },
    emptyRowText: {
        width: '100%',
        fontSize: '1.4rem',
        color: '$textColor',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    canAdd: {
        marginLeft: 10,
    },
    addText: {
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
        fontWeight: 'bold',
    },
    checkMarkContainer: {
        width: '2.2rem',
        height: 'auto',
        padding: '0.3rem',
    },
    checkmark: {
        width: '100%',
        height: '100%',
    },
    checkmarkHidden: {
        display: 'none',
    },
})
