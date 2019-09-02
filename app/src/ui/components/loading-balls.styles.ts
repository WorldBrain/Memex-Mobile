import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        position: 'relative',
        width: 80,
    },
    ballSelected: {
        backgroundColor: '#36362f',
    },
    ball: {
        position: 'absolute',
        backgroundColor: '#c4c4c4',
        borderRadius: 25,
        width: 15,
        height: 15,
        top: '50%',
        bottom: '50%',
    },
})
