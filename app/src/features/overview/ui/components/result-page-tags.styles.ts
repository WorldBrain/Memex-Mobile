import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap',
        lineHeight: 30,
        marginTop: 10,
    },
    tagPill: {
        marginRight: 5,
        marginTop: 5,
        backgroundColor: '#67B3E3',
        color: '#3A2F45',
        borderRadius: 4,
        paddingVertical: 1,
        paddingHorizontal: 10,
    },
    tagPillText: {
        textAlign: 'center',
        lineHeight: 22,
    },
})
