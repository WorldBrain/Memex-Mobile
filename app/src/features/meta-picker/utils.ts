import { MetaTypeName, MetaType } from './types'

export const getMetaTypeName = (type: MetaType): MetaTypeName =>
    type === 'collections' ? 'Spaces' : 'Tags'
