import React, { useMemo } from 'react'
import RenderHtml from 'react-native-render-html'
import { Dimensions } from 'react-native'
import { theme } from '../components/theme/theme'

export const RenderHTML = (html: string) => {
    const renderedHTML = useMemo(
        () => (
            <RenderHtml
                contentWidth={Dimensions.get('screen').width - 60}
                source={{ html }}
                baseStyle={{
                    lineHeight: 20,
                    fontWeight: '300',
                    color: `${theme.colors.white}`,
                }}
            />
        ),
        [html],
    )

    return renderedHTML
}

export const RenderHTMLStyles = {
    p: {
        color: `${theme.colors.white}`,
    },
    a: {
        color: `${theme.colors.prime1}`,
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
        borderColor: `${theme.colors.greyScale2}`,
        borderWidth: '1px',
        width: '100%',
    },
    th: {
        padding: '8px 10px',
        color: `${theme.colors.white}`,
        borderBottomColor: `${theme.colors.greyScale2}`,
        borderBottomWidth: '1px',
    },
    td: {
        padding: '8px 10px',
        color: `${theme.colors.white}`,
        borderBottomColor: `${theme.colors.greyScale2}`,
        borderBottomWidth: '1px',
        borderLeftColor: `${theme.colors.greyScale2}`,
        borderLeftWidth: '1px',
    },
}
