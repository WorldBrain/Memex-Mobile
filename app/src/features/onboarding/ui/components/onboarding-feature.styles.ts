import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgContainer: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    textContainer: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        width: '90%',
    },
    optional: {
        position: 'relative',
        fontWeight: 'bold',
        color: '#5cd9a6',
        textAlign: 'center',
        fontSize: 30,
    },
    headingText: {
        position: 'relative',
        fontWeight: 'bold',
        color: '#3A2F45',
        textAlign: 'center',
        fontSize: 28,
        top: '3%',
        width: '100%',
    },
    secondaryText: {
        position: 'relative',
        color: '#3A2F45',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 25,
        lineHeight: 30,
    },
})
