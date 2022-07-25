export interface Action {
    key: string
    title: string
    subtitle?: string
    onPress: () => void | Promise<void>
}

export interface ActionSheetShowOptions {
    actions: Action[]
    hideOnSelection?: boolean
    title?: string
}

export interface ActionSheetServiceInterface {
    show: (options: ActionSheetShowOptions) => void
    hide: () => void
}
