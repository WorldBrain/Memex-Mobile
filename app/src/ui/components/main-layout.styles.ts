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
    comingSoonText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    children: {
        height: 300,
    },
    progress: {
        height: 20,
    },
})
