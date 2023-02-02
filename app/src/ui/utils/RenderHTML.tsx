import RenderHtml from 'react-native-render-html'
import { CORE_THEME } from '@worldbrain/memex-common/lib/common-ui/styles/theme'

import React from 'react'
import { Dimensions } from 'react-native'

export const RenderHTML = (html: string) => {
    return (
        <RenderHtml
            contentWidth={Dimensions.get('screen').width - 60}
            source={{
                html: `<div>` + html + '</div>',
            }}
            tagsStyles={RenderHTMLStyles}
            baseStyle={{
                marginTop: '-10px',
                marginBottom: '-10px',
                lineHeight: 20,
                fontWeight: '300',
            }}
        />
    )
}

const RenderHTMLStyles = {
    p: {
        color: `${CORE_THEME().colors.white}`,
    },
    a: {
        color: `${CORE_THEME().colors.prime1}`,
        textDecorationLine: 'none',
    },
    h1: {
        fontSize: '18px',
    },
    h2: {
        fontSize: '16px',
    },
    h3: {
        fontSize: '14px',
    },
    h4: {
        fontSize: '12px',
    },
    h5: {
        fontSize: '12px',
    },
    table: {
        borderRadius: '8px',
        borderColor: `${CORE_THEME().colors.greyScale2}`,
        borderWidth: '1px',
        width: '100%',
    },
    th: {
        padding: '8px 10px',
        color: `${CORE_THEME().colors.white}`,
        borderBottomColor: `${CORE_THEME().colors.greyScale2}`,
        borderBottomWidth: '1px',
    },
    td: {
        padding: '8px 10px',
        color: `${CORE_THEME().colors.white}`,
        borderBottomColor: `${CORE_THEME().colors.greyScale2}`,
        borderBottomWidth: '1px',
        borderLeftColor: `${CORE_THEME().colors.greyScale2}`,
        borderLeftWidth: '1px',
    },
}
