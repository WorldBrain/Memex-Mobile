export interface Action {
    key: string
    title: string
    icon?: any
    subtitle?: string
    onPress: () => void | Promise<void>
}

export interface ActionSheetShowOptions {
    actions: Action[]
    hideOnSelection?: boolean
    title?: string
    selectedOnLoad?: string
}

export interface ActionSheetServiceInterface {
    show: (options: ActionSheetShowOptions) => void
    hide: () => void
}
