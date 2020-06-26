import EStyleSheet from 'react-native-extended-stylesheet'

export const actionBarHeight = 90

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#DADADA',
        height: actionBarHeight,
        width: '100%',
        paddingBottom: 20,
        paddingHorizontal: 15,
    },
    leftBtns: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightBtns: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '50%',
    },
    actionBtn: {
        width: '3rem',
        height: '3rem',
        marginRight: 10,
    },
})
