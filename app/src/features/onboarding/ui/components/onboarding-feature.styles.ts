import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    imgContainer: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative',
        top: '8%',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '90%',
    },
    headingText: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontSize: 30,
        marginTop: 40,
    },
    betaText: {
        fontWeight: 'bold',
        color: '#5ac6a4',
        textAlign: 'center',
        fontSize: 30,
        marginBottom: 20,
    },
    secondaryText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        marginTop: 15,
    },
})
