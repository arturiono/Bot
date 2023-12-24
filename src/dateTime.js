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
const Calendar = require('telegram-inline-calendar');
const TX_INITIAL_QUESTION_SELF = 'Когда хочешь забрать?';
const TX_INITIAL_QUESTION_DELIVERY = 'К какому времени привезти?';
const TX_CUSTOM_QUESTION = 'Выберите дату и время:';
// %%% ПОБЫСТРЕЕ %%%
const TX_BTN_ASAP = 'По готовности';
const TX_BTN_CUSTOM_TIME = 'Точная дата и время'; //%%% сделать выбор не позднее чем через 12 часов
const TX_ASAP_REPLY = 'Понял, *по готовности*. Менеджер свяжется для уточнения времени';
const TX_CUSTOM_REPLY = 'Дата и время: ';
// lastMessage - needed to start Calendar Navigation
exports.default = (msg, c, editMode, end) => __awaiter(void 0, void 0, void 0, function* () {
    // Дата начала в календаре ("YYYY-MM-DD")
    const dt = new Date();
    // const fromDate = dt.getFullYear() + "-" + (dt.getMonth()+1) + "-" + (dt.getDate()) // +1день
    // console.log(fromDate)
    const calendar = new Calendar(c.botUI.bot, {
        date_format: 'DD-MM-YYYY',
        language: 'ru',
        close_calendar: true,
        time_selector_mod: true,
        // time_range: "05:00-23:59",
        time_step: "1h",
        custom_start_msg: TX_CUSTOM_QUESTION,
        // start_date: fromDate,
        // stop_date: false,
    });
    let delMsg;
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const opts = { reply_markup: { inline_keyboard: [
                    [{
                            text: TX_BTN_CUSTOM_TIME,
                            callback_data: 'custom'
                        }],
                    [{
                            text: TX_BTN_ASAP,
                            callback_data: 'asap',
                        }],
                ] } };
        const TX = c.data[msg.chat.id].delivery === 'Нет' ? TX_INITIAL_QUESTION_SELF : TX_INITIAL_QUESTION_DELIVERY;
        delMsg = yield c.botUI.message(msg, TX, opts);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            c.botUI.delete(msg, delMsg.message_id); //delete last message
            if (query.data === 'asap') {
                c.data[msg.chat.id].dateTime = 'По готовности';
                yield c.botUI.message(msg, TX_ASAP_REPLY);
                end();
            }
            else {
                c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
                    calendar.startNavCalendar(msg);
                }), {
                    callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
                        if (query.message.message_id == calendar.chats.get(query.message.chat.id)) {
                            let res = calendar.clickButtonCalendar(query);
                            if (res !== -1) {
                                // parse 't_2023-08-17 09:30_0'
                                const d = query.data.split(' ');
                                const date = d[0].split('_')[1];
                                const time = d[1].split('_')[0];
                                yield c.botUI.message(msg, TX_CUSTOM_REPLY + '*' + date + ' | ' + time + '*');
                                c.data[msg.chat.id].dateTime = date + ' | ' + time;
                                end();
                            }
                        }
                    })
                });
            }
        })
    });
});
