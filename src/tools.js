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
const search_1 = require("./common/search");
const LINK_TABLE = 'https://docs.google.com/spreadsheets/d/12LFi9eXfizondNQgE7sBqrMr78Mt6pRnz8Jbuhzv14k/edit?usp=sharing';
const TX_INITIAL_MESSAGE = '*Добавление инструмента*:';
const TX_SEARCH_MESSAGE = '*Для 🔎 поиска пиши запрос в тексте сообщения* ' +
    'или перечисли номера инструмента после знака # (пример: "# 100 110 111")';
const TX_INITIAL_MESSAGE_EDIT = '*Редактирование инструмента*:';
const TX_SEARCH_NORESULT = "По запросу ничего не найдено";
const TX_END_MESSAGE = "Для выхода из добавления инструмента нажмите";
const TX_BUTTON_ADD = "Добавить";
const TX_BUTTON_PHOTO = "Фото";
const TX_BUTTON_DELETE = "Удалить";
const TX_BUTTON_END = "Закончить добавление >>";
const TX_BUTTON_TOOLS_LIST = "Список инструментов";
const TX_BUTTON_EDIT_END = "Закончить редактирование >>";
const TX_FOUND_1 = 'Найдено ';
const TX_FOUND_2 = ' (лимит ';
const TX_FOUND_3 = ')';
const TX_TOOL = 'Добавлено: ';
const TX_ALREADY_TOOL = 'Инструмент уже добавлен: ';
const TX_END_CONFIRM_REQUEST = "Инструмент не добавлен. Оставить заявку без инструмента?";
const TX_BUTTON_CONFIRM = 'Да';
const TX_BUTTON_NOT_CONFIRM = 'Нет';
const TX_END_CONFIRMED = "Понял, *продолжаем без инструмента*";
const TX_END_NOT_CONFIRMED = "Продолжим добавление";
// ограничить вывод поиска до (шт)
const SEARCH_LIMIT = 6;
exports.default = (msg, c, editMode, end) => __awaiter(void 0, void 0, void 0, function* () {
    const addedToolsMessages = {}; //ассоциативный масив key->msgId (для замены на сообщения без [Delete] btn)
    const searchResultMessages = {};
    const cachedObject = {}; //хранит весь поиск сессии
    let yesNoMsg; //confirmation сообщение для удаления
    let addedTools = c.data[msg.chat.id].tools;
    let showFoundedToolAndCashIt = (id, name, desc, photoUrl) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log(name)
        // console.log(desc)
        // console.log(photoUrl)
        // console.log('- - -')
        const opts = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_ADD, callback_data: "add_" + id }]]
            },
            // mark_to_remove: true
        };
        // can be undefined!
        if (photoUrl) {
            opts.reply_markup.inline_keyboard[0].push({ text: TX_BUTTON_PHOTO, url: photoUrl });
        }
        const nmsg = yield c.botUI.message(msg, `#${id} *${desc}*\n${name}`, opts);
        searchResultMessages[String(id)] = nmsg.message_id;
        cachedObject[String(id)] = { name: name, desc: desc };
    });
    let showAddedTool = (id, name, desc) => __awaiter(void 0, void 0, void 0, function* () {
        const opts = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_DELETE, callback_data: "delete_" + id }]]
            }
        };
        const nmsg = yield c.botUI.message(msg, TX_TOOL + '#' + id + ' *' + desc + '*' +
            '\n' + name, opts);
        // добавляем с возможностью будущего удаления
        addedToolsMessages[String(id)] = nmsg.message_id;
    });
    let addTool = (id, name, desc) => __awaiter(void 0, void 0, void 0, function* () {
        addedTools[id] = '#' + id + ' ' + desc + '(' + name + ')';
    });
    let showEndMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        const endOpts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: TX_BUTTON_TOOLS_LIST, url: LINK_TABLE }],
                    [{ text: editMode ? TX_BUTTON_EDIT_END : TX_BUTTON_END, callback_data: 'end' }]
                ]
            },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, TX_END_MESSAGE, endOpts);
    });
    let clearsearchResultMessagess = () => {
        // очистим вручную список найденных иснтсрументов, которые не были удалены при добавлении
        for (const prop in searchResultMessages) {
            c.botUI.delete(msg, searchResultMessages[prop]);
            delete searchResultMessages[prop];
        }
    };
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        if (!editMode) { // S.Первичное добавление
            yield c.botUI.message(msg, TX_INITIAL_MESSAGE, { mark_to_remove: true });
            yield showEndMessage();
            yield c.botUI.message(msg, TX_SEARCH_MESSAGE, { mark_to_remove: true });
        }
        else { // S.Редактирование списка 
            yield c.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT);
            yield c.botUI.message(msg, TX_SEARCH_MESSAGE, { mark_to_remove: true });
            let tools = yield (0, search_1.GetToolsByIds)(c, c.data[msg.chat.id].tools ? c.data[msg.chat.id].tools : {});
            // Вывод предыдущего списка.
            for (const o of tools) {
                yield showAddedTool(o.id, o.name, o.desc);
                cachedObject[String(o.id)] = { name: o.name, desc: o.desc };
            }
            yield showEndMessage();
        }
    }), {
        message: (msg) => __awaiter(void 0, void 0, void 0, function* () {
            // S.Результаты поиска
            // очистим предыдущий список сообщений            
            c.botUI.deleteAllMarked(msg);
            yield clearsearchResultMessagess();
            // messagesToRemove = [msg.message_id]
            c.botUI.markToDelete(msg, msg.message_id); //добавляем для будущего удалению сообщение пользователя
            // V1 добавление сразу по ID
            // Например #23 132 35 45
            // какойто ID может быть не найде
            if (msg.text.indexOf('#') !== -1) {
                let strArr = msg.text.split('#');
                const searchRes = yield (0, search_1.SearchToolsByIds)(c, strArr[1]);
                if (searchRes.length) {
                    for (let i = 0; i < searchRes.length; i++) {
                        const o = searchRes[i];
                        // проверяем не был ли добавлен инструмент ранее
                        if (addedTools[String(o.id)] === undefined) {
                            cachedObject[String(o.id)] = { name: o.name, desc: o.desc };
                            // Показываем и сразудобавляем инструменты
                            yield showAddedTool(o.id, cachedObject[String(o.id)].name, cachedObject[String(o.id)].desc);
                            yield addTool(String(o.id), cachedObject[String(o.id)].name, cachedObject[String(o.id)].desc);
                        }
                        else {
                            yield c.botUI.message(msg, TX_ALREADY_TOOL + '#' + o.id + ' *' + o.desc + '*' + '\n' + o.name, { mark_to_remove: true });
                        }
                    }
                }
                // console.log(searchRes)
                // await showAddedTool(id, cachedObject[id].name, cachedObject[id].desc)
                // await addTool(id, cachedObject[id].name, cachedObject[id].desc)
            }
            else {
                // V2 поиск и вывод резкльтата
                const searchRes = yield (0, search_1.SearchToolsByStr)(c, msg.text);
                if (searchRes.length) {
                    let cur_i = 0;
                    for (let i = 0; i < searchRes.length; i++) {
                        const o = searchRes[i];
                        // показываем только те, которые не добавлены
                        if (cur_i < SEARCH_LIMIT)
                            if (addedTools && !addedTools[String(o.id)]) {
                                yield showFoundedToolAndCashIt(o.id, o.name, o.desc, o.url);
                                cur_i++;
                            }
                    }
                    yield c.botUI.message(msg, TX_FOUND_1 + cur_i + TX_FOUND_2 + SEARCH_LIMIT + TX_FOUND_3, { mark_to_remove: true });
                }
                else {
                    yield c.botUI.message(msg, TX_SEARCH_NORESULT, { mark_to_remove: true });
                }
            }
            yield showEndMessage();
        }),
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.data === 'end') { // Нажато закончить 
                if (Object.keys(addedTools).length === 0) { // Подтверждение   
                    const opts = {
                        reply_markup: {
                            inline_keyboard: [[{ text: TX_BUTTON_CONFIRM, callback_data: 'end-confirmed' },
                                    { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'end-not-confirmed' }]]
                        },
                        mark_to_remove: true
                    };
                    yesNoMsg = yield c.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts);
                }
                else { //  S.S Закончить
                    c.data[msg.chat.id].tools = addedTools;
                    c.botUI.deleteAllMarked(msg);
                    yield clearsearchResultMessagess();
                    // заменяем все добавленные на сообщения без кнопки
                    for (const id in addedToolsMessages) {
                        c.botUI.delete(msg, addedToolsMessages[id]);
                        yield c.botUI.message(msg, TX_TOOL + '#' + id + ' *' + cachedObject[id].desc + '*' +
                            '\n' + cachedObject[id].name);
                    }
                    yield end();
                }
                // S. нажата кнопка подтверждения выхода без инструмента
            }
            else if (query.data === 'end-confirmed') {
                c.data[msg.chat.id].tools = addedTools;
                yield c.botUI.message(msg, TX_END_CONFIRMED);
                c.botUI.deleteAllMarked(msg);
                yield clearsearchResultMessagess();
                yield end();
                // S. продолжаем добавление инструмента
            }
            else if (query.data === 'end-not-confirmed') {
                // удалить сообщение и продолжить
                c.botUI.delete(msg, yesNoMsg.message_id);
                yield c.botUI.message(msg, TX_END_NOT_CONFIRMED, { mark_to_remove: true });
            }
            else { //S. Пришел ID
                // "add_23"
                // "delete_23
                const type = query.data.split('_')[0];
                const id = query.data.split('_')[1];
                if (type === 'add') { // S.S Пришел add_ID
                    // if(addedTools.includes(id)) {
                    //     await c.botUI.message(msg, cachedObject[id].name + TX_EXISTS_2, {mark_to_remove: true})
                    // } else {
                    yield showAddedTool(id, cachedObject[id].name, cachedObject[id].desc);
                    yield addTool(id, cachedObject[id].name, cachedObject[id].desc);
                    yield c.botUI.delete(msg, searchResultMessages[id]);
                    delete searchResultMessages[id];
                    // }  
                }
                else { // S.S Пришел delete_ID
                    c.botUI.delete(msg, addedToolsMessages[id]);
                    delete addedToolsMessages[id];
                    if (addedTools[id]) {
                        delete addedTools[id];
                    }
                }
            }
        })
    });
});
