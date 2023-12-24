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
const TX_INITIAL_QUESTION_ZABERU = 'Нужна доставка или сам заберешь?';
const TX_INITIAL_QUESTION_PRIVEZU = 'Нужна доставка или сам привезешь?';
const TX_BTN_SELF_ZABERU = 'Заберу сам';
const TX_BTN_SELF_PRIVESU = 'Без доставки';
const TX_BTN_DELIVERY = 'Нужна доставка';
const TX_SUCESS_DELIVERY = 'Понял, *привезем*';
const TX_SUCESS_SELF = 'Понял, *заберешь сам*';
// Сценарий выбора точки назначения
exports.default = (msg, c, editMode, end) => __awaiter(void 0, void 0, void 0, function* () {
    let delMsg;
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const opts = {
            reply_markup: { inline_keyboard: [
                    [{
                            text: c.data[msg.chat.id].type === 'Со склада' ? TX_BTN_SELF_ZABERU : TX_BTN_SELF_PRIVESU,
                            callback_data: 'self',
                        }, {
                            text: TX_BTN_DELIVERY,
                            callback_data: 'delivery',
                        }]
                ] },
            mark_to_remove: true
        };
        delMsg = yield c.botUI.message(msg, c.data[msg.chat.id].type === 'Со склада' ? TX_INITIAL_QUESTION_ZABERU : TX_INITIAL_QUESTION_PRIVEZU, opts);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            // console.log('EHUUUEHUUU')
            // console.log(msg.chat.id)
            // console.log(delMsg.message_id)
            // console.log('- - -')
            yield c.botUI.delete(msg, delMsg.message_id);
            c.data[msg.chat.id].delivery = query.data === 'delivery' ? 'Да' : 'Нет';
            const SMSG = (query.data === 'self') ? TX_SUCESS_SELF : TX_SUCESS_DELIVERY;
            yield c.botUI.message(msg, SMSG);
            end();
        })
    });
});
