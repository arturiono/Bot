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
const TX_INITIAL_MESSAGE_NO_TOOLS = 'У вас нет инструмента на объектах. Завка невозможна.';
const TX_INITIAL_MESSAGE_RETURN = 'Выбери объект для возврата инструмента';
const TX_INITIAL_MESSAGE_BETWEEN = 'Выбери объект для переноса инструмента';
const TX_BTN_RETURN_SELECT = "Выбрать";
const TX_BTN_RETURN_ALL = "Весь инструмент";
const TX_BTN_RETURN_SELECTIVE = "Выборочно";
const TX_BTN_ADD = "Добавить";
const TX_BTN_DELETE = "Убрать";
const TX_BUTTON_EDIT_END = "Закончить добавление >>";
const TX_BUTTON_NAVIGATION = "Навигация:";
const TX_END_CONFIRM_REQUEST = "Инструмент не добавлен. Оставить заявку без инструмента?";
const TX_BUTTON_CONFIRM = "Да";
const TX_BUTTON_NOT_CONFIRM = "Нет";
const TX_END_CONFIRMED = "Понял, *продолжаем без инструмента*. Вы можете оставить информация о возврате в комментарии далее.";
const TX_END_NOT_CONFIRMED = "Продолжим добавление";
exports.default = (msg, c, editTools, end) => __awaiter(void 0, void 0, void 0, function* () {
    let yesNoMsg; //сообщение для удаления
    const user = c.data[msg.chat.id].user; //user из заказа!
    const toolsOrderedByObject = {};
    const savedMessagesIdsByIndex = {}; // ind -> msgId те, которые выведены
    const savedAddedMessagesIdsByIndex = {}; // ind -> msgId добавленные пользователем
    const toolsData = yield c.tableUI.getList('Инструмент', ['Auto #', 'Статус', 'Наименование', 'Описание', 'Местонахождение', 'Сотрудник', 'Заявка', 'Объект']);
    const objectData = yield c.tableUI.getList('Обьекты', ['Auto #', 'Название']);
    let found = false;
    for (const [i, dataUser] of toolsData['Сотрудник'].entries()) {
        if (dataUser === user &&
            toolsData['Статус'][i] !== 'Склад' //показывае и заявкку и на объекте
        ) {
            const objectID = toolsData['Объект'][i];
            if (toolsOrderedByObject[objectID] === undefined)
                toolsOrderedByObject[objectID] = [];
            toolsOrderedByObject[objectID].push({ ind: i, selected: true }); //записываем индекс в таблице, чтобы потом быстро показываь списки
            found = true;
        }
    }
    // - - - - - - - - - - - - - - -
    // внутренний компонет выбора инструмента
    function ObjectTools(objectId, end) {
        return __awaiter(this, void 0, void 0, function* () {
            // пишем все иснструменты + кнопка разными сообщениями
            // for (массив всех инструментов)
            // ToolName | ToolDesc
            // [ Добавить ]
            // - - - 
            // Доабавлено:
            // ToolName | ToolDesc
            // [ Убрать ]
            // ToolName | ToolDesc
            // [ Убрать ]
            c.botUI.deleteAllMarked(msg);
            const ind = objectData['Auto #'].indexOf(objectId);
            // console.log(toolsOrderedByObject)
            // console.log('- - -')
            // console.log(toolsOrderedByObject[objectId])        
            let toolsStr = 'Инструмент: \n';
            if (toolsOrderedByObject[objectId]) //часто проблема тут
                Object.values(toolsOrderedByObject[objectId]).map(function (item) {
                    const indd = item.ind;
                    toolsStr += '*' + toolsData['Наименование'][indd] + '*' + ' (' + toolsData['Описание'][indd] + ')' + '\n';
                });
            // переиспольуем ниже
            const objName = ind !== -1 ? objectData['Название'][ind] : "Объект не найден";
            const msgStr = "Объект: *" + objName + "*\n\n" + toolsStr;
            c.botUI.context(msg, () => __awaiter(this, void 0, void 0, function* () {
                const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
                const btns = opts.reply_markup.inline_keyboard[0];
                btns.push({
                    text: TX_BTN_RETURN_ALL,
                    callback_data: 'all'
                });
                btns.push({
                    text: TX_BTN_RETURN_SELECTIVE,
                    callback_data: 'selective'
                });
                yield c.botUI.message(msg, msgStr, opts);
            }), {
                callback_query: (query) => __awaiter(this, void 0, void 0, function* () {
                    if (query.data === 'all') {
                        // и закончить end()
                        c.botUI.deleteAllMarked(msg);
                        yield c.botUI.message(msg, msgStr); //сохряняем сообщение
                        // save All
                        let saveAll = () => {
                            let tools = {};
                            Object.values(toolsOrderedByObject[objectId]).map(function (item) {
                                const ind = item.ind;
                                if (item.selected)
                                    tools[toolsData['Auto #'][ind]] = toolsData['Наименование'][ind];
                            });
                            c.data[msg.chat.id].tools = tools;
                        };
                        yield saveAll();
                        yield end();
                    }
                    else if (query.data === 'selective') {
                        let getAddMessage = (ind, showButton) => {
                            const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
                            const btns = opts.reply_markup.inline_keyboard[0];
                            btns.push({
                                text: TX_BTN_ADD,
                                callback_data: 'add_' + ind
                            });
                            const str = '*' + toolsData['Наименование'][ind] + '*' + ' (' + toolsData['Описание'][ind] + ')';
                            if (showButton)
                                return { msg: str, opts: opts };
                            else
                                return { msg: str, opts: { mark_to_remove: true } };
                        };
                        let getAddedMessage = (ind, showButton) => {
                            const opts = { reply_markup: { inline_keyboard: [[]] } };
                            opts.mark_to_remove = true;
                            const btns = opts.reply_markup.inline_keyboard[0];
                            btns.push({
                                text: TX_BTN_DELETE,
                                callback_data: 'delete_' + ind
                            });
                            const str = '*Добавлено: ' + toolsData['Наименование'][ind] + '*' + ' (' + toolsData['Описание'][ind] + ')';
                            if (showButton)
                                return { msg: str, opts: opts };
                            else
                                return { msg: str, opts: {} };
                        };
                        c.botUI.context(msg, () => __awaiter(this, void 0, void 0, function* () {
                            // очищаем списокинструмента
                            c.data[msg.chat.id].tools = {};
                            c.botUI.deleteAllMarked(msg);
                            const str = "Объект: *" + objName + "*";
                            yield c.botUI.message(msg, str, { mark_to_remove: true });
                            // console.log(toolsOrderedByObject[objectId])
                            for (const obj of toolsOrderedByObject[objectId]) {
                                const ind = obj.ind;
                                const o = getAddMessage(ind, true);
                                const nmsg = yield c.botUI.message(msg, o.msg, o.opts);
                                savedMessagesIdsByIndex[ind] = nmsg.message_id;
                            }
                            const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
                            const btns = opts.reply_markup.inline_keyboard[0];
                            btns.push({
                                text: TX_BUTTON_EDIT_END,
                                callback_data: 'end'
                            });
                            yield c.botUI.message(msg, TX_BUTTON_NAVIGATION, opts);
                        }), {
                            callback_query: (query) => __awaiter(this, void 0, void 0, function* () {
                                const split = query.data.split('_');
                                let type = split[0];
                                let ind = split[1];
                                if (type === 'add') {
                                    const oa = getAddedMessage(ind, true);
                                    const addMsg = yield c.botUI.message(msg, oa.msg, oa.opts);
                                    savedAddedMessagesIdsByIndex[ind] = addMsg.message_id;
                                    const o = getAddMessage(ind, false); // без кнопки
                                    c.botUI.editMessage(msg, savedMessagesIdsByIndex[ind], o.msg, o.opts);
                                    // добавляем в tools
                                    c.data[msg.chat.id].tools[toolsData['Auto #'][ind]] = toolsData['Наименование'][ind];
                                }
                                else if (type === 'delete') {
                                    // удаляем
                                    c.botUI.delete(msg, savedAddedMessagesIdsByIndex[ind]);
                                    // восстанавливаем кнопку
                                    const o = getAddMessage(ind, true); // с кнопкой кнопки
                                    c.botUI.editMessage(msg, savedMessagesIdsByIndex[ind], o.msg, o.opts);
                                    // удадяем из tools
                                    delete c.data[msg.chat.id].tools[toolsData['Auto #'][ind]];
                                }
                                else if (type === 'end') {
                                    if (Object.keys(c.data[msg.chat.id].tools).length === 0) { // Подтверждение   
                                        const opts = {
                                            reply_markup: {
                                                inline_keyboard: [[{ text: TX_BUTTON_CONFIRM, callback_data: 'end-confirmed' },
                                                        { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'end-not-confirmed' }]]
                                            },
                                            mark_to_remove: true
                                        };
                                        yesNoMsg = yield c.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts);
                                    }
                                    else {
                                        // 1. конвертируем все сообщения в сообщения без кнопок
                                        // проходим все savedAddedMessagesIdsByIndex
                                        for (const key in savedAddedMessagesIdsByIndex) {
                                            // восстанавливаем кнопку
                                            const o = getAddedMessage(key, false); //без кнопок, не удаляемые сообщения
                                            yield c.botUI.editMessage(msg, savedAddedMessagesIdsByIndex[key], o.msg, o.opts);
                                            //!!! чистии ID добавленное при создании, а не при edit (там не важно что)
                                            c.botUI.deleteFromMarked(msg, savedAddedMessagesIdsByIndex[key]);
                                        }
                                        c.botUI.deleteAllMarked(msg);
                                        // 3. Конец
                                        yield end();
                                    }
                                }
                                else if (type === 'end-confirmed') {
                                    yield c.botUI.message(msg, TX_END_CONFIRMED);
                                    c.botUI.deleteAllMarked(msg);
                                    yield end();
                                }
                                else if (type === 'end-not-confirmed') {
                                    // удалить сообщение и продолжить
                                    c.botUI.delete(msg, yesNoMsg.message_id);
                                    yield c.botUI.message(msg, TX_END_NOT_CONFIRMED, { mark_to_remove: true });
                                }
                            })
                        });
                    }
                })
            });
        });
    }
    // - - - - - - - - - - - - - - - 
    // если выбран параметр редакирования инструмента
    if (editTools) {
        yield ObjectTools(c.data[msg.chat.id].from, end);
        return;
    }
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        if (!found) {
            yield c.botUI.message(msg, TX_INITIAL_MESSAGE_NO_TOOLS, { mark_to_remove: true });
            return;
            // заканчиваем полностью сценарий, так как нет инструмента для возврата,
            // либо перекидывания между объектами
        }
        // Если только один обьект то пропускаем выбор
        const keyArr = Object.keys(toolsOrderedByObject);
        if (keyArr.length === 1) {
            yield ObjectTools(keyArr[0], end);
            return;
        }
        const tx = c.data[msg.chat.id].type === 'Возврат' ? TX_INITIAL_MESSAGE_RETURN : TX_INITIAL_MESSAGE_BETWEEN;
        yield c.botUI.message(msg, tx, { mark_to_remove: true });
        // objectData
        // console.log(toolsOrderedByObject) 
        for (const objectID in toolsOrderedByObject) {
            const ind = objectData['Auto #'].indexOf(objectID);
            const objName = ind !== -1 ? objectData['Название'][ind] : "Объект не найден";
            const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
            const btns = opts.reply_markup.inline_keyboard[0];
            // btns.push({ 
            //     text: TX_BTN_RETURN_ALL, 
            //     callback_data: 'all' + '_' + objectID,
            // })
            btns.push({
                text: TX_BTN_RETURN_SELECT,
                callback_data: 'select' + '_' + objectID
            });
            let toolsStr = 'Инструмент: ' + toolsOrderedByObject[objectID].length + ' шт.';
            // Object.values(toolsOrderedByObject[objectID]).map(function(item:any) {
            //     toolsStr += '*' + toolsData['Наименование'][item] + '*' + ' (' + toolsData['Описание'][item] + ')' + '\n'
            // }) 
            yield c.botUI.message(msg, "Объект: *" + objName + "*\n" +
                toolsStr, opts);
            // for( const ind of toolsOrderedByObject[requestID]) {
            //     msgStr += "*"+ toolsData['Наименование'][ind] + "* | "
            //     msgStr += toolsData['Описание'][ind] + "\n"
            //     msgStr += toolsData['Местонахождение'][ind] + "\n"
            //     msgStr += "Статус заявки: *"+ toolsData['Статус'][ind] + "*\n"
            //     msgStr += "\n"
            // }
        }
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const type = query.data.split('_')[0];
            const oid = query.data.split('_')[1];
            if (type === 'select') {
                c.data[msg.chat.id].from = oid;
                yield ObjectTools(oid, end);
            }
        })
    });
});
