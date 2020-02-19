import React from 'react'
import { ImageSourcePropType } from 'react-native'

import { ActionBtn, ActionBarBtn, Props } from './action-btn'

const createBtn = (
    icon: ImageSourcePropType,
): React.StatelessComponent<Props> => props => (
    <ActionBtn iconSource={icon} {...props} />
)

const createActionBarBtn = (
    icon: ImageSourcePropType,
): React.StatelessComponent<Props> => props => (
    <ActionBarBtn iconSource={icon} {...props} />
)

export const StarBtn = createBtn(require('../img/heart_empty.png'))
export const FullStarBtn = createBtn(require('../img/heart_full.png'))
export const CommentBtn = createBtn(require('../img/comment.png'))
export const FullCommentBtn = createBtn(require('../img/comment-full.png'))
export const EditBtn = createBtn(require('../img/edit.png'))
export const DeleteBtn = createActionBarBtn(require('../img/trash.png'))
export const ListBtn = createActionBarBtn(
    require('../img/add_collection_white.png'),
)
export const EditNoteBtn = createActionBarBtn(require('../img/edit.png'))
export const TagBtn = createBtn(require('../img/tag.png'))
export const FullTagBtn = createBtn(require('../img/tag_full.png'))
