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
const requestConverter_1 = require("../common/requestConverter");
const saveRequest_1 = require("../common/saveRequest");
const yesno_1 = __importDefault(require("../yesno"));
// import Confirm from '../confirm'
const edit_1 = __importDefault(require("../edit"));
const notify_1 = __importDefault(require("../common/notify"));
// import { ABReqest } from '../../types/types';
const TX_NO_ZAYAVOK = 'Нет активных заявок';
// const TX_MY_ZAYAVKI = "Заявки"
// const TX_PAGE = "страница"
const TX_BTN_STATUS = "Cтатус";
const TX_BTN_EDIT = "Редактировать";
const TX_NAVIAGTION = 'Навигация';
const TX_BUTTON_BACK = '<< Вернутся к списку';
const TX_SELECT_STATUS = "Смена статуса:";
const TX_CONFIRN_CANCEL = "*Точно отменяем?*\nПосле отмены заявка будет закрыта и недоступна для редактирования";
const TX_CONFIRN_OBJ = "*Точно инструмент и материал на обьекте?*\nПосле подтверждение заявка будет закрыта, а инструменты и метериалы буду зафиксированы на объекте";
// const TX_BTN_YES = "Да"
// const TX_BTN_NO = "Нет"
const STATUS_OBRABOTKA = "Обработка";
const STATUS_SOBRAN = "Собран";
const STATUS_DOSTAVKA = "Доставка";
const STATUS_OBJ = "Объект";
const STATUS_SKLAD = "Склад";
const STATUS_CANCEL = "Отмена";
const TX_EDIT_CONFIRMED = "💊 *Заявка обновлена*. Отправил информацию мастеру";
const TX_EDIT_CONFIRMED_INFO = "💊 Твоя заявка была обновлена менджером:";
const TX_EDIT_CANCELED = "⛔️ *Заявка отменена*. Отправил информацию мастеру";
const TX_EDIT_CANCELED_IMFO = "⛔️ Твоя *заявка была отменена* менджером:";
const TX_EDIT_STATUS = "🚀 *Cтатус заявки изменен*. Отправил информацию мастеру";
const TX_EDIT_STATUS_INFO = "🚀 Cтатус заявки был изменен менджером:";
// Задачи
// 1. Показать все авткальные заявки
// 1.a Знать кто создал заявку
// const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:'
// page = 1,2,3 ...
let zayavkiTable;
let usersTable;
const Manager = (msg, c, end, updateData = true) => __awaiter(void 0, void 0, void 0, function* () {
    if (updateData) {
        zayavkiTable = yield c.tableUI.getList('Заявки', [
            '#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B',
            'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'
        ]);
        usersTable = yield c.tableUI.getList('Сотрудники', [
            '#', 'ФИО', 'Роль', 'ChatId'
        ]);
    }
    else {
        if (zayavkiTable === undefined)
            console.log('Ошибка. Данные zayavkiTable не были ранее закэшированы.');
        if (usersTable === undefined)
            console.log('Ошибка. Данные usersTable не были ранее закэшированы.');
    }
    // // реверс порядок для массива
    // for(const key in zayavkiTable) {
    //     zayavkiTable[key] = zayavkiTable[key].reverse()
    // }
    // console.log(zayavkiTable)
    const messagesIds = {};
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        yield c.botUI.deleteAllMarked(msg);
        let found = false;
        for (const [i, phone] of zayavkiTable['Cотрудник'].entries()) {
            // только актуальные заявки показываем
            if (zayavkiTable['Статус'][i] !== 'Отмена'
                && zayavkiTable['Статус'][i] !== 'Объект'
                && zayavkiTable['Статус'][i] !== 'Склад') {
                found = true;
                const opts = {
                    reply_markup: { inline_keyboard: [
                            []
                        ] },
                    mark_to_remove: true
                };
                const btns = opts.reply_markup.inline_keyboard[0];
                // 'Отменить', 'Редактировать'
                btns.push({
                    text: TX_BTN_STATUS,
                    callback_data: 'status' + '_' + zayavkiTable['#'][i] + '_' + i,
                });
                btns.push({
                    text: TX_BTN_EDIT,
                    callback_data: 'edit' + '_' + zayavkiTable['#'][i] + '_' + i, //_id_i //индекс
                });
                let dt = (0, requestConverter_1.zayavkaToData)(i, zayavkiTable);
                let zayavka = (0, requestConverter_1.dataToMessage)(dt, true, usersTable);
                const nmsg = yield c.botUI.message(msg, zayavka, opts);
                messagesIds[zayavkiTable['#'][i]] = nmsg.message_id;
            }
        }
        if (!found)
            yield c.botUI.message(msg, TX_NO_ZAYAVOK, { mark_to_remove: true });
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const split = query.data.split('_');
            const type = split[0];
            const id = split[1]; //id 
            const ind = split[2]; //ind
            if (type === 'edit') {
                c.botUI.deleteAllMarked(msg);
                // заполняем данным c.data - временную контекстную модель заявки
                c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(ind, zayavkiTable);
                // %%% ВМЕСТО Confirm startFromEdit пишем нормальтную логику вместо Confirm
                // %%% тоже самое для moizayavki
                // Cofirm2
                // - вернутся
                // - 
                yield (0, edit_1.default)(msg, c, (isEdited) => __awaiter(void 0, void 0, void 0, function* () {
                    if (isEdited) {
                        yield (0, saveRequest_1.saveRequest)(msg, c, id);
                        yield c.botUI.message(msg, TX_EDIT_CONFIRMED);
                        // уведомляем мастера
                        let usersTable = yield c.tableUI.getList('Сотрудники', ['#', 'Роль', 'ChatId']);
                        yield (0, notify_1.default)(msg, c, TX_EDIT_CONFIRMED_INFO + '\n'
                            + (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id]), usersTable, c.data[msg.chat.id].user); //пишем мастеру
                    }
                    else {
                        // console.log('ВЕРНУТЬСЯ HAPPEN')
                        yield Manager(msg, c, end);
                    }
                }), false, usersTable); // запускаем сценарий confirmation сразу с редактирования
            }
            else if (type === 'status') {
                c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
                    c.botUI.deleteAllMarked(msg);
                    c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(ind, zayavkiTable);
                    yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], true, usersTable), { mark_to_remove: true });
                    const opts = {
                        reply_markup: { inline_keyboard: [] }, mark_to_remove: true
                    };
                    const btns = opts.reply_markup.inline_keyboard;
                    const z = c.data[msg.chat.id];
                    let obrabotka = () => {
                        if (z.status !== STATUS_OBRABOTKA)
                            btns.push([{
                                    text: STATUS_OBRABOTKA,
                                    callback_data: STATUS_OBRABOTKA + '_' + zayavkiTable['#'][ind] + '_' + ind,
                                }]);
                    };
                    let sobran = () => {
                        if (z.delivery === 'Нет' && z.status !== STATUS_SOBRAN)
                            btns.push([{
                                    text: STATUS_SOBRAN,
                                    callback_data: STATUS_SOBRAN + '_' + zayavkiTable['#'][ind] + '_' + ind,
                                }]);
                    };
                    let dostavka = () => {
                        if (z.delivery === 'Да' && z.status !== STATUS_DOSTAVKA)
                            btns.push([{
                                    text: STATUS_DOSTAVKA,
                                    callback_data: STATUS_DOSTAVKA + '_' + zayavkiTable['#'][ind] + '_' + ind,
                                }]);
                    };
                    let object = () => {
                        // if(z.status !== STATUS_OBJ) //в текщей логике никогда не выполдняеться
                        btns.push([{
                                text: STATUS_OBJ,
                                callback_data: STATUS_OBJ + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }]);
                    };
                    let sklad = () => {
                        // if(z.status !== STATUS_SKLAD) //в текщей логике никогда не выполдняеться
                        btns.push([{
                                text: STATUS_SKLAD,
                                callback_data: STATUS_SKLAD + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }]);
                    };
                    let otmena = () => {
                        // if(z.status !== STATUS_CANCEL) //в текщей логике никогда не выполдняеться
                        btns.push([{
                                text: STATUS_CANCEL,
                                callback_data: STATUS_CANCEL + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }]);
                    };
                    // type = Со склада (кнопки)
                    // "Обработка", "Собран", ("Доставка"), "Объект"
                    // type = Возврат
                    // "Обработка", ("Доставка"), "Склад"
                    // type =  Между объектами 
                    // "Обработка", ("Доставка"), "Объект"
                    // type = Свободная
                    // "Обработка" -> "Собран" -> "Доставка" -> "Объект" -> "Склад"
                    if (z.type === 'Со склада') {
                        obrabotka();
                        sobran();
                        dostavka();
                        object();
                        otmena();
                    }
                    else if (z.type === 'Возврат') {
                        obrabotka();
                        dostavka();
                        sklad();
                        otmena();
                    }
                    else if (z.type === 'Между объектами') {
                        obrabotka();
                        dostavka();
                        object();
                        otmena();
                    }
                    else if (z.type === 'Свободная') {
                        obrabotka();
                        sobran();
                        dostavka();
                        object();
                        sklad();
                        otmena();
                    }
                    // сообщение с кнопками
                    yield c.botUI.message(msg, TX_SELECT_STATUS, opts);
                    const opts2 = {
                        reply_markup: { inline_keyboard: [[
                                    {
                                        text: TX_BUTTON_BACK,
                                        callback_data: 'back',
                                    }
                                ]] }, mark_to_remove: true
                    };
                    yield c.botUI.message(msg, TX_NAVIAGTION, opts2);
                }), {
                    callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
                        const split = query.data.split('_');
                        const type = split[0];
                        const id = split[1];
                        const ind = split[2];
                        if (type === 'back') {
                            c.botUI.deleteAllMarked(msg);
                            yield Manager(msg, c, end);
                            // const STATUS_OBRABOTKA = "Обработка"
                            // const STATUS_SOBRAN = "Собран"
                            // const STATUS_DOSTAVKA = "Доставка"
                            // const STATUS_OBJ = "Объект"
                            // const STATUS_SKLAD = "Склад"
                            // const STATUS_CANCEL = "Отмена"
                        }
                        else if (type === STATUS_OBRABOTKA || type === STATUS_SOBRAN
                            || type === STATUS_DOSTAVKA || type === STATUS_OBJ || type === STATUS_SKLAD) {
                            let save = () => __awaiter(void 0, void 0, void 0, function* () {
                                c.botUI.deleteAllMarked(msg);
                                c.data[msg.chat.id].status = type;
                                yield (0, saveRequest_1.saveRequest)(msg, c, id, true); //save only status
                                // если все хорошо и нет ошибки, то сразу меняем сатус в КЭШ (не спрашиваем у сервера)
                                zayavkiTable['Статус'][ind] = type;
                                yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)((0, requestConverter_1.zayavkaToData)(ind, zayavkiTable), true, usersTable));
                                yield c.botUI.message(msg, TX_EDIT_STATUS);
                                //пишем мастеру
                                yield (0, notify_1.default)(msg, c, TX_EDIT_STATUS_INFO + '\n' +
                                    (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id]), usersTable, c.data[msg.chat.id].user);
                            });
                            // Возврат на склад и инструмент на объекте - необратимы статусы в текуще реализации
                            if (type === STATUS_OBJ || type === STATUS_SKLAD) {
                                c.botUI.deleteAllMarked(msg);
                                c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(ind, zayavkiTable);
                                yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], true, usersTable), { mark_to_remove: true });
                                yield (0, yesno_1.default)(msg, c, TX_CONFIRN_OBJ, () => __awaiter(void 0, void 0, void 0, function* () {
                                    yield save();
                                }), () => __awaiter(void 0, void 0, void 0, function* () {
                                    yield Manager(msg, c, end);
                                }));
                            }
                            else {
                                yield save();
                            }
                        }
                        else if (type === STATUS_CANCEL) {
                            c.botUI.deleteAllMarked(msg);
                            c.data[msg.chat.id] = (0, requestConverter_1.zayavkaToData)(ind, zayavkiTable);
                            yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], true, usersTable), { mark_to_remove: true });
                            yield (0, yesno_1.default)(msg, c, TX_CONFIRN_CANCEL, () => __awaiter(void 0, void 0, void 0, function* () {
                                c.botUI.deleteAllMarked(msg);
                                c.data[msg.chat.id].status = 'Отмена';
                                yield (0, saveRequest_1.saveRequest)(msg, c, id, true); //save only status
                                zayavkiTable['Статус'][ind] = 'Отмена';
                                yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)((0, requestConverter_1.zayavkaToData)(ind, zayavkiTable), true, usersTable));
                                yield c.botUI.message(msg, TX_EDIT_CANCELED);
                                //пишем мастеру
                                yield (0, notify_1.default)(msg, c, TX_EDIT_CANCELED_IMFO + '\n' +
                                    (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id]), usersTable, c.data[msg.chat.id].user);
                            }), () => __awaiter(void 0, void 0, void 0, function* () {
                                c.botUI.deleteAllMarked(msg);
                                Manager(msg, c, end);
                            }));
                            // c.botUI.context(msg, async ()=>{  
                            //     const opts = {
                            //         reply_markup: { inline_keyboard: [ 
                            //             [ { 
                            //                 text: TX_BTN_YES, 
                            //                 callback_data: 'yes_' + id + '_' + ind, 
                            //             } ,
                            //             { 
                            //                 text: TX_BTN_NO, 
                            //                 callback_data: 'no', 
                            //             } ] 
                            //         ]},
                            //         mark_to_remove: true
                            //     }
                            //     await c.botUI.message(msg, TX_CONFIRN, opts)
                            // },{ 
                            //     callback_query:
                            //     async (query:any)=>{    
                            //         const split = query.data.split('_')
                            //         const type = split[0]
                            //         const id = split[1]
                            //         const ind = split[2]
                            //         if(type === 'yes') {
                            //             c.botUI.deleteAllMarked(msg)
                            //             c.data[msg.chat.id].status = 'Отмена'
                            //             await saveRequest(msg, c, id, true) //save only status
                            //             zayavkiTable['Статус'][ind] = 'Отмена'
                            //             await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiTable), true, usersTable))
                            //             await c.botUI.message(msg, TX_EDIT_CANCELED)
                            //             //пишем мастеру
                            //             await Notify(msg, c, TX_EDIT_CANCELED_IMFO + '\n' + 
                            //                 dataToMessage(c.data[msg.chat.id]), c.data[msg.chat.id].user) 
                            //         } else {
                            //             c.botUI.deleteAllMarked(msg)
                            //             Manager(msg, c, end)
                            //         }                     
                            //     }
                            // })
                        }
                    })
                });
            }
        })
    });
});
exports.default = Manager;
