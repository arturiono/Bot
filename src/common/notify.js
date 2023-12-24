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
// 1) Уведомить админимстратора (из боты мастера)
// 2) Уведомить пользователя, зная его телефон (из бота менджера)
// if phone not defined Notify Manager
const Notify = (msg, c, text, usersTable, phone) => __awaiter(void 0, void 0, void 0, function* () {
    // let usersTable = await c.tableUI.getList('Сотрудники', ['#', 'Роль', 'ChatId'])
    // console.log(usersTable)
    // console.log('- - -')
    if (phone === null) { //уведмление менджера
        const ind = usersTable['Роль'].indexOf('Менеджер');
        if (ind !== -1) {
            const chatId = usersTable['ChatId'][ind];
            if (chatId !== '') { // все хорошо!
                yield c.botUI.message(msg, text, undefined, chatId);
            }
            else {
                yield c.botUI.message(msg, 'Ошибка. Менеджер не зарегистрирован в системе. Свяжитесь пожалуйста с руководителем.');
            }
        }
        else {
            // %%% уведомлять разработчика/владельца бизнеса, что не добавлен менеджер
            yield c.botUI.message(msg, 'Ошибка. Роль менджера не указана в списке сотрудников. Свяжитесь пожалуйста с руководителем.');
        }
    }
    else { //уведомление мастера
        const ind = usersTable['#'].indexOf(phone);
        if (ind !== -1) {
            const chatId = usersTable['ChatId'][ind];
            if (chatId !== '') { // все хорошо!
                yield c.botUI.message(msg, text, undefined, chatId);
            }
            else {
                yield c.botUI.message(msg, 'Ошибка. Мастер не зарегистрирован в системе. Свяжитесь пожалуйста с руководителем.');
            }
        }
        else {
            console.log('ошибка, пользователь для Notify не найден');
        }
    }
});
exports.default = Notify;
