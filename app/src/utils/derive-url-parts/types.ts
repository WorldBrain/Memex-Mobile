export interface URLParts {
    hostname: string
    pathname: string
    domain: string
}

export type URLPartsDeriver = (url: string) => URLParts
