import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    cameraViewContainer: {
        position: 'relative',
        top: 60,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d4d4d4',
        width: '100%',
        height: 600,
        display: 'flex',
    },
    cameraView: {
        flex: 1,
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
