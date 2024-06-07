import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        paddingVertical:
            conditionalStyles() === 'tabletLandscape'
                ? '0.4rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        height: '100%',
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
        paddingVertical:
            conditionalStyles() === 'tabletLandscape'
                ? '0.1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.1rem'
                : '0.3rem',
        borderRadius: 5,
        textAlign: 'left',
    },
    entryBackground: {
        backgroundColor: '#83c9f4',
    },
    entryText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
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
        fontSize: 20,
        color: '$textColor',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    canAdd: {
        marginLeft: 10,
    },
    addText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        fontWeight: 'bold',
    },
    checkMarkContainer: {
        width: '2.2rem',
        height: 'auto',
        padding: '0.2rem',
    },
    checkmark: {
        width: '100%',
        height: '100%',
    },
    checkmarkHidden: {
        display: 'none',
    },
})
