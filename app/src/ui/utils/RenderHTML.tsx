import React from 'react'
import RenderHtml from 'react-native-render-html'
import { Dimensions } from 'react-native'
import { theme } from '../components/theme/theme'

export const RenderHTML = (html: string) => {
    return (
        <RenderHtml
            contentWidth={Dimensions.get('screen').width - 60}
            source={{ html }}
            baseStyle={{
                lineHeight: 20,
                fontWeight: '300',
                color: `${theme.colors.white}`,
            }}
            tagsStyles={{
                a: {
                    color: `${theme.colors.prime1}`, // Add your desired link color here
                    textDecorationLine: 'none',
                },
                p: {
                    color: `${theme.colors.white}`,
                    fontSize: '16px',
                },
                h1: {
                    fontSize: '20px',
                },
                h2: {
                    fontSize: '18px',
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
                    borderRadius: 8,
                    borderColor: `${theme.colors.greyScale2}`,
                    borderWidth: 1,
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
            }}
        />
    )
}

export const RenderHTMLStyles = {
    p: {
        color: `${theme.colors.white}`,
        fontSize: '16px',
    },
    a: {
        color: `${theme.colors.prime1}`,
        textDecorationLine: 'none',
    },
    h1: {
        fontSize: '20px',
    },
    h2: {
        fontSize: '18px',
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
