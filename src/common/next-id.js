"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//вычисляем следующий id на основе максимального значения в колонке ID  
exports.default = (arr) => {
    let nextId = 0;
    for (const el of arr) {
        const n = Number(el);
        if (Number.isInteger(n) && n > nextId)
            nextId = n;
    }
    nextId++; // + 1
    // console.log(nextId)
    return String(nextId);
};
