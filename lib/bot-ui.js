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
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// msg - used to get chatId to separate users reqests and conext between
class BotUI {
    constructor(token, opt, events) {
        // chatId specific arrays
        this.replyContext = {};
        this.messagesToRemove = {}; // сообщения которые накапливаем через opt.mark_to_remove = true
        this.events = events;
        this.bot = new node_telegram_bot_api_1.default(token, opt);
        // console.log(this.bot)
        // обработчик для любого события message, callback_query, contact и пр.
        events.forEach((event) => {
            this.bot.on(event, (obj) => {
                let callbackChatId = '';
                if (event === 'message')
                    callbackChatId = String(obj.chat.id);
                if (event === 'callback_query')
                    callbackChatId = String(obj.message.chat.id);
                if (event === 'contact')
                    callbackChatId = String(obj.chat.id);
                if (this.replyContext[callbackChatId] &&
                    this.replyContext[callbackChatId][event] &&
                    typeof this.replyContext[callbackChatId][event] == 'function') {
                    // console.log('CALLED EVENТ:')
                    // console.log(event)
                    this.replyContext[callbackChatId][event](obj);
                }
                return;
            });
        });
    }
    commands(obj) {
        Object.keys(obj).forEach((key) => __awaiter(this, void 0, void 0, function* () {
            this.bot.onText(new RegExp(`\/${key}`), (msg) => __awaiter(this, void 0, void 0, function* () {
                // this.lastMessage = msg
                // this.chatId = msg.chat.id //сохраняем каждый раз
                yield obj[key](msg);
            }));
        }));
    }
    // создаёт новый контекст для перехвата ответов
    context(msg, question, replyObj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield question.call();
            // %%% - важно! не происходит перехват событий которые не были заменены в новом контексте
            // woraround - resetContext???
            // %%%%!!!! Clear Conntextex memory!
            this.replyContext[msg.chat.id] = replyObj;
        });
    }
    // обертка для telegram sendMessage
    message(msg, text, opt = undefined, customChatId = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            // добавялем markdown по умолчанию
            const nopt = (opt !== null && opt !== undefined) ? opt : {};
            nopt.parse_mode = 'Markdown';
            const chatId = customChatId ? customChatId : msg.chat.id;
            const nmsg = yield this.bot.sendMessage(chatId, text, nopt);
            // заводим сразу массив для удаления сообещений
            if (!this.messagesToRemove[msg.chat.id])
                this.messagesToRemove[msg.chat.id] = [];
            if (opt && opt.mark_to_remove) {
                this.messagesToRemove[msg.chat.id].push(nmsg.message_id);
            }
            return nmsg;
        });
    }
    // text possible null
    // customChatId? - optional
    // spport reply_markup in opt
    editMessage(msg, msgId, text, opt, customChatId = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const nopt = (opt !== undefined && opt !== null) ? opt : {};
            nopt.parse_mode = 'Markdown'; // add markdown by default
            const chatId = customChatId ? customChatId : msg.chat.id;
            if (chatId) {
                if (text !== null)
                    try { //!!! Телеграм ругается если прихояд дубликат текста
                        yield this.bot.editMessageText(text, Object.assign({ chat_id: chatId, message_id: msgId }, nopt));
                    }
                    catch (err) {
                        // %%% DEBUG MODE
                        // console.log("ERROR. editMessageText (possible duplicate)") //only for debug 
                    }
                try { //!!! Телеграм ругается если прихояд дубликаты кнопок
                    if (opt !== undefined && opt !== null && nopt.reply_markup !== null)
                        yield this.bot.editMessageReplyMarkup(nopt.reply_markup, {
                            chat_id: chatId,
                            message_id: msgId
                        });
                }
                catch (err) {
                    // %%% DEBUG MODE
                    // console.log("ERROR. editMessageReplyMarkup (possible duplicate)") //only for debug 
                }
            }
            else
                console.log('Chat ID was not defined before');
        });
    }
    markToDelete(msg, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messagesToRemove[msg.chat.id].push(messageId);
        });
    }
    delete(msg, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.messagesToRemove[msg.chat.id]) {
                console.log('messagesToRemove для ' + msg.chat.id + ' не был создан');
                return;
            }
            const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId);
            // console.log(messageId)
            // console.log(this.messagesToRemove[msg.chat.id])
            // console.log('INDEX: ' + ind)
            if (ind !== -1) {
                // console.log(messageId)
                // console.log(msg.chat.id)
                this.messagesToRemove[msg.chat.id].splice(ind, 1);
            }
            yield this.bot.deleteMessage(msg.chat.id, messageId);
        });
    }
    deleteFromMarked(msg, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId);
            if (ind !== -1) {
                this.messagesToRemove[msg.chat.id].splice(ind, 1);
            }
        });
    }
    deleteAllMarked(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(this.messagesToRemove)
            if (this.messagesToRemove[msg.chat.id] === undefined)
                return;
            const copyMessagesToRemove = this.messagesToRemove[msg.chat.id].slice(); //clone because of issue
            for (const mid of copyMessagesToRemove)
                this.delete(msg, mid);
        });
    }
}
exports.default = BotUI;
/*
// используется для сброса конттекста в самом конце
async resetContext() {
    // сбрасываем все типы callback events context to zero
    let emptyCallBack = {}
    Object.keys(this.events).forEach(key => {
        emptyCallBack[key] = ()=>{}
    })
    this.context(msg, ()=>{}, emptyCallBack)
}
*/
