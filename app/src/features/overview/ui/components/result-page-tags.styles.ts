import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 5,
    },
    tagPill: {
        marginHorizontal: 5,
        backgroundColor: '#67B3E3',
        borderRadius: 4,
        width: 65,
        height: 22,
    },
    tagPillText: {
        textAlign: 'center',
        lineHeight: 20,
    },
})
