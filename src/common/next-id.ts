//вычисляем следующий id на основе максимального значения в колонке ID  
export default (arr:Array<String>) => {

    let nextId = 0  
    for (const el of arr) {
        const n = Number(el)
        if(Number.isInteger(n) && n>nextId) nextId = n
    }
    nextId ++ // + 1
    // console.log(nextId)
    return String(nextId)
}