import { Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    outsideCameraContainer: {
        top: 50,
        maxHeight: '70%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    cameraViewContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraView: {
        width: Platform.OS === 'ios' ? 250 : 1,
        height: '100%',
    },
    instructionText: {
        position: 'relative',
        top: 40,
        fontSize: 18,
        textAlign: 'center',
        marginLeft: '10%',
        marginRight: '10%',
    },
})
