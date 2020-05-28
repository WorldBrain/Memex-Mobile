import EStyleSheet from 'react-native-extended-stylesheet'

export const actionBarHeight = 50

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
        paddingHorizontal: 10,
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
    },
    actionBtn: {
        width: '3rem',
        height: '3rem',
    },
})
