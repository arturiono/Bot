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
    const arr = s.split(DECORATORS);
    const filtered = arr.filter(function (el) {
        return el !== '';
    });
    return filtered;
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
        // console.log(strArr)
        // console.log(rows)
        let makeFound = (i) => {
            if (rows['Доступность'][i] === "Исправен" && rows['Статус'][i] === 'Склад') {
                // console.log(`PUSH: ${rows['Auto #'][i]} : ${rows['Наименование'][i]} : ${rows['Описание'][i]}`)
                searchRes.push({
                    id: rows['Auto #'][i],
                    name: rows['Наименование'][i],
                    desc: rows['Описание'][i],
                    url: rows['Фото'][i]
                });
            }
        };
        // поиск по ID, 100% - ое совпадение, приоритетный 
        strArr.forEach((str) => {
            // console.log(str)
            // console.log(rows['Auto #'])
            const i = rows['Auto #'].indexOf(str);
            // console.log(i)
            // console.log(rows['Auto #'][i])
            if (i !== -1) {
                // console.log('HAPPEN')
                makeFound(i);
            }
        });
        // посик по name & desk
        rows['Auto #'].forEach((id, i) => {
            const name = rows['Наименование'][i];
            const desc = rows['Описание'][i];
            // const tid = rows['Auto #'][i]
            const nameEscaped = escape(name);
            const descEscaped = escape(desc);
            let found = false;
            strArr.forEach((str) => {
                if (nameEscaped.indexOf(str) != -1 || descEscaped.indexOf(str) != -1) {
                    found = true;
                }
            });
            if (found) {
                makeFound(i);
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
