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
const TX_INITIAL_MESSAGE = '*Добавление расходных материалов*:';
const TX_INITIAL_MESSAGE_EDIT = '*Редактирование расходных материалов*:';
const TX_SELECT_CATEGORY = 'Выбери категорию';
const TX_CURRENT_CATEGORY = 'Текущая категория:';
const TX_END_MESSAGE = 'Для выхад из добавления расходников нажми';
const TX_BACK_MESSAGE = 'Для возврата к выбору категорий нажми';
const TX_BUTTON_END = "Закончить добавление >>";
const TX_BUTTON_EDIT_END = "Закончить редактирование >>";
const TX_BUTTON_BACK = '<< Вернутся в категории';
const TX_MATERIAL = 'Расходники: ';
const TX_EXISTS = ' уже в списоке';
const TX_END_CONFIRM_REQUEST = "Расходники не добавлены. Оставить заявку без расходников?";
const TX_BUTTON_CONFIRM = 'Да';
const TX_BUTTON_NOT_CONFIRM = 'Нет';
const TX_END_CONFIRMED = "Понял, *продолжаем без расходников*";
const TX_END_NOT_CONFIRMED = "Продолжим добавление";
// export interface RashodnikiMsg {
//     [key: string]: {
//         id:string, 
//         // prevText:string, 
//         // prevReplyMarkup: any
//     }
//  } 
let addedRashodnikiMsgIds = {};
let MRashodniki = (msg, c, editMode, showInitialMessage, end) => __awaiter(void 0, void 0, void 0, function* () {
    addedRashodnikiMsgIds[msg.chat.id] = addedRashodnikiMsgIds[msg.chat.id] !== undefined ? addedRashodnikiMsgIds[msg.chat.id] : {};
    const addedRashodniki = c.data[msg.chat.id].rashodniki;
    let yesNoMsg; //сообщение для удаления
    // msgId - если хотим заменить добавляем этот параметр
    let showRashodnikMessage = (id, update, endedEditMode) => __awaiter(void 0, void 0, void 0, function* () {
        let msgId;
        if (update)
            msgId = addedRashodnikiMsgIds[msg.chat.id][id];
        const indx = Table['Auto #'].indexOf(id);
        const buttons = [];
        if (!endedEditMode) {
            if (addedRashodniki[id].count - 1 > 0)
                buttons.push({ text: '-1', callback_data: id + '_' + '-1' });
            else
                buttons.push({ text: ' ', callback_data: id + '_' + 'null' });
            if (addedRashodniki[id].count - 5 > 0)
                buttons.push({ text: '-5', callback_data: id + '_' + '-5' });
            else
                buttons.push({ text: ' ', callback_data: id + '_' + 'null' });
            buttons.push({ text: 'Удалить', callback_data: id + '_' + 'del' });
            if (addedRashodniki[id].count + 5 <= Table['Количество'][indx])
                buttons.push({ text: '+5', callback_data: id + '_' + '+5' });
            else
                buttons.push({ text: ' ', callback_data: id + '_' + 'null' });
            if (addedRashodniki[id].count + 1 <= Table['Количество'][indx])
                buttons.push({ text: '+1', callback_data: id + '_' + '+1' });
            else
                buttons.push({ text: ' ', callback_data: id + '_' + 'null' });
        }
        const opts = {
            reply_markup: {
                inline_keyboard: [buttons]
            }
        };
        const cntx = !endedEditMode ? ' (' + Table['Количество'][indx] + ' ' + Table['Измерение'][indx] + ')' : '';
        const tx = TX_MATERIAL + '*' + addedRashodniki[id].name + ' - ' + addedRashodniki[id].count + ' ' + Table['Измерение'][indx] + '*'
            + cntx;
        if (update) {
            yield c.botUI.editMessage(msg, msgId, tx, opts);
        }
        else { //первый раз 
            const nmsg = yield c.botUI.message(msg, tx, opts);
            addedRashodnikiMsgIds[msg.chat.id][id] = nmsg.message_id;
        }
    });
    const showEndMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        const opts2 = {
            reply_markup: {
                inline_keyboard: [[{ text: editMode ? TX_BUTTON_EDIT_END : TX_BUTTON_END, callback_data: 'end' }]]
            },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, TX_END_MESSAGE, opts2);
    });
    const showBackMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        const opts2 = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_BACK, callback_data: 'back' }]]
            },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, TX_BACK_MESSAGE, opts2);
    });
    const endConfirmationRashodniki = () => __awaiter(void 0, void 0, void 0, function* () {
        const opts = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_CONFIRM, callback_data: 'end-confirmed' },
                        { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'end-not-confirmed' }]]
            },
            mark_to_remove: true
        };
        yesNoMsg = yield c.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts);
    });
    const endRashodniki = () => __awaiter(void 0, void 0, void 0, function* () {
        c.data[msg.chat.id].rashodniki = addedRashodniki;
        c.botUI.deleteAllMarked(msg);
        // заменяем все добавленные на сообщения без кнопки
        for (const id in addedRashodnikiMsgIds[msg.chat.id]) {
            showRashodnikMessage(id, true, true);
        }
        addedRashodnikiMsgIds[msg.chat.id] = undefined; //сбрасываем глобальную переменную
        yield end();
    });
    const endRashodnikiConfirmed = () => __awaiter(void 0, void 0, void 0, function* () {
        yield c.botUI.message(msg, TX_END_CONFIRMED);
        yield endRashodniki();
    });
    const endRashodnikiNotConfirmed = () => __awaiter(void 0, void 0, void 0, function* () {
        // удалить сообщение и продолжить
        c.botUI.delete(msg, yesNoMsg.message_id);
        yield c.botUI.message(msg, TX_END_NOT_CONFIRMED, { mark_to_remove: true });
    });
    // ### логика обработки расходника используется в двух местах
    const callbackRashodnikControls = (data) => __awaiter(void 0, void 0, void 0, function* () {
        let updateRashodnikiMsg = (id) => __awaiter(void 0, void 0, void 0, function* () {
            yield showRashodnikMessage(id, true);
        });
        const id = data.split('_')[0];
        const op = data.split('_')[1];
        // console.log(op)
        // console.log(id)
        if (op === '+1') {
            addedRashodniki[id].count = addedRashodniki[id].count + 1;
            updateRashodnikiMsg(id);
        }
        else if (op === '+5') {
            addedRashodniki[id].count = addedRashodniki[id].count + 5;
            updateRashodnikiMsg(id);
        }
        else if (op === '-1') {
            addedRashodniki[id].count = addedRashodniki[id].count - 1;
            updateRashodnikiMsg(id);
        }
        else if (op === '-5') {
            addedRashodniki[id].count = addedRashodniki[id].count - 5;
            updateRashodnikiMsg(id);
        }
        else if (op === 'del') {
            c.botUI.delete(msg, addedRashodnikiMsgIds[msg.chat.id][id]);
            delete addedRashodniki[id];
            delete addedRashodnikiMsgIds[msg.chat.id][id];
        }
        // console.log(query.data.split('_')[0])
        // console.log(query.data.split('_')[1])
        // console.log('- - -')
    });
    const Table = yield c.tableUI.getList('Расходники', ['Auto #', 'Количество', 'Измерение', 'Категория', 'Название', 'Вариант']);
    // console.log(Table)
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const buttons = [];
        const existCategories = {};
        Table['Категория'].forEach((el) => {
            if (!existCategories[el]) {
                buttons.push([{ text: el, callback_data: el }]);
                existCategories[el] = true;
            }
        });
        const opts = {
            reply_markup: {
                inline_keyboard: buttons
            },
            mark_to_remove: true
        };
        // console.log(buttons)
        // Первичное добавление
        if (!editMode) {
            if (showInitialMessage) {
                yield c.botUI.message(msg, TX_INITIAL_MESSAGE);
            }
            // Редактирование списка 
        }
        else {
            if (showInitialMessage) {
                yield c.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT);
                // показываем кнопки заново при редактировании
                for (const id in addedRashodniki) {
                    showRashodnikMessage(id);
                }
            }
        }
        yield c.botUI.message(msg, TX_SELECT_CATEGORY, opts);
        yield showEndMessage();
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            // нажата кнопка закончить
            if (query.data === 'end') { // заканчиваем выбор материалов
                // сообщшение о подтверждении
                if (Object.keys(addedRashodniki).length === 0) {
                    endConfirmationRashodniki();
                    // заканчиваем
                }
                else {
                    endRashodniki();
                }
            }
            else if (query.data === 'end-confirmed') {
                endRashodnikiConfirmed();
            }
            else if (query.data === 'end-not-confirmed') {
                endRashodnikiNotConfirmed();
            }
            else if (query.data.split('_').length === 2) {
                callbackRashodnikControls(query.data);
                // выбрана категория
            }
            else {
                c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
                    const List = {}; // оссоциативный массив с массивом вариантов
                    const Category = query.data;
                    c.botUI.deleteAllMarked(msg);
                    yield showBackMessage();
                    yield c.botUI.message(msg, TX_CURRENT_CATEGORY + '*' + query.data + '*', { mark_to_remove: true });
                    // %%% тут
                    Table['Название'].forEach((el, i) => {
                        if (Table['Категория'][i] === Category) {
                            if (Table['Количество'][i] !== '0') { //если не 0
                                let firstTime = false;
                                if (!List[el]) {
                                    List[el] = [];
                                    firstTime = true;
                                }
                                if (Table['Вариант'][i] !== '' && Table['Вариант'][i] !== ' ' && Table['Вариант'][i] !== undefined)
                                    List[el].push({
                                        name: Table['Вариант'][i],
                                        id: Table['Auto #'][i],
                                        count: Table['Количество'][i],
                                        items: Table['Измерение'][i],
                                    });
                                else if (firstTime) //нет вариантов у расходника
                                    List[el].push({
                                        name: Table['Название'][i],
                                        id: Table['Auto #'][i],
                                        count: Table['Количество'][i],
                                        items: Table['Измерение'][i],
                                    });
                            }
                        }
                    });
                    for (let el in List) {
                        const buttons = [];
                        List[el].forEach((variant) => {
                            buttons.push([{ text: variant.name + ' (' + variant.count + ' ' + variant.items + ')',
                                    callback_data: variant.id }]);
                        });
                        const opts = {
                            reply_markup: {
                                inline_keyboard: buttons
                            },
                            mark_to_remove: true
                        };
                        yield c.botUI.message(msg, '*' + el + '*', opts);
                    }
                    showEndMessage();
                }), {
                    callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
                        // заканчиваем выбор материалов
                        if (query.data === 'end') {
                            // сообщшение о подтверждении
                            if (Object.keys(addedRashodniki).length === 0) {
                                endConfirmationRashodniki();
                                // заканчиваем
                            }
                            else {
                                endRashodniki();
                            }
                        }
                        else if (query.data === 'end-confirmed') {
                            endRashodnikiConfirmed();
                        }
                        else if (query.data === 'end-not-confirmed') {
                            endRashodnikiNotConfirmed();
                            // возвратт в категорию
                        }
                        else if (query.data === 'back') {
                            c.botUI.deleteAllMarked(msg);
                            MRashodniki(msg, c, editMode, false, end); //рекурсивно вызываем функцию
                            // Пришел ID для редактирования расходника
                        }
                        else if (query.data.split('_').length === 2) {
                            callbackRashodnikControls(query.data);
                            // пришел ID для добавления (первый раз)
                        }
                        else {
                            const indx = Table['Auto #'].indexOf(query.data);
                            if (addedRashodniki[query.data] === undefined) {
                                let name = Table['Название'][indx];
                                if (Table['Вариант'][indx] !== '' && Table['Вариант'][indx] !== undefined)
                                    name += ' | ' + Table['Вариант'][indx];
                                addedRashodniki[query.data] = { name: name, count: 1 };
                                showRashodnikMessage(query.data);
                            }
                            else {
                                yield c.botUI.message(msg, Table['Название'][indx] + TX_EXISTS, { mark_to_remove: true });
                            }
                        }
                    })
                });
            }
        })
    });
});
exports.default = MRashodniki;
