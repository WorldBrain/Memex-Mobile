import { SheetManager } from 'react-native-actions-sheet'
import type { ActionSheetServiceInterface } from './types'

export class ActionSheetService implements ActionSheetServiceInterface {
    show: ActionSheetServiceInterface['show'] = (options) => {
        SheetManager.show('generic-action-sheet', options)
    }

    hide: ActionSheetServiceInterface['hide'] = () => {
        SheetManager.hide('generic-action-sheet')
    }
}
