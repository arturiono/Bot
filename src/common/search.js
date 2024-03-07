"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetToolsByIds = exports.SearchToolsByStr = void 0;
const DECORATORS = /[^a-zA-Zа-яА-ЯёЁ0-9]/g;
function split(str) {
    // if(str === undefined) return ['']
    const s = str.replace('ё', 'е').toLowerCase();
    return s.split(DECORATORS);
}
function escape(str) {
    if (str === undefined)
        return '';
    const s = str.replace('ё', 'е').toLowerCase();
    return s.replace(DECORATORS, "");
}
// поиск по строке
function SearchToolsByStr(c, str) {
    return __awaiter(this, void 0, void 0, function* () {
        let searchRes = [];
        const rows = yield c.tableUI.getList('Инструмент', ['Auto #', 'Наименование', 'Описание', 'Фото', 'Статус', 'Доступность']);
        const strArr = split(str);
        // console.log(rows)
        rows['Auto #'].forEach((id, i) => {
            const name = rows['Наименование'][i];
            const desc = rows['Описание'][i];
            const nameEscaped = escape(name);
            const descEscaped = escape(desc);
            let foundAcc = strArr.length;
            strArr.forEach((str) => {
                if (nameEscaped.indexOf(str) != -1 || descEscaped.indexOf(str) != -1) {
                    foundAcc--;
                }
            });
            if (foundAcc === 0 && rows['Доступность'][i] === "Исправен" && rows['Статус'][i] === 'Склад') {
                // console.log(`${id} : ${row[nameRow]} : ${row[descRow]}`)
                searchRes.push({
                    id: id,
                    name: name,
                    desc: desc,
                    url: rows['Фото'][i]
                });
            }
        });
        return searchRes;
    });
}
exports.SearchToolsByStr = SearchToolsByStr;
// посик по массиву id-шникоы
function GetToolsByIds(c, ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let searchRes = [];
        const rows = yield c.tableUI.getList('Инструмент', ['Auto #', 'Наименование', 'Описание', 'Фото']);
        for (const reqId in ids) {
            let i = 0;
            for (const id of rows['Auto #']) {
                if (reqId === id) {
                    searchRes.push({
                        id: id,
                        name: rows['Наименование'][i],
                        desc: rows['Описание'][i],
                        url: rows['Фото'][i]
                    });
                    continue;
                }
                i++;
            }
        }
        return searchRes;
    });
}
exports.GetToolsByIds = GetToolsByIds;
