import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        position: 'absolute',
        left: 15,
        right: 15,
        top: 10,
        bottom: 200,
        borderRadius: 10,
        height: '50%',
    },
    stretched: {
        bottom: 20,
    },
    modal: {
        backgroundColor: 'transparent',
    },
})
