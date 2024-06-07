export const throttle = (fn: (...args: any[]) => void, wait: number) => {
    let now = Date.now()

    return (...args: any[]) => {
        if (now + wait - Date.now() < 0) {
            fn(...args)
            now = Date.now()
        }
    }
}
