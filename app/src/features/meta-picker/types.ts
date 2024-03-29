export interface SpacePickerEntry {
    id: number
    name: string
    remoteId?: string
    isChecked: boolean
}

export interface Tag {
    url: string
    name: string
}

export interface List {
    id: number
    name: string
    remoteId?: string
    isDeletable?: boolean
    isNestable?: boolean
    createdAt: Date
    description: string
}

export interface ListEntry {
    listId: number
    pageUrl: string
    domain: string
    fullUrl: string
    createdAt: Date
}

export interface AnnotListEntry {
    listId: number
    url: string
    createdAt: Date
}
