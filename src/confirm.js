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
const edit_1 = __importDefault(require("./edit"));
const requestConverter_1 = require("./common/requestConverter");
const TX_INITIAL_MESSAGE = 'Проверь пожалуйста выше, *все ли верно*?';
const TX_BUTTON_CONFIRM = "Подтвердить";
const TX_BUTTON_NOT_CONFIRM = "Редактировать";
//confirm включает в себя edit (наужна рекурсия)
const Confirm = (msg, c, end) => __awaiter(void 0, void 0, void 0, function* () {
    const editNow = () => __awaiter(void 0, void 0, void 0, function* () {
        // для Confirm сценариев не важно было редактирование или нет
        yield (0, edit_1.default)(msg, c, (isEdited) => __awaiter(void 0, void 0, void 0, function* () {
            if (isEdited)
                yield end();
            else
                yield Confirm(msg, c, end);
        }), false);
    });
    c.botUI.deleteAllMarked(msg);
    const nmsg = yield c.botUI.message(msg, (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id]), { mark_to_remove: true });
    c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
        // показываем заявку
        // console.log(c.data[msg.chat.id])
        // console.log(Zayavka([c.data[msg.chat.id]]))
        const opts = {
            reply_markup: {
                inline_keyboard: [[
                        { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
                        { text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' }
                    ]]
            },
            mark_to_remove: true
        };
        yield c.botUI.message(msg, TX_INITIAL_MESSAGE, opts);
    }), {
        callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.data === 'confirmed') {
                c.botUI.deleteFromMarked(msg, nmsg.message_id); //оставляем последнее сообщение нв ленте
                c.botUI.deleteAllMarked(msg);
                yield end();
            }
            else {
                c.botUI.deleteAllMarked(msg);
                yield editNow();
            }
        })
    });
});
exports.default = Confirm;
