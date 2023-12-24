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
const authorize_1 = require("../authorize");
const TX_INITIAL_MESSAGE_NO_TOOLS = 'У вас нет инструмента на объектах.';
exports.default = (msg, c, end) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, authorize_1.getLocalPhone)((0, authorize_1.getUserName)(msg));
    const toolsOrderedByRequests = {};
    const objectsById = {};
    const toolsData = yield c.tableUI.getList('Инструмент', ['Auto #', 'Статус', 'Наименование', 'Описание', 'Объект', 'Местонахождение', 'Сотрудник', 'Заявка']);
    let found = false;
    for (const [i, dataUser] of toolsData['Сотрудник'].entries()) {
        if (dataUser === user && toolsData['Статус'][i] !== 'Заявка') {
            const objectID = toolsData['Объект'][i];
            if (toolsOrderedByRequests[objectID] === undefined) {
                toolsOrderedByRequests[objectID] = [];
                objectsById[objectID] = toolsData['Местонахождение'][i];
            }
            toolsOrderedByRequests[objectID].push(i);
            found = true;
        }
    }
    if (found === false) {
        yield c.botUI.message(msg, TX_INITIAL_MESSAGE_NO_TOOLS, { mark_to_remove: true });
        return;
    }
    // console.log(toolsOrderedByRequests)
    for (const objectID in toolsOrderedByRequests) {
        yield c.botUI.message(msg, "- - - *" + objectsById[objectID] + "* - - -", { mark_to_remove: true });
        let msgStr = "";
        for (const ind of toolsOrderedByRequests[objectID]) {
            msgStr += "*" + toolsData['Наименование'][ind] + "* | ";
            msgStr += toolsData['Описание'][ind] + "\n";
            msgStr += "Статус: *" + toolsData['Статус'][ind] + "*\n";
            msgStr += "\n";
        }
        yield c.botUI.message(msg, msgStr, { mark_to_remove: true });
    }
    // console.log(toolsOrderedByRequests)
});
