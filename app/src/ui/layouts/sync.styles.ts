import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    titleText: {
        position: 'absolute',
        top: '8%',
        fontSize: 25,
        width: '70%',
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitleText: {
        position: 'relative',
        top: 20,
        fontSize: 18,
        marginBottom: 30,
        marginTop: 30,
        marginHorizontal: 50,
        textAlign: 'center',
    },
    children: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        top: '10%',
        height: '50%',
    },
    cancelButton: {
        position: 'relative',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        height: '30%',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
    },
})
