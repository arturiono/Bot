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
const tools_1 = __importDefault(require("./tools"));
const rashodniki_1 = __importDefault(require("./rashodniki"));
const comment_1 = __importDefault(require("./comment"));
const dateTime_1 = __importDefault(require("./dateTime"));
const dostavka_1 = __importDefault(require("./dostavka"));
const toObject_1 = __importDefault(require("./toObject"));
const fromObjectTools_1 = __importDefault(require("./fromObjectTools"));
const requestConverter_1 = require("./common/requestConverter");
const TX_INTIAL_MESSAGE = "Что нужно редактировать?";
// %%% перенеси сообщение про редактирование внутрь модуля  
// const TX_ADD_OBJECT_FROM = "*Изменение* объекта отправления:"
const TX_OBJECT_TO = "*Изменение* объекта назначения:";
const TX_DOSTAVKA = "*Изменение* типа доставки:";
const TX_TIME = "*Изменение* времени:";
// const TX_ADD_INSTRUMENT = "*Редактирование* списка инструмента:"
const TX_ADD_COMMENT = "*Изменение* комментария:";
const TX_BUTTON_FROM_OBJECT = "С объекта";
const TX_BUTTON_FROM_OBJECT_TOOLS = "Инструмент";
const TX_BUTTON_OBJECT_TO = "На объект";
const TX_BUTTON_DOSTAVKA = "Доставка";
const TX_BUTTON_TIME = "Дата и время";
const TX_BUTTON_INSTRUMENT = "Инсрумент";
const TX_BUTTON_RASHODNIKI = "Расходные материалы";
const TX_BUTTON_COMMENT = "Комментарий";
const TX_NAVIGATION = "Навигация";
const TX_BUTTON_BACK = "Вернуться";
const TX_SAVE = "Сохранение";
const TX_BUTTON_SAVE = "Подтвердить";
// предлагаем пользователю вернутся в сценарии редактирования
const Edit = (msg, c, end, editingHappen, usersTable) => __awaiter(void 0, void 0, void 0, function* () {
    const objectsTable = yield c.tableUI.getList('Обьекты', ['Auto #', 'Название']);
    let nmsg;
    let showZayavka = () => __awaiter(void 0, void 0, void 0, function* () {
        const showName = usersTable ? true : false;
        nmsg = yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], objectsTable, showName, usersTable), { mark_to_remove: true });
    });
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        c.botUI.deleteAllMarked(msg);
        yield showZayavka();
        const optsC = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: editingHappen ? TX_BUTTON_SAVE : TX_BUTTON_BACK,
                            callback_data: editingHappen ? 'backAndEdit' : 'back' }]
                ]
            },
            mark_to_remove: true
        };
        const opts = {
            reply_markup: {
                inline_keyboard: [[], [], []]
            },
            mark_to_remove: true
        };
        const line1 = opts.reply_markup.inline_keyboard[0];
        const line2 = opts.reply_markup.inline_keyboard[1];
        const line3 = opts.reply_markup.inline_keyboard[2];
        // логика для редактирования объекотв назначения / отправления
        // !!! конечный автомат, лучше параметризации (всегда!)
        // + контролиоуемо!
        // + поняттно!
        // + машстабируемо
        // - многа букав
        if (c.data[msg.chat.id].type === 'Со склада') {
            line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: 'object_to' });
            line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' });
            line1.push({ text: TX_BUTTON_TIME, callback_data: 'time' });
            line2.push({ text: TX_BUTTON_INSTRUMENT, callback_data: 'tools' });
            line2.push({ text: TX_BUTTON_RASHODNIKI, callback_data: 'rashodnniki' });
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' });
        }
        else if (c.data[msg.chat.id].type === 'Возврат') {
            line1.push({ text: TX_BUTTON_FROM_OBJECT, callback_data: 'from_object' });
            line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: 'from_object_tools' });
            line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' });
            line2.push({ text: TX_BUTTON_TIME, callback_data: 'time' });
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' });
        }
        else if (c.data[msg.chat.id].type === 'Между объектами') {
            line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: 'from_object_tools' });
            line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: 'object_to' });
            line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' });
            line2.push({ text: TX_BUTTON_TIME, callback_data: 'time' });
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' });
        }
        else if (c.data[msg.chat.id].type === 'Свободная') {
            line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' });
            line1.push({ text: TX_BUTTON_TIME, callback_data: 'time' });
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' });
        }
        yield c.botUI.message(msg, TX_INTIAL_MESSAGE, opts);
        yield c.botUI.message(msg, editingHappen ? TX_SAVE : TX_NAVIGATION, optsC);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            c.botUI.deleteAllMarked(msg);
            yield showZayavka();
            if (query.data === 'tools') {
                yield (0, tools_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    // end(true)
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'rashodnniki') {
                yield (0, rashodniki_1.default)(msg, c, true, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    // end(true)
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'comment') {
                yield c.botUI.message(msg, TX_ADD_COMMENT); //%%% move inside module
                yield (0, comment_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    // end(true)
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'time') {
                yield c.botUI.message(msg, TX_TIME); //%%% move inside module
                yield (0, dateTime_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'dostavka') {
                yield c.botUI.message(msg, TX_DOSTAVKA); //%%% move inside module
                yield (0, dostavka_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'object_tools') {
                yield c.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS);
                yield (0, fromObjectTools_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'from_object_tools') {
                yield c.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS);
                yield (0, fromObjectTools_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'object_to') {
                yield c.botUI.message(msg, TX_OBJECT_TO); //%%% move inside module
                yield (0, toObject_1.default)(msg, c, true, () => __awaiter(void 0, void 0, void 0, function* () {
                    // end(true)
                    yield Edit(msg, c, end, true);
                }));
            }
            else if (query.data === 'back') {
                c.botUI.deleteAllMarked(msg);
                yield end(false);
            }
            else if (query.data === 'backAndEdit') {
                if (nmsg)
                    c.botUI.deleteFromMarked(msg, nmsg.message_id); //оставляем последнее сообщение нв ленте
                yield end(true);
            }
        })
    });
});
exports.default = Edit;
// const opts = {
//     reply_markup: {
//         inline_keyboard: [[{ text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' },
//                 { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' }]]
//     }
// };
// yield c.botUI.message(msg, 'Проверь пожалуйста, все ли верно?', { mark_to_remove: true });
// callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
//     if (query.data === 'confirmed') {
//         yield c.botUI.message(msg, TX_REQEST_CONFIRMED);
//         c.botUI.deleteAllMarked(msg);
//         end();
//     }
//     else {
//         c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[
//                             { text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                         ]]
//                 }
//             };
//         }), {});
//     }
// })
