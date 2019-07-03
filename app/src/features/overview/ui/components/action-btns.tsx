import React from 'react'
import { ImageSourcePropType } from 'react-native'

import ActionBtn, { Props } from './action-btn'

const createBtn = (
    icon: ImageSourcePropType,
): React.StatelessComponent<Props> => props => (
    <ActionBtn iconSource={icon} {...props} />
)

export const StarBtn = createBtn({ uri: '' })
export const CommentBtn = createBtn({ uri: '' })
export const EditBtn = createBtn({ uri: '' })
export const DeleteBtn = createBtn({ uri: '' })
export const TagBtn = createBtn({ uri: '' })
