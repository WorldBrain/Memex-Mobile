import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    favIcon: {},
    contentBox: {
        minHeight: height > 1000 ? '3rem' : '5.5rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    titleText: {
        fontWeight: '700',
        fontSize: height > 1000 ? '0.7rem' : '1.2rem',
        letterSpacing: 0.6,
        flexWrap: 'wrap',
        overflow: 'hidden',
        color: '#3A2F45',
        fontFamily: 'Poppins',
    },
    linkText: {
        color: '#3A2F45',
        letterSpacing: 0.6,
        fontSize: height > 1000 ? '0.7rem' : '1.2rem',
    },
    date: {
        color: '#3A2F45',
        opacity: 0.7,
        fontSize: height > 1000 ? '0.6rem' : '1.1rem',
    },
})
