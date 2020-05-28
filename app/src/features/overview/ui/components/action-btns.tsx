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

export const BackBtn = createBtn(require('../img/heart_empty.png'))
export const StarBtn = createBtn(require('../img/heart_empty.png'))
export const FullStarBtn = createBtn(require('../img/heart_full.png'))
export const CommentBtn = createBtn(require('../img/comment.png'))
export const FullCommentBtn = createBtn(require('../img/comment-full.png'))
export const HighlightBtn = createBtn(require('../img/edit_white.png'))
export const EditBtn = createBtn(require('../img/edit_white.png'))

export const TagBtn = createBtn(require('../img/tag.png'))
export const FullTagBtn = createBtn(require('../img/tag_full.png'))

export const DeleteActionBarBtn = createActionBarBtn(
    require('../img/trash.png'),
)
export const ListActionBarBtn = createActionBarBtn(
    require('../img/add_collection_white.png'),
)
export const EditNoteActionBarBtn = createActionBarBtn(
    require('../img/edit_white.png'),
)
export const ReaderActionBarBtn = createActionBarBtn(
    require('../img/heart_empty.png'),
)
