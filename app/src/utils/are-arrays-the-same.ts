export const areArraysTheSame = (a: any[] = [], b: any[] = []): boolean => {
    if (a.length !== b.length) {
        return false
    }

    const bSet = new Set(b)
    for (const el of a) {
        if (!bSet.has(el)) {
            return false
        }
    }

    return true
}
