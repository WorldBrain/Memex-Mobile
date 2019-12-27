import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    imgContainer: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    textContainer: {
        flex: 4,
        flexDirection: 'column',
        width: '70%',
    },
    headingText: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 20,
    },
    secondaryText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
})
