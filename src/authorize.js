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
exports.getLocalPhone = exports.getUserName = void 0;
const fs = require('fs');
const TX_CONT_REQUEST = 'Для продолжения работы нажмите "отправить телефон"';
const TX_CONT_SUCCES = "Все отлично! Можно продолжать работу";
const TX_CONT_ERROR = "Похоже вас забыли добавить в базу. Свяжитесь с менеджером";
const TX_CONT_FILE_ERROR = "Что-то пошло не так";
const TX_NO_ADMIN_ACCES = "У вас нед доступа к функциям менджера";
const TOKENS_FOLDER = 'auth-users';
//1000 * 60 * 60 * 24 * 1 //1 день
const CASHED_AUTH_TIMOUT = 1000 * 60 * 5; // Кэш 5 минут     
// const CASHED_AUTH_TIMOUT = 0 // Кэша нет
// username can be empty!
function getUserName(msg) {
    let name;
    // console.log(msg.chat.username)
    if (msg.chat.username !== undefined)
        name = msg.chat.username;
    else {
        const last = msg.chat.last_name !== undefined ? msg.chat.last_name : '';
        name = msg.chat.first_name + last;
    }
    return name;
}
exports.getUserName = getUserName;
function getLocalPhone(username) {
    try {
        let data = fs.readFileSync(TOKENS_FOLDER + '/' + username, 'utf8');
        const o = JSON.parse(data);
        return o.number;
    }
    catch (error) {
        return null;
    }
}
exports.getLocalPhone = getLocalPhone;
exports.default = (msg, c, checkManager) => __awaiter(void 0, void 0, void 0, function* () {
    let username = getUserName(msg);
    let auth = false;
    try {
        let data = fs.readFileSync(TOKENS_FOLDER + '/' + username, 'utf8');
        const o = JSON.parse(data);
        let number = o.number;
        let manager = o.manager;
        let lastUse = o.lastTime;
        if (lastUse === undefined)
            lastUse = 0; // обратная совместимость
        //Если истек срок действия кэширования, то проверяем по таблице пользователя
        if (Date.now() - lastUse > CASHED_AUTH_TIMOUT) {
            // проверяем пользователя по таблице 
            // console.log('CASHED TIMEOUT')
            const userData = yield c.tableUI.getList('Сотрудники', ['#', 'Роль']);
            // заполняем number и manager на основе данных из таблицы
            const numInd = userData['#'].indexOf(number);
            // console.log("numInd: " + numInd) 
            if (numInd === -1) {
                // Пользователь не найден, будет запрос
                // console.log("Пользователь не найден")
                number = undefined;
            }
            else {
                // обновляем timestamp
                // console.log("Пользователь найден")
                // Уволен
                if (userData['Роль'][numInd] === 'Уволен') {
                    // console.log('УВОЛЕН')
                    number = undefined;
                    o.number = undefined;
                }
                if (checkManager) {
                    if (userData['Роль'][numInd] === 'Менеджер') {
                        // console.log('ПОЛЬЗОВАТЕЛЬ = МЕНЕДЖЕР')
                        manager = true;
                        o.manager = true;
                    }
                    else {
                        manager = undefined;
                        o.manager = undefined;
                    }
                }
                o.lastTime = Date.now();
                fs.writeFile(TOKENS_FOLDER + '/' + username, JSON.stringify(o), (err) => {
                    if (err)
                        c.botUI.message(msg, TX_CONT_FILE_ERROR);
                });
            }
        }
        if (!number) {
            // catch error. просим авторизоваться
            let err;
            err.catchError;
        }
        else {
            if (checkManager) {
                if (manager === undefined) {
                    // console.log('NOT MANAGER')
                    c.botUI.message(msg, TX_NO_ADMIN_ACCES);
                    auth = false;
                }
                else {
                    // console.log('IS MANAGER')
                    auth = true;
                }
            }
            else {
                auth = true;
            }
        }
    }
    catch (error) {
        c.botUI.context(msg, () => {
            const opts = {
                reply_markup: {
                    keyboard: [
                        [{
                                text: 'Отправить телефон',
                                request_contact: true
                            }],
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            };
            c.botUI.message(msg, TX_CONT_REQUEST, opts);
        }, {
            contact: (msg) => __awaiter(void 0, void 0, void 0, function* () {
                const PHN = msg.contact.phone_number;
                const tableSotrudniki = yield c.tableUI.getList('Сотрудники', ['#', 'Роль']);
                const ind = tableSotrudniki['#'].indexOf(String(PHN));
                if (ind !== -1 && tableSotrudniki['Роль'][ind] !== 'Уволен') {
                    // Сохранить chat.username & chat.id в базу
                    yield c.tableUI.updateRow('Сотрудники', ind + 2, { 'Username': username, 'ChatId': msg.chat.id }); // %%% проверять ошибки!
                    const isManager = tableSotrudniki['Роль'][ind] === 'Менеджер' ? true : false;
                    c.botUI.message(msg, TX_CONT_SUCCES);
                    let data = { number: PHN, lastTime: Date.now() };
                    if (isManager)
                        data.manager = true;
                    fs.writeFile(TOKENS_FOLDER + '/' + username, JSON.stringify(data), (err) => {
                        if (err)
                            c.botUI.message(msg, TX_CONT_FILE_ERROR);
                    });
                }
                else {
                    c.botUI.message(msg, TX_CONT_ERROR);
                }
            })
        });
        return false;
    }
    return auth;
});
