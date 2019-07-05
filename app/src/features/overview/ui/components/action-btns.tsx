import React from 'react'
import { ImageSourcePropType } from 'react-native'

import ActionBtn, { Props } from './action-btn'

const createBtn = (
    icon: ImageSourcePropType,
): React.StatelessComponent<Props> => props => (
    <ActionBtn iconSource={icon} {...props} />
)

export const StarBtn = createBtn(require('../img/star.png'))
export const FullStarBtn = createBtn(require('../img/star-full.png'))
export const CommentBtn = createBtn(require('../img/comment.png'))
export const EditBtn = createBtn(require('../img/edit.png'))
export const DeleteBtn = createBtn(require('../img/trash.png'))
export const TagBtn = createBtn(require('../img/tag.png'))
