"use strict";
// Кесейсы для обновления Журнала и пересчета расходников
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRequest = void 0;
const requestConverter_1 = require("./requestConverter");
const next_id_1 = __importDefault(require("./next-id"));
// interface JournalUpdate {
//     s:JournalToolStatus, 
//     o:String
// }
const stringDate = (date) => {
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const dt = [
        (dd > 9 ? '' : '0') + dd,
        (mm > 9 ? '' : '0') + mm,
        date.getFullYear()
    ].join('.');
    const tm = [(h > 9 ? '' : '0') + h,
        (m > 9 ? '' : '0') + m,
        (s > 9 ? '' : '0') + s
    ].join(':');
    const res = dt + ' ' + tm;
    // console.log(res)
    return res;
};
let convertToJournalStatus = (status) => {
    let js;
    js = 'Заявка';
    switch (status) {
        case 'Обработка':
        case 'Доставка':
        case 'Собран':
            js = 'Заявка';
            break;
        case 'Объект':
            js = 'Объект';
            break;
        case 'Склад':
            js = 'Склад';
            break;
        case 'Отмена':
            console.log('Ковертер статуса to JournalStatus не работает для "Отмена"');
            break;
    }
    return js;
};
function updateTools(msg, c, tools, status, object, requestId) {
    return __awaiter(this, void 0, void 0, function* () {
        const obj = [];
        for (const toolId in tools) {
            obj.push({
                'Заявка': requestId,
                'Инструмент': toolId,
                'Статус': status,
                'Дата изм.': stringDate(new Date),
                'Объект': object,
                'Cотрудник': status !== 'Склад' ? c.data[msg.chat.id].user : '',
            });
        }
        // всегда только добавляем новые записи для истории в журнал
        yield c.tableUI.insertRows('Журнал Инструмент', obj);
    });
}
function updateRashodniki(msg, c, prevRash, newRash) {
    return __awaiter(this, void 0, void 0, function* () {
        let clone = (co) => {
            let o = {};
            for (const key in co) {
                o[key] = co[key];
            }
            return o;
        };
        const objAllRashidniki = yield c.tableUI.getList('Расходники', ['Auto #', 'Количество', 'Измерение', 'Категория', 'Название', 'Вариант', 'Фото', 'Место']);
        // console.log(prevRash)
        // console.log(newRash)
        let prevMergeAcc = clone(prevRash);
        let newMergeAcc = clone(newRash);
        for (const key in prevMergeAcc) {
            if (newMergeAcc[key] === undefined) {
                newMergeAcc[key] = clone(prevMergeAcc[key]);
                newMergeAcc[key].count = 0;
            }
        }
        for (const key in newMergeAcc) {
            if (prevMergeAcc[key] === undefined) {
                prevMergeAcc[key] = clone(newMergeAcc[key]);
                prevMergeAcc[key].count = 0;
            }
        }
        for (const newRashId in newMergeAcc) {
            const i = objAllRashidniki['Auto #'].indexOf(newRashId);
            if (i !== -1) {
                const currentCount = Number(objAllRashidniki['Количество'][i]);
                const prevCount = prevMergeAcc[newRashId].count;
                const newCount = newMergeAcc[newRashId].count;
                // главное значение
                const updatedCount = currentCount - (newCount - prevCount);
                c.tableUI.updateRow('Расходники', i + 2, // %%% всегда добавлять 2???
                { 'Количество': updatedCount });
            }
            else {
                yield c.botUI.message(msg, 'Ошибка расходника. Расходник #' + i + ' не найден, возможно был удален менеджером. Сообщите и продолжите работу.');
                // console.log("Ошибка расходника. Расходник #' + i + ' не найден, возможно был удален менеджером. Сообщите и продолжите работу.")
            }
        }
    });
}
// I. Заявка
// 1. сохраняем первый раз
// 2. обновляем
// II. Кейсы обновления Tools и Rashodniki
// 1. 'Cо склада'
// Вычитаем сразу со склада все
// 1.а Первичное создание (requestId)
// rashodniki: было {}, стало {a,b} -
// tools: статус='Заявка', все tools, obj: toObj
// 1.b Смена статуса 'Отмена'
// rashodniki: (было {a,b}, стало {}) +
// tools: статус 'Склад', все tools, obj: 0 (склад)
// 1.c Смена статуса 'Объект'
// rashodniki: ничего не делаем
// tools: статус 'Объект', все tools, obj: ID (пользовательски объект)
// 1.d Изменение количества (не может быть статус Отмены)
// rashodniki: было {a,b}, стало (a,c) + и -
// tools: addAcc: меняем статусы, del:Acc: статус сохраняем, obj: toObj
// - - -
// 2. 'Возврат'
// rashodniki: ничего не делаем - по согласованию с Кириллом
// 2.a Первичное создание (requestId) статуса 'ОБработка' 
// tools: статус='Заявка', все tools, obj: N - гдебыл заказ, user - телефон
// 2.b Смена статуса 'Отмена' 
// tools: статус='Объект', все tools, obj: N - гдебыл заказ, user - телефон
// 2.c Смена статуса 'Склад'
// tools: статус='Склад', все tools, obj: 0 (склад)
// 2.d Изменение количества 'Возврат'
// tools: ничего не делаем
// - - -
// 3 'Между Обьектами' 
// rashodniki: ничего не делаем - по согласованию с Кириллом
// 3.a Первичное создание (requestId) статуса 'ОБработка' 
// tools: статус='Заявка', все tools, obj: N - гдебыл заказ, user - телефон
// 3.b Смена статуса 'Отмена'
// tools: статус='Объект', все tools, obj: N - гдебыл заказ, user - телефон
// 3.c Смена статуса 'Объект'
// tools: статус='Объект', все tools, obj: ID (пользовательски объект)
function saveRequest(msg, c, requestId, onlyStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        // нужно всегда для next id или обновления заявки
        const objZayavki = yield c.tableUI.getList('Заявки', ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.']);
        const newRequest = c.data[msg.chat.id];
        // может быть null
        let prevRequest = undefined;
        let id; //записываем
        if (requestId === undefined)
            id = (0, next_id_1.default)(objZayavki['#']);
        else
            id = requestId;
        // Запись данных в таблицу из data
        let obj;
        if (!onlyStatus)
            obj = {
                '#': id,
                'Тип': newRequest.type,
                'Доставка': String(newRequest.delivery),
                'Ожидаемая дата/время': newRequest.dateTime,
                'Статус': newRequest.status,
                'Cотрудник': newRequest.user,
                'Объект A': newRequest.from,
                'Объект B': newRequest.to,
                'Инструмент': JSON.stringify(newRequest.tools),
                'Расходники': JSON.stringify(newRequest.rashodniki),
                'Комментарий': newRequest.comment,
                'Дата созд.': stringDate(new Date),
                'Дата изм.': stringDate(new Date)
            };
        else
            obj = {
                'Статус': newRequest.status,
            };
        // Первый раз
        if (requestId === undefined) {
            // I.1 Заявка - сохраняем первый раз
            c.tableUI.insertRows('Заявки', [obj]);
            // II.1.а Первичное создание (requestId)
            // rashodniki: было {}, стало {a,b} -
            // tools: статус='Заявка', все tools, obj: toObj
            if (newRequest.type === 'Со склада') {
                updateTools(msg, c, newRequest.tools, 'Заявка', newRequest.to, id);
                updateRashodniki(msg, c, {}, newRequest.rashodniki);
                // II.2.a и II.3.a Первичное создание (requestId) статуса 'ОБработка' 
                // tools: статус='Заявка', все tools, obj: N - где был заказ, user - телефон
            }
            else if (newRequest.type === 'Возврат') {
                updateTools(msg, c, newRequest.tools, 'Заявка', newRequest.from, id);
            }
            else if (newRequest.type === 'Между объектами') {
                updateTools(msg, c, newRequest.tools, 'Заявка', newRequest.from, id);
            }
            // Остальные сценарии
        }
        else {
            // II.1 'Со склада'
            const ind = objZayavki['#'].indexOf(requestId);
            if (ind === -1) {
                console.log("Ошибка saveRequest. Заявка не найдена");
                return;
            }
            // I.2 Заявка - обновляем данные
            yield c.tableUI.updateRow('Заявки', ind + 2, obj); // %+2
            prevRequest = (0, requestConverter_1.zayavkaToData)(ind, objZayavki);
            // %%% сделать сравнение алгоритмом
            const prevToolsString = JSON.stringify(prevRequest.tools);
            const newToolsString = JSON.stringify(newRequest.tools);
            const prevRashString = JSON.stringify(prevRequest.rashodniki);
            const newRashString = JSON.stringify(newRequest.rashodniki);
            let getDeletedTools = () => {
                // - c
                let deleteToolsAcc = {};
                if (prevRequest) {
                    for (const key in prevRequest.tools) {
                        // Инструмент был удален
                        if (newRequest.tools[key] === undefined) {
                            deleteToolsAcc[key] = prevRequest.tools[key];
                        }
                    }
                }
                return deleteToolsAcc;
            };
            let getAddedTools = () => {
                // + c
                let addedToolsAcc = {};
                if (prevRequest) {
                    for (const key in newRequest.tools) {
                        // Инструмент был добавлен
                        if (prevRequest.tools[key] === undefined) {
                            addedToolsAcc[key] = newRequest.tools[key];
                        }
                    }
                }
                return addedToolsAcc;
            };
            // II.1 'Со склада'
            if (newRequest.type === 'Со склада') {
                // II.1.b Смена статуса 'Отмена'
                if (newRequest.status === 'Отмена') {
                    // tools: jстатус 'Склад', все tools, obj: 0 (from, склад)
                    updateTools(msg, c, newRequest.tools, 'Склад', newRequest.from, requestId);
                    // rashodniki: (было {a,b}, стало {})  + на складе
                    updateRashodniki(msg, c, newRequest.rashodniki, {});
                }
                // 1.c Смена статуса 'Объект'
                if (newRequest.status === 'Объект') {
                    // tools: статус 'Объект', все tools, obj: ID (пользовательски объект)
                    updateTools(msg, c, newRequest.tools, 'Объект', newRequest.to, requestId);
                }
                // II.1.c Смена статуса 'Объект' (целевое действие)
                // ничего не деалем
                // II.1.d Изменение количества (не может быть статус Отмены)    
                // tools: addAcc: меняем статусы, del:Acc: статус сохраняем, obj: toObj
                if (prevToolsString !== newToolsString) {
                    updateTools(msg, c, getDeletedTools(), 'Склад', newRequest.to, requestId);
                    updateTools(msg, c, getAddedTools(), convertToJournalStatus(newRequest.status), newRequest.to, requestId);
                }
                // rashodniki: было {a,b}, стало (a,c) + и -
                if (prevRashString !== newRashString) {
                    updateRashodniki(msg, c, prevRequest.rashodniki, newRequest.rashodniki);
                }
                // II.2 'Возврат'
            }
            else if (newRequest.type === 'Возврат') {
                // II.2.b Смена статуса 'Отмена'
                // tools: статус='Объект', все tools, obj: N - гдебыл заказ, user - телефон
                if (newRequest.status === 'Отмена') {
                    // tools: jстатус 'Склад', все tools, obj: 0 (from, склад)
                    updateTools(msg, c, newRequest.tools, 'Объект', newRequest.from, requestId);
                }
                // II.2.c Смена статуса 'Склад' (факт возврата)
                if (newRequest.status === 'Склад') {
                    // tools: статус='Склад', все tools, obj: 0 (склад - newRequest.to)
                    updateTools(msg, c, newRequest.tools, 'Склад', newRequest.to, requestId);
                }
                // II.2.d Изменение количества 'Возврат'
                // rashodniki: ничего не делаем
                // 3 'Между Обьектами' 
                // rashodniki: ничего не делаем - по согласованию с Кириллом
            }
            else if (newRequest.type === 'Между объектами') {
                // 3.b Смена статуса 'Отмена'
                // tools: статус='Объект', все tools, obj: N - гдебыл заказ, user - телефон
                if (newRequest.status === 'Отмена') {
                    // tools: jстатус 'Склад', все tools, obj: 0 (from, склад)
                    updateTools(msg, c, newRequest.tools, 'Объект', newRequest.from, requestId);
                }
                // 3.c Смена статуса 'Объект'
                // tools: статус='Объект', все tools, obj: ID (пользовательски объект)  
                if (newRequest.status === 'Объект') {
                    // tools: статус 'Объект', все tools, obj: ID (пользовательски объект)
                    updateTools(msg, c, newRequest.tools, 'Объект', newRequest.to, requestId);
                }
            }
        }
    });
}
exports.saveRequest = saveRequest;
