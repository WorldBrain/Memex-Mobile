import moment from 'moment'

export const timeFromNow = (date: Date): string => moment(date).fromNow()
