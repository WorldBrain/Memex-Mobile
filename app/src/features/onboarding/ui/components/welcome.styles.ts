import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    logo: {
        height: 150,
        width: 200,
        backgroundColor: '#c4c4c4',
    },
    mainText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    btnContainer: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 35,
        width: '100%',
        height: 120,
    },
})
