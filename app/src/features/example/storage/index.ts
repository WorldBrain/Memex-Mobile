import { StorageModule, StorageModuleConfig, withHistory } from '@worldbrain/storex-pattern-modules'
import { TodoList, TodoItem } from '../types';
import history from './history'

export class TodoListStorage extends StorageModule {
    getConfig = () : StorageModuleConfig => withHistory({
        history,
        collections: {
            todoList: {
                version: new Date('2018-03-04'),
                fields: {
                    label: { type: 'text' },
                    default: { type: 'boolean' }
                }
            },
            todoItem: {
                version: new Date('2018-03-03'),
                fields: {
                    label: { type: 'text' },
                    done: { type: 'boolean' },
                },
                relationships: [
                    { alias: 'list', reverseAlias: 'items', childOf: 'todoList' }
                ]
            }
        },
        operations: {
            createList: {
                operation: 'createObject',
                collection: 'todoList',
            },
            findAllLists: {
                operation: 'findObjects',
                collection: 'todoList',
                args: {}
            },
            createItem: {
                operation: 'createObject',
                collection: 'todoItem',
            },
            findListItems: {
                operation: 'findObjects',
                collection: 'todoItem',
                args: {
                    list: '$list:pk'
                }
            },
            deleteListItem: {
                operation: 'deleteObject',
                collection: 'todoItem',
                args: { id: '$id:pk' }
            },
            setItemDone: {
                operation: 'updateObject',
                collection: 'todoItem',
                args: [
                    { id: '$id:pk' },
                    { done: '$done:boolean' }
                ]
            }
        }
    })

    async getOrCreateDefaultList(options : { defaultLabel : string }) : Promise<TodoList> {
        const defaultList = await this.getDefaultList()
        if (defaultList) {
            return defaultList
        }

        const { object: list } : { object : TodoList } = await this.operation('createList', { label: options.defaultLabel, default: true })
        const items : TodoItem[] = [
            await this.addListItem({ label: 'Cook spam', done: true }, { list }),
            await this.addListItem({ label: 'Buy eggs', done: false }, { list }),
        ]
        return { ...list, items }
    }

    async getDefaultList() : Promise<TodoList | null> {
        const allLists = await this.operation('findAllLists', {})
        if (!allLists.length) {
            return null
        }

        const defaultList = allLists.filter((list : TodoList) => list.default)[0]
        const items = await this.operation('findListItems', { list: defaultList.id })
        return { ...defaultList, items }
    }

    async addListItem(item : TodoItem, options : { list : TodoList }) {
        return (await this.operation('createItem', { ...item, list: options.list.id })).object
    }

    async removeListItem(item : TodoItem) {
        await this.operation('deleteListItem', { id: item.id })
    }

    async setItemDone(item : TodoItem, done : boolean) {
        await this.operation('setItemDone', { id: item.id, done })
    }
}
