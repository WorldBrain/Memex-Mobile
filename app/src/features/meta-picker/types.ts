export interface SpacePickerEntry {
    id: number
    name: string
    isChecked: boolean
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
