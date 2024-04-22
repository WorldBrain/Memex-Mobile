import React from 'react'
import RenderHtml from 'react-native-render-html'
import { Dimensions } from 'react-native'
import { theme } from '../components/theme/theme'
import { ImageSupportBackend } from '@worldbrain/memex-common/lib/image-support/types'
import { createImageUrlFromId } from '@worldbrain/memex-common/lib/image-support/utils'

export const getImageUrl: ImageSupportBackend['getImageUrl'] = (params) => {
    const imageUrl = createImageUrlFromId({
        id: params.id,
        env: params.env,
    })
    return imageUrl
}

export const RenderHTML = (html: string) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g
    let match
    let processedHtml = html

    while ((match = imgRegex.exec(html)) !== null) {
        // Extract the src value
        const originalSrc = match[1]
        // Assuming the src is an ID or can be converted to an ID for getImageUrl
        const id = originalSrc // Modify this line if the ID needs to be extracted differently
        console.log('id:', id)
        try {
            const newSrc = getImageUrl({
                id: id,
                env: process.env.NODE_ENV ?? 'development',
            })

            console.log('newSrc:', newSrc) // This should be the new URL for the image
            // Replace the original src with the new one in the processedHtml string
            processedHtml = processedHtml.replace(originalSrc, newSrc)
        } catch (error) {
            console.error('Error processing image URL:', error)
        }
    }

    return (
        <RenderHtml
            contentWidth={Dimensions.get('screen').width - 60}
            source={{ html: processedHtml }}
            baseStyle={{
                lineHeight: 20,
                fontWeight: '300',
                color: `${theme.colors.white}`,
                height: '100%',
            }}
            tagsStyles={{
                a: {
                    color: `${theme.colors.prime1}`, // Add your desired link color here
                    textDecorationLine: 'none',
                },
                p: {
                    color: `${theme.colors.white}`,
                    fontSize: '14px',
                },
                img: {
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    paddingTop: 15,
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
    img: {
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        paddingTop: 15,
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
