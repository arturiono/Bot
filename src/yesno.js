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
const TX_BTN_YES = "Да";
const TX_BTN_NO = "Нет";
exports.default = (msg, c, initialMsg, yes, no) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('HAPPEN')
    // console.log(initialMsg)
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        const opts = {
            reply_markup: { inline_keyboard: [
                    [{
                            text: TX_BTN_YES,
                            callback_data: 'yes',
                        },
                        {
                            text: TX_BTN_NO,
                            callback_data: 'no',
                        }]
                ] },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, initialMsg, opts);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.data === 'yes') {
                yield yes();
                // c.botUI.deleteAllMarked(msg)
                // c.data[msg.chat.id].status = 'Отмена'
                // await saveRequest(msg, c, id, true) //save only status
                // zayavkiTable['Статус'][ind] = 'Отмена'
                // await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiTable), true, usersTable))
                // await c.botUI.message(msg, TX_EDIT_CANCELED)
                // //пишем мастеру
                // await Notify(msg, c, TX_EDIT_CANCELED_IMFO + '\n' + 
                //     dataToMessage(c.data[msg.chat.id]), c.data[msg.chat.id].user) 
            }
            else {
                // c.botUI.deleteAllMarked(msg)
                // thisIs(msg, c, end)
                yield no();
            }
        })
    });
});
