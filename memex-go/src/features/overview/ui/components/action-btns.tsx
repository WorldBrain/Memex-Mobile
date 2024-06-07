import React from 'react'
import { ImageSourcePropType, Text } from 'react-native'

import { ActionBtn, Props } from './action-btn'
import styles from './action-btn.styles'

export type ActionBtnComponent = React.StatelessComponent<Props>

const createActionBarBtn = (icon: ImageSourcePropType): ActionBtnComponent => (
    props,
) => (
    <ActionBtn
        {...props}
        iconSource={icon}
        className={styles.actionBarBtn}
        imgClassName={styles.iconBarButton}
    />
)

export const BackBtn = createActionBarBtn(require('src/ui/img/arrow-back.png'))
export const StarBtn = createActionBarBtn(require('../img/heart_empty.png'))
export const StarBtnFull = createActionBarBtn(require('../img/heart_full.png'))
export const CommentBtn = createActionBarBtn(require('../img/comment.png'))
export const FullCommentBtn = createActionBarBtn(
    require('../img/comment-full.png'),
)
export const HighlightBtn = createActionBarBtn(
    require('src/ui/img/highlight.png'),
)
export const EditBtn = createActionBarBtn(require('../img/edit_white.png'))
export const AnnotateBtn = createActionBarBtn(
    require('src/ui/img/add_comment.png'),
)
export const AnnotateBtnFull = createActionBarBtn(
    require('src/ui/img/comment_full.png'),
)
export const AddListBtn = createActionBarBtn(require('src/ui/img/add_list.png'))
export const AddListBtnFull = createActionBarBtn(
    require('src/ui/img/collection_full.png'),
)

export const VisitActionBarBtn = createActionBarBtn(
    require('src/ui/img/openWhite.png'),
)

export const EyeBtn = createActionBarBtn(require('src/ui/img/eye.png'))
export const EyeWhiteBtn = createActionBarBtn(
    require('src/ui/img/annotateWhite.png'),
)

export const TagBtn = createActionBarBtn(require('src/ui/img/tag_empty.png'))
export const TagBtnFull = createActionBarBtn(require('src/ui/img/tag_full.png'))
export const TagBtnWhite = createActionBarBtn(
    require('src/ui/img/tagEmptyWhite.png'),
)
export const TagBtnFullWhite = createActionBarBtn(
    require('src/ui/img/tagFullWhite.png'),
)

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
    require('src/ui/img/annotateWhite.png'),
)
