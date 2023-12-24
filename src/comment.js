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
const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:';
const TX_INITIAL_EDIT_MESSAGE = '⌨️ Введите *новый комментарий для менджера*:';
// const TX_PREV_MESSAGE = 'Ваше предыдущее сообщение было:\n'
const TX_NO_SUCCESS_MESSAGE = 'Понял, обязательно *передам менджеру*';
const TX_NO_SKIP_MESSAGE = 'Ок, *без комментариев*';
const TX_BUTTON_SKIP = 'Пропустить';
exports.default = (msg, c, editMode, end) => __awaiter(void 0, void 0, void 0, function* () {
    let msdDelID;
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const opts = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_SKIP, callback_data: 'skip' }]]
            }
        };
        const nmsg = yield c.botUI.message(msg, editMode ? TX_INITIAL_EDIT_MESSAGE : TX_INITIAL_MESSAGE, opts);
        msdDelID = nmsg.message_id;
    }), {
        message: (msg) => __awaiter(void 0, void 0, void 0, function* () {
            // console.log('HAPPEN')
            // c.botUI.delete(msg, msdDelID)
            c.data[msg.chat.id].comment = msg.text;
            c.botUI.delete(msg, msdDelID);
            yield c.botUI.message(msg, TX_NO_SUCCESS_MESSAGE);
            yield end();
        }),
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.data === 'skip') { //Skip
                c.data[msg.chat.id].comment = 'Null';
                c.botUI.delete(msg, msdDelID);
                yield c.botUI.message(msg, TX_NO_SKIP_MESSAGE);
                yield end();
            }
        })
    });
});
