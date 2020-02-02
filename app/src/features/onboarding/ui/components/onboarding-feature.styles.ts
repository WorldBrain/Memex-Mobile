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
    optional: {
        fontWeight: 'bold',
        color: '#5cd9a6',
        textAlign: 'center',
        fontSize: 30,
        marginTop: 40,
        marginBottom: -30,
    },
    headingText: {
        fontWeight: 'bold',
        color: '#3A2F45',
        textAlign: 'center',
        fontSize: 28,
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
        color: '#3A2F45',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 25,
        lineHeight: 30,
    },
})
