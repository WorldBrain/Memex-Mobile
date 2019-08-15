import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: 80,
    },
    ballSelected: {
        backgroundColor: '#36362f',
    },
    ball: {
        backgroundColor: '#c4c4c4',
        borderRadius: 25,
        width: 15,
        height: 15,
    },
    ballBig: {
        width: 20,
        height: 20,
    },
})
