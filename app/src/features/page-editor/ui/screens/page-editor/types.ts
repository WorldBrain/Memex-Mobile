import { EditorMode } from 'src/features/page-editor/types'

export interface PageEditorNavigationParams {
    selectedList?: string
    pageUrl: string
    mode: EditorMode
}
