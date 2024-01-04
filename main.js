"use strict";
// %%% Invalid Grand Acess постоянно ломает бот через время!
// import {updateToolsByStatus, updateRashodnikiByType} from './src/common/ABrequest' //test only
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
const bot_ui_1 = __importDefault(require("./lib/bot-ui"));
const TableUI = require('./lib/table-ui');
// const process = require('node:process');
// const fs = require('fs')
// import Zayavka from './src/zayavkaView'
// Сценарии 
const authorize_1 = __importDefault(require("./src/authorize"));
const zayavka_1 = __importDefault(require("./src/main/zayavka"));
const vozvrat_1 = __importDefault(require("./src/main/vozvrat"));
const megduobj_1 = __importDefault(require("./src/main/megduobj"));
const svobodnaya_1 = __importDefault(require("./src/main/svobodnaya"));
const moizayavki_1 = __importDefault(require("./src/main/moizayavki"));
const namne_1 = __importDefault(require("./src/main/namne"));
const manager_1 = __importDefault(require("./src/main/manager"));
const TX_WELLCOME_MESSAGE = "Привет! Я бот компании Naptech. *Используй меню /* для работы со мной.";
const SHEET_ID = '16Z6opmCk2VnXFHraYIqdGhOTT_MJtQwIRHe3KPhNys0';
const BOTTOKEN = "6287688949:AAFalubhPUjnzkiSBb3ESxnogmlOpqpQXgc";
const OPT = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
};
const EVENTS = ['message', 'callback_query', 'contact'];
const TABLE_MODEL = {
    'Обьекты': ['Auto #', 'Название', 'Статус', 'Cотрудник'],
    'Сотрудники': ['#', 'ФИО', 'Роль', 'Должность', 'Username', 'ChatId'],
    'Инструмент': ['Auto #', 'Статус', 'Доступность', 'Наименование', 'Описание', 'Фото', 'Местонахождение', 'Ответсвенный', 'Сотрудник', 'Объект', 'Заявка', 'Место'],
    'Расходники': ['Auto #', 'Количество', 'Измерение', 'Категория', 'Название', 'Вариант', 'Фото', 'Место'],
    'Заявки': ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'],
    'Журнал Инструмент': ['Заявка', 'Инструмент', 'Статус', 'Дата изм.', 'Объект', 'Cотрудник']
};
let botUI = new bot_ui_1.default(BOTTOKEN, OPT, EVENTS);
let tableUI = new TableUI(SHEET_ID, TABLE_MODEL);
const data = {};
const c = { botUI, tableUI, data };
botUI.commands({
    // test: async (msg: any) => {
    //     // Создание заявки 'Со склада'
    //     c.data[msg.chat.id] = {
    //         id: 'Null',
    //         type: 'Со склада',
    //         status: 'Обработка',
    //         from: '0',
    //         to: '1',
    //         delivery: 'Да',
    //         dateTime: 'По готовности',
    //         tools: {"2":"СПЕЦ-3447","3":"BORT BNG-2000X"},
    //         rashodniki: {"1":{"name":"Лезвия | Прямые","count":10}, "2":{"name":"Лезвия | Лезвия Крючок","count":10}},
    //         comment: 'Null',
    //         user: '79215987335',
    //         dateCreated: 'Null'
    //     }
    //     saveRequest(msg, c)        
    // },
    start: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        yield botUI.message(msg, TX_WELLCOME_MESSAGE);
        yield (0, authorize_1.default)(msg, c);
    }),
    zayavka: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, zayavka_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                // console.log(data)
            }));
        }
    }),
    moizayavki: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, moizayavki_1.default)(msg, c, 1, () => {
                // console.log('ended')
            });
        }
    }),
    namne: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, namne_1.default)(msg, c, () => {
                // console.log('ended NaMne')
            });
        }
    }),
    vozvrat: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, vozvrat_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                // console.log(data)
            }));
        }
    }),
    megduobj: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, megduobj_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                // console.log(data)
            }));
        }
    }),
    freezayavka: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c)) {
            yield (0, svobodnaya_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                // console.log(data)
            }));
        }
    }),
    mng: (msg) => __awaiter(void 0, void 0, void 0, function* () {
        yield c.botUI.deleteAllMarked(msg);
        if (yield (0, authorize_1.default)(msg, c, true)) {
            yield (0, manager_1.default)(msg, c, () => {
                // console.log('ended')
            });
        }
    }),
});
// - - -
// moizayavki - Мои заявки
// zayavka - Заказать со склада
// vozvrat - Вернуть на склад
// megduobj - Переместить между объектами
// freezayavka - Заявка в свободной форме
// namne - Инструмент на мне
// mng - Заявки в работе для менеджера
