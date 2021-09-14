import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

console.log(Dimensions.get('window'))
console.log(aspectRatio)

export default EStyleSheet.create({
    titleText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '2rem',
        width: '70%',
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitleText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.7rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1rem'
                : '1.3rem',
        marginBottom: '2rem',
        marginTop:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '2rem',
        marginHorizontal: '3rem',
        textAlign: 'center',
        color: '#a2a2a2',
    },
    children: {
        marginTop: '3rem',
        alignItems: 'center',
        maxHeight: height < 600 ? '40%' : '50%',
        width: '20rem',
        display: 'flex',
    },
    cancelButton: {
        position: 'relative',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        height: '30%',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
    },
    buttonText: {
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        height: '30%',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
    },
})
