export type TodoList = {
    id?: any
    default?: boolean
    label: string
    items: TodoItem[]
}
export type TodoItem = { id?: any; label: string; done: boolean }
