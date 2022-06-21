export interface MetaTypeShape {
    name: string
    isChecked: boolean
    canAdd?: boolean
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
    domain: string
    fullUrl: string
    createdAt: Date
}
