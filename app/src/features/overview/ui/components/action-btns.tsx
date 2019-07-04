import React from 'react'
import { ImageSourcePropType } from 'react-native'

import ActionBtn, { Props } from './action-btn'

const createBtn = (
    name: string,
    icon: ImageSourcePropType,
): React.StatelessComponent<Props> => props => (
    <ActionBtn iconSource={icon} {...props}>
        {name}
    </ActionBtn>
)

export const StarBtn = createBtn('Star', { uri: '' })
export const CommentBtn = createBtn('Note', { uri: '' })
export const EditBtn = createBtn('Edit', { uri: '' })
export const DeleteBtn = createBtn('Del', { uri: '' })
export const TagBtn = createBtn('Tag', { uri: '' })
