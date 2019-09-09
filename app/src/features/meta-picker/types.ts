export type MetaType = 'tags' | 'collections'
export type MetaTypeName = 'Tags' | 'Collections'

export interface MetaTypeShape {
    name: string
    isChecked: boolean
}

export interface Tag {
    url: string
    name: string
}

export interface List {
    id: number
    name: string
    isDeletable?: boolean
    isNestable?: boolean
    createdAt: Date
}

export interface ListEntry {
    listId: number
    pageUrl: string
    fullUrl: string
    createdAt: Date
}
