import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 100,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    icon: {
        width: 50,
        height: 50,
        backgroundColor: '#c4c4c4',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 15,
        paddingHorizontal: 50,
    },
})
