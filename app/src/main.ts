import { createStorage } from './storage'
import { createServices } from './services'
import { UI } from './ui'

export async function main() {
    const ui = new UI()
    const storage = await createStorage({
        backendType: 'memory',
        dbName: 'memex',
    })
    const services = await createServices({})
    ui.initialize({ dependencies: { storage, services } })
}
