export const areArraysTheSame = (a: any[] = [], b: any[] = []): boolean => {
    const aSet = new Set(a)
    const bSet = new Set(b)

    for (const el of a) {
        if (!bSet.has(el)) {
            return false
        }
    }

    for (const el of b) {
        if (!aSet.has(el)) {
            return false
        }
    }

    return true
}
