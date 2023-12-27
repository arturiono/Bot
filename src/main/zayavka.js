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
const authorize_1 = require("../authorize");
const requestConverter_1 = require("../common/requestConverter");
const confirm_1 = __importDefault(require("../confirm"));
const notify_1 = __importDefault(require("../common/notify"));
const saveRequest_1 = require("../common/saveRequest");
const TX_NEW_ZAYAVKA_MNG = "✅ 🔜🏢 Поступила заявка получения со склада:\n";
const TX_REQEST_CONFIRMED = "✅ *Заявка получения со склада принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка получения со склада*";
const TX_CONFLICT = "*❗️Произошел конфликт заказа*. Другой сотрудник уже заказал выбранный вами инструемент. \n" +
    "*Инструмент и/или расходники были изменены*. Внимательно посмотртите на изменения в заказе.";
exports.default = (msg, c, end) => __awaiter(void 0, void 0, void 0, function* () {
    yield c.botUI.message(msg, TX_INITIAL_MESSAGE);
    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Со склада',
        from: '0',
        to: '1',
        status: 'Обработка',
        delivery: 'Нет',
        dateTime: 'По готовности',
        tools: { "2": "СПЕЦ-3447", "3": "BORT BNG-2000X" },
        rashodniki: { "1": { "name": "Лезвия | Прямы е", "count": 100 }, "2": { "name": "Лезвия | Лезвия Крючок", "count": 100 } },
        comment: 'Null',
        user: (0, authorize_1.getLocalPhone)((0, authorize_1.getUserName)(msg)),
        dateCreated: 'Null'
    };
    // Конечная функция с рекурсией выделена в компонент
    let ConfirmedByUser = () => __awaiter(void 0, void 0, void 0, function* () {
        // 1. проверяем tools, чтобы их не забронировал кто-то другой
        const toolsData = yield c.tableUI.getList('Инструмент', ['Auto #', 'Статус', 'Наименование', 'Описание', 'Объект', 'Местонахождение', 'Ответсвенный', 'Сотрудник', 'Заявка']);
        let conflicted = false;
        for (const toolId in c.data[msg.chat.id].tools) {
            const ind = toolsData['Auto #'].indexOf(toolId);
            if (toolsData['Статус'][ind] !== 'Склад') {
                let tx = '⛔️' + toolsData['Наименование'][ind] + ' | ' + toolsData['Описание'][ind] + '\n' +
                    'Уже заброниравал: ' + toolsData['Ответсвенный'][ind];
                yield c.botUI.message(msg, tx);
                conflicted = true;
                // удаляем из списка
                delete c.data[msg.chat.id].tools[toolId];
            }
        }
        // 2. проверяем rashodniki, чтобы их не забронировал кто-то другой
        const rashodniki = yield c.tableUI.getList('Расходники', ['Auto #', 'Количество', 'Измерение', 'Категория', 'Название', 'Вариант', 'Фото', 'Место']);
        for (const toolId in c.data[msg.chat.id].rashodniki) {
            const ind = rashodniki['Auto #'].indexOf(toolId);
            if (ind !== -1 && rashodniki['Количество'][ind]) {
                const a = Number(rashodniki['Количество'][ind]);
                const b = c.data[msg.chat.id].rashodniki[toolId].count;
                const dif = a - b;
                if (dif < 0) {
                    let tx = '⛔️' + rashodniki['Название'][ind] + ' | ' + rashodniki['Вариант'][ind] + '\n' +
                        'Максимаольно доступно: ' + a + rashodniki['Измерение'][ind];
                    yield c.botUI.message(msg, tx);
                    const newCount = c.data[msg.chat.id].rashodniki[toolId].count + dif;
                    c.data[msg.chat.id].rashodniki[toolId].count = newCount; //минимальное значение - 0
                    if (newCount === 0) {
                        delete c.data[msg.chat.id].rashodniki[toolId];
                    }
                    conflicted = true;
                }
            }
        }
        if (conflicted) {
            yield c.botUI.message(msg, TX_CONFLICT);
            // снова показываем confirmed и рекурсивно вызывает эту функцию
            yield (0, confirm_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                ConfirmedByUser();
            }));
            return;
        }
        // - - - - - - - - - - - - - - -
        // Есоли все отлично
        yield (0, saveRequest_1.saveRequest)(msg, c);
        yield c.botUI.message(msg, TX_REQEST_CONFIRMED);
        // пишем менеджеру
        const usersTable = yield c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId']);
        yield (0, notify_1.default)(msg, c, TX_NEW_ZAYAVKA_MNG + (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], true, usersTable), usersTable, null); //пишем менджеру
        end();
    });
    // await Object(msg, c, false, async ()=>{
    //     await Dostavka(msg, c, false, async ()=>{
    //         await Time(msg, c, false, async ()=>{ 
    //             await Tools(msg, c, false, async ()=>{  // расходники за инструментом
    //                 await Rashodniki(msg, c, false, true, async ()=>{
    //                     await Comment(msg, c, false, async ()=>{  
    yield (0, confirm_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
        ConfirmedByUser();
    }));
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // })
});
