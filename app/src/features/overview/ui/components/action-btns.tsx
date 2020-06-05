import React from 'react'
import { ImageSourcePropType } from 'react-native'

import { ActionBtn, Props } from './action-btn'
import styles from './action-btn.styles'

export type ActionBtnComponent = React.StatelessComponent<Props>

const createBtn = (icon: ImageSourcePropType): ActionBtnComponent => props => (
    <ActionBtn iconSource={icon} {...props} />
)

const createActionBarBtn = (
    icon: ImageSourcePropType,
): ActionBtnComponent => props => (
    <ActionBtn
        {...props}
        iconSource={icon}
        className={styles.actionBarBtn}
        imgClassName={styles.iconBarButton}
    />
)

export const BackBtn = createBtn(require('src/ui/img/arrow-back.png'))
export const StarBtn = createBtn(require('../img/heart_empty.png'))
export const FullStarBtn = createBtn(require('../img/heart_full.png'))
export const CommentBtn = createBtn(require('../img/comment.png'))
export const FullCommentBtn = createBtn(require('../img/comment-full.png'))
export const HighlightBtn = createBtn(require('src/ui/img/highlight.png'))
export const EditBtn = createBtn(require('../img/edit_white.png'))
export const AnnotateBtn = createBtn(require('src/ui/img/add_comment.png'))
export const AddListBtn = createBtn(require('src/ui/img/add_list.png'))

export const EyeBtn = createBtn(require('src/ui/img/eye.png'))
export const EyeWhiteBtn = createBtn(require('src/ui/img/eye_white.png'))

export const TagBtn = createBtn(require('src/ui/img/tag_empty.png'))
export const FullTagBtn = createBtn(require('src/ui/img/tag_full.png'))

export const DeleteActionBarBtn = createActionBarBtn(
    require('../img/trash.png'),
)
export const AddListActionBarWhiteBtn = createActionBarBtn(
    require('../img/add_collection_white.png'),
)
export const FullListActionBarWhiteBtn = createActionBarBtn(
    require('src/ui/img/folder_full_white.png'),
)
export const EditNoteActionBarBtn = createActionBarBtn(
    require('../img/edit_white.png'),
)
export const ReaderActionBarBtn = createActionBarBtn(
    require('src/ui/img/eye_white.png'),
)
