import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitleText: {
        fontSize: 18,
        marginHorizontal: 60,
        textAlign: 'center',
    },
    gif: {
        height: 300,
        width: 300,
        backgroundColor: '#c4c4c4',
    },
})
