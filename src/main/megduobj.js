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
const toObject_1 = __importDefault(require("../toObject"));
const fromObjectTools_1 = __importDefault(require("../fromObjectTools"));
const dostavka_1 = __importDefault(require("../dostavka"));
const dateTime_1 = __importDefault(require("../dateTime"));
const comment_1 = __importDefault(require("../comment"));
const confirm_1 = __importDefault(require("../confirm"));
const notify_1 = __importDefault(require("../common/notify"));
const saveRequest_1 = require("../common/saveRequest");
const TX_NEW_ZAYAVKA_MNG = "✅ 🏢🔜🏢 Поступила заявка переноса между объектами:\n";
const TX_REQEST_CONFIRMED = "✅ *Заявка переноса между объектами принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка переноса между объектами*";
exports.default = (msg, c, end) => __awaiter(void 0, void 0, void 0, function* () {
    const objectsTable = yield c.tableUI.getList('Объекты', ['Auto #', 'Название']);
    yield c.botUI.message(msg, TX_INITIAL_MESSAGE);
    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Между объектами',
        from: '1',
        to: '1',
        status: 'Обработка',
        delivery: 'Нет',
        dateTime: 'По готовности',
        tools: {},
        rashodniki: {},
        comment: 'Null',
        user: (0, authorize_1.getLocalPhone)((0, authorize_1.getUserName)(msg)),
        dateCreated: 'Null'
    };
    let otherCall = () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, comment_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, confirm_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, saveRequest_1.saveRequest)(msg, c);
                yield c.botUI.message(msg, TX_REQEST_CONFIRMED);
                // пишем менеджеру
                const usersTable = yield c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId']);
                yield (0, notify_1.default)(msg, c, TX_NEW_ZAYAVKA_MNG +
                    (0, requestConverter_1.dataToMessage)(c.data[msg.chat.id], objectsTable, true, usersTable), usersTable, null); //пишем менджеру
                yield end();
            }));
        }));
    });
    yield (0, fromObjectTools_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, toObject_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, dostavka_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
                if (c.data[msg.chat.id].delivery === 'Да')
                    yield (0, dateTime_1.default)(msg, c, false, () => __awaiter(void 0, void 0, void 0, function* () {
                        yield otherCall();
                    }));
                else
                    yield otherCall();
            }));
        }));
    }));
});
