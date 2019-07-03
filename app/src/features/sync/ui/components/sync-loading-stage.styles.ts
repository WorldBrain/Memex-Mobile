import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 100,
        marginBottom: '50%',
    },
    icon: {
        width: 50,
        height: 50,
        backgroundColor: '#c4c4c4',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 50,
    },
})
