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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authorize_1 = require("../authorize");
const requestConverter_1 = require("../common/requestConverter");
const saveRequest_1 = require("../common/saveRequest");
const edit_1 = __importDefault(require("../edit"));
const notify_1 = __importDefault(require("../common/notify"));
// import { ABReqest } from '../../types/types';
const TX_NOTIFY_UPDATE = "💊 Заявка была обновлена:";
const TX_NOTIFY_CANCELED = "⛔️ Заявка была отменена:";
const TX_NO_ZAYAVOK = 'У тебя еще нет созданный заявок';
const TX_MY_ZAYAVKI = "Заявки";
const TX_PAGE = "страница";
const TX_BTN_CANCEL = "Отменить";
const TX_BTN_EDIT = "Редактировать";
const TX_CONFIRN = "Точно отменяем заявку?";
const TX_BTN_YES = "Да";
const TX_BTN_NO = "Нет";
const COUNT_PER_PAGE = 3;
const TX_BTN_NEXT_PAGE = "Страница";
const TX_BTN_PREV_PAGE = "Страница";
const TX_NEXT_MESSAGE = "Прошлые заявки";
const TX_PREV_MESSAGE = "Более новые";
const TX_EDIT_CONFIRMED = "✅ *Заявка обновлена*. Отправил информацию менеджеру";
const TX_EDIT_CANCELED = "⛔️ *Заявка отменена*. Отправил информацию менеджеру";
// const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:'
// page = 1,2,3 ...
const MoiZayavki = (msg, c, page, end, newZayavkiData) => __awaiter(void 0, void 0, void 0, function* () {
    const objectsTable = yield c.tableUI.getList('Обьекты', ['Auto #', 'Название']);
    // кэшируемые данные
    let zayavkiData;
    if (newZayavkiData)
        zayavkiData = newZayavkiData;
    else
        zayavkiData = yield c.tableUI.getList('Заявки', ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B',
            'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.']);
    // реверс порядок для массива
    for (const key in zayavkiData) {
        zayavkiData[key] = zayavkiData[key].reverse();
    }
    // console.log(zayavkiData)
    const messagesIds = {};
    const showNavigationButton = (type, page, totalItems) => __awaiter(void 0, void 0, void 0, function* () {
        const newPage = type === 'next' ? Number(page) + 1 : Number(page) - 1;
        const a = totalItems - 1;
        const b = COUNT_PER_PAGE;
        const totalPages = (a + b - a % b) / b;
        // console.log(totalPages)
        // console.log('новая сраница: ' + newPage)
        // console.log('всего страниц: ' + totalPages)
        if (newPage < 1)
            return;
        if (newPage > totalPages)
            return;
        const opts = {
            reply_markup: { inline_keyboard: [
                    [{
                            text: type === 'next' ?
                                TX_BTN_NEXT_PAGE + " " + newPage + " >>" :
                                "<< " + TX_BTN_PREV_PAGE + " " + newPage,
                            callback_data: 'page_' + newPage //id zayavki
                        }]
                ] },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, type === 'next' ? TX_NEXT_MESSAGE : TX_PREV_MESSAGE, opts);
    });
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const user = (0, authorize_1.getLocalPhone)((0, authorize_1.getUserName)(msg));
        // console.log(Array.from(zayavkiData['Cотрудник'].entries()))
        // console.log(zayavkiData['Cотрудник'])
        // console.log(String(user))
        if (zayavkiData['Cотрудник'].indexOf(String(user)) === -1) {
            yield c.botUI.message(msg, TX_NO_ZAYAVOK, { mark_to_remove: true });
            return;
        }
        yield c.botUI.message(msg, TX_MY_ZAYAVKI + " (" + TX_PAGE + " " + page + ")", { mark_to_remove: true });
        // await c.botUI.
        yield showNavigationButton('prev', page, zayavkiData['#'].length);
        // показываем все заявки, где сотрудник = этот сотрудник
        for (const [i, phone] of zayavkiData['Cотрудник'].entries()) {
            // const ii = zayavkiData['Cотрудник'].length - 1 - i
            // console.log(ii)
            //  если совпадает телефон и статус не Отменен
            const b = COUNT_PER_PAGE;
            if (i < (page - 1) * b)
                continue;
            if (i >= page * b)
                continue;
            if (phone === user
                && zayavkiData['Статус'][i] !== 'Отмена'
                && zayavkiData['Статус'][i] !== 'Объект'
                && zayavkiData['Статус'][i] !== 'Склад') {
                const opts = {
                    reply_markup: { inline_keyboard: [[]] },
                    mark_to_remove: true
                };
                const btns = opts.reply_markup.inline_keyboard[0];
                // редактирование доступно только в обработке
                if (zayavkiData['Статус'][i] === 'Обработка')
                    btns.push({
                        text: TX_BTN_EDIT,
                        callback_data: 'edit' + '_' + zayavkiData['#'][i] + '_' + i, //_id_i //индекс
                    });
                btns.push({
                    text: TX_BTN_CANCEL,
                    callback_data: 'cancel' + '_' + zayavkiData['#'][i] + '_' + i,
                });
                const nmsg = yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)((0, requestConverter_1.zayavkaToData)(i, zayavkiData), objectsTable), opts);
                messagesIds[zayavkiData['#'][i]] = nmsg.message_id;
            }
            else {
                yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)((0, requestConverter_1.zayavkaToData)(i, zayavkiData), objectsTable), { mark_to_remove: true });
            }
        }
        yield showNavigationButton('next', page, zayavkiData['#'].length);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const split = query.data.split('_');
            const type = split[0];
            const val1 = split[1]; //id 
            const val2 = split[2]; //ind
            if (type === 'edit') {
                c.botUI.deleteAllMarked(msg);
                // заполняем данным c.data - временную контекстную модель заявки, val2 - index
                c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(val2, zayavkiData);
                (0, edit_1.default)(msg, c, (isEdited) => __awaiter(void 0, void 0, void 0, function* () {
                    if (isEdited) {
                        yield (0, saveRequest_1.saveRequest)(msg, c, val1);
                        yield c.botUI.message(msg, TX_EDIT_CONFIRMED);
                        // уведомляем менеджера
                        const usersTable = yield c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId']);
                        yield (0, notify_1.default)(msg, c, TX_NOTIFY_UPDATE + '\n'
                            + (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], objectsTable, true, usersTable), usersTable, null);
                        yield end();
                    }
                    else {
                        MoiZayavki(msg, c, page, end, newZayavkiData);
                    }
                }), false); // запускаем сценарий confirmation сразу с редактирования
            }
            else if (type === 'cancel') {
                c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
                    c.botUI.deleteAllMarked(msg);
                    c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(val2, zayavkiData);
                    yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], objectsTable), { mark_to_remove: true });
                    const opts = {
                        reply_markup: { inline_keyboard: [
                                [{
                                        text: TX_BTN_YES,
                                        callback_data: 'yes_' + val1 + '_' + val2,
                                    },
                                    {
                                        text: TX_BTN_NO,
                                        callback_data: 'no',
                                    }]
                            ] },
                        mark_to_remove: true
                    };
                    yield c.botUI.message(msg, TX_CONFIRN, opts);
                }), {
                    callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
                        const split = query.data.split('_');
                        const type = split[0];
                        const id = split[1];
                        const ind = split[2];
                        if (type === 'yes') {
                            c.botUI.deleteAllMarked(msg);
                            c.data[msg.chat.id].status = 'Отмена';
                            yield (0, saveRequest_1.saveRequest)(msg, c, id, true); //save only status
                            zayavkiData['Статус'][ind] = 'Отмена';
                            yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)((0, requestConverter_1.zayavkaToData)(ind, zayavkiData), objectsTable));
                            yield c.botUI.message(msg, TX_EDIT_CANCELED);
                            const usersTable = yield c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId']);
                            yield (0, notify_1.default)(msg, c, TX_NOTIFY_CANCELED + '\n'
                                + (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], objectsTable), usersTable, null); //пишем менджеру
                            yield end();
                        }
                        else {
                            c.botUI.deleteAllMarked(msg);
                            MoiZayavki(msg, c, page, end);
                        }
                    })
                });
                // %%% отменяем заявку и удаляем ее из списка сообщений
            }
            else if (type === 'page') {
                c.botUI.deleteAllMarked(msg);
                MoiZayavki(msg, c, val1, end);
            }
        })
    });
});
exports.default = MoiZayavki;
