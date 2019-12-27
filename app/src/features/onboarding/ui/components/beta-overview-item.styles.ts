import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    checkCircle: {
        height: 34,
        width: 34,
        borderRadius: 25,
        marginRight: 10,
        position: 'relative',
    },
    checkCircleChecked: {
        backgroundColor: '#5CD9A6',
    },
    checkCircleEmpty: {
        backgroundColor: '#2C49AB',
    },
    tick: {
        position: 'absolute',
        left: 8,
        top: 11,
    },
    textContainer: {},
    headingText: {
        color: '#091D62',
        fontWeight: 'bold',
        fontSize: 18,
    },
    secondaryText: {
        color: '#091D62',
        fontSize: 16,
    },
    textChecked: {
        color: 'white',
    },
})
