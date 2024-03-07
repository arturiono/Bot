"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/bot-ui.ts
var bot_ui_exports = {};
__export(bot_ui_exports, {
  default: () => BotUI
});
var import_node_telegram_bot_api, fs, BotUI;
var init_bot_ui = __esm({
  "lib/bot-ui.ts"() {
    import_node_telegram_bot_api = __toESM(require("node-telegram-bot-api"));
    fs = require("fs");
    BotUI = class {
      // сообщения которые накапливаем через opt.mark_to_remove = true
      constructor(token, opt, events) {
        // типы поддерживаемых callbacks
        // chatId specific arrays
        this.replyContext = {};
        this.replyContextMsg = {};
        this.messagesToRemove = {};
        this.events = events;
        this.bot = new import_node_telegram_bot_api.default(token, opt);
        events.forEach((event) => {
          this.bot.on(event, async (obj) => {
            let callbackChatId = "";
            if (event === "message")
              callbackChatId = String(obj.chat.id);
            if (event === "callback_query")
              callbackChatId = String(obj.message.chat.id);
            if (event === "contact")
              callbackChatId = String(obj.chat.id);
            if (this.replyContext[callbackChatId] && this.replyContext[callbackChatId][event] && typeof this.replyContext[callbackChatId][event] == "function") {
              await this.replyContext[callbackChatId][event](obj);
            }
            return;
          });
        });
      }
      // ловит все ошибки, чтобы скрипт продолжал работать
      // сохраняет все оишбки в trycatch.log'
      async catch(msg, e) {
        fs.writeSync(
          process.stderr.fd,
          `Caught exception: ${e}
`,
          (err) => {
          }
        );
        fs.writeFile(
          "trycatch.log",
          `Time: ${(/* @__PURE__ */ new Date()).toString()}
Caught exception: ${e}
`,
          { flag: "a+" },
          (err) => {
          }
        );
        await this.message(msg, "*\u2757\uFE0F \u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430!* \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0437\u0430\u043D\u043E\u0432\u043E \u0432\u043E\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0441\u044F \u043C\u0435\u043D\u044E");
      }
      commands(obj) {
        Object.keys(obj).forEach(async (key) => {
          this.bot.onText(new RegExp(`/${key}`), async (msg) => {
            await obj[key](msg);
          });
        });
      }
      // создаёт новый контекст для перехвата ответов
      async context(msg, question, replyObj) {
        await question.call();
        this.replyContext[msg.chat.id] = replyObj;
        this.replyContextMsg[msg.chat.id] = msg;
      }
      // обертка для telegram sendMessage
      async message(msg, text, opt = void 0, customChatId = void 0) {
        const nopt = opt !== null && opt !== void 0 ? opt : {};
        nopt.parse_mode = "Markdown";
        const chatId = customChatId ? customChatId : msg.chat.id;
        const nmsg = await this.bot.sendMessage(chatId, text, nopt);
        if (!this.messagesToRemove[msg.chat.id])
          this.messagesToRemove[msg.chat.id] = [];
        if (opt && opt.mark_to_remove) {
          this.messagesToRemove[msg.chat.id].push(nmsg.message_id);
        }
        return nmsg;
      }
      // text possible null
      // customChatId? - optional
      // spport reply_markup in opt
      async editMessage(msg, msgId, text, opt, customChatId = void 0) {
        const nopt = opt !== void 0 && opt !== null ? opt : {};
        nopt.parse_mode = "Markdown";
        const chatId = customChatId ? customChatId : msg.chat.id;
        if (chatId) {
          if (text !== null)
            await this.bot.editMessageText(text, {
              chat_id: chatId,
              message_id: msgId,
              ...nopt
            });
          try {
            if (opt !== void 0 && opt !== null && nopt.reply_markup !== null)
              await this.bot.editMessageReplyMarkup(nopt.reply_markup, {
                chat_id: chatId,
                message_id: msgId
              });
          } catch (err) {
          }
        } else
          console.log("Chat ID was not defined before");
      }
      async markToDelete(msg, messageId) {
        this.messagesToRemove[msg.chat.id].push(messageId);
      }
      async delete(msg, messageId) {
        if (!this.messagesToRemove[msg.chat.id]) {
          console.log("messagesToRemove \u0434\u043B\u044F " + msg.chat.id + " \u043D\u0435 \u0431\u044B\u043B \u0441\u043E\u0437\u0434\u0430\u043D");
          return;
        }
        const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId);
        if (ind !== -1) {
          this.messagesToRemove[msg.chat.id].splice(ind, 1);
        }
        await this.bot.deleteMessage(msg.chat.id, messageId);
      }
      async deleteFromMarked(msg, messageId) {
        const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId);
        if (ind !== -1) {
          this.messagesToRemove[msg.chat.id].splice(ind, 1);
        }
      }
      async deleteAllMarked(msg) {
        if (this.messagesToRemove[msg.chat.id] === void 0)
          return;
        const copyMessagesToRemove = this.messagesToRemove[msg.chat.id].slice();
        for (const mid of copyMessagesToRemove)
          this.delete(msg, mid);
      }
    };
  }
});

// lib/gauth.js
var require_gauth = __commonJS({
  "lib/gauth.js"(exports2, module2) {
    var fs3 = require("fs").promises;
    var path = require("path");
    var process2 = require("process");
    var { authenticate } = require("@google-cloud/local-auth");
    var { google } = require("googleapis");
    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
    var TOKEN_PATH = path.join(process2.cwd(), "auth-google/token.json");
    var CREDENTIALS_PATH = path.join(process2.cwd(), "auth-google/credentials.json");
    async function loadSavedCredentialsIfExist() {
      try {
        const content = await fs3.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
      } catch (err) {
        return null;
      }
    }
    async function saveCredentials(client) {
      const content = await fs3.readFile(CREDENTIALS_PATH);
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;
      const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token
      });
      await fs3.writeFile(TOKEN_PATH, payload);
    }
    async function authorize() {
      let client = await loadSavedCredentialsIfExist();
      if (client) {
        return client;
      }
      client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH
      });
      if (client.credentials) {
        await saveCredentials(client);
      }
      return client;
    }
    module2.exports = authorize;
  }
});

// lib/table-ui.js
var require_table_ui = __commonJS({
  "lib/table-ui.js"(exports2, module2) {
    var GAuthorize = require_gauth();
    var { google } = require("googleapis");
    var LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];
    module2.exports = class Table {
      sheetId;
      // id Google таблицы
      model;
      // названия вкладок и колонок в таблице (1-ая строк)
      // {
      //     'Объекты': ['#', 'Название', 'Статус']
      // }
      constructor(sheetId, model) {
        this.sheetId = sheetId;
        this.model = model;
      }
      // getList вернет
      // props - список колонок, который нужен
      // {prop1: [values ..], 
      //  prop2: [values ..]},
      // sheet - String
      // props - [String...]
      _getCombinedRaneges(sheet, props) {
        let ranges = [];
        props.forEach(async (prop) => {
          this.model[sheet].forEach(async (row, i) => {
            if (row === prop) {
              ranges.push(sheet + "!" + LETTERS[i] + "2:" + LETTERS[i]);
            }
          });
        });
        return ranges;
      }
      async getList(sheet, props) {
        let result = null;
        const auth = await GAuthorize();
        if (auth) {
          const sheets = google.sheets({ version: "v4", auth });
          let ranges = this._getCombinedRaneges(sheet, props);
          let obj = {};
          const res = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: this.sheetId,
            ranges,
            majorDimension: "COLUMNS"
            //+ randomError
          });
          res.data.valueRanges.forEach((column, i) => {
            obj[props[i]] = column.values ? column.values[0] : [];
          });
          result = obj;
        }
        return result;
      }
      // sheet - String
      // rows - [{prop:value...}, ...] //array
      // inserting data at the bottom of last data
      async insertRows(sheet, rows) {
        let result = null;
        const auth = await GAuthorize();
        if (auth) {
          const sheets = google.sheets({ version: "v4", auth });
          let modelRows = [];
          for (const row of rows) {
            let orderedValues = [];
            for (const colName of this.model[sheet]) {
              if (row[colName] !== void 0)
                orderedValues.push(row[colName]);
              else
                orderedValues.push(null);
            }
            modelRows.push(orderedValues);
          }
          const res = await sheets.spreadsheets.values.append({
            spreadsheetId: this.sheetId,
            range: sheet + "!A2:" + LETTERS[this.model[sheet].length],
            //по длине с table model
            resource: {
              values: modelRows
            },
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS"
          });
          result = res;
        }
        return result;
      }
      // sheet - String
      // values - {prop:value...} //object
      // update data at the {rowNumber}
      async updateRow(sheet, rowNumber, values) {
        let result = null;
        const auth = await GAuthorize();
        if (auth) {
          const sheets = google.sheets({ version: "v4", auth });
          let modelRows = [];
          let orderedValues = [];
          for (const colName of this.model[sheet]) {
            if (values[colName] !== void 0)
              orderedValues.push(values[colName]);
            else
              orderedValues.push(null);
          }
          modelRows.push(orderedValues);
          const res = await sheets.spreadsheets.values.update({
            spreadsheetId: this.sheetId,
            // Sheet1!1:2 refers to all the cells in the first two rows of Sheet1
            range: sheet + "!" + rowNumber + ":" + (rowNumber + 1),
            resource: {
              values: modelRows
            },
            valueInputOption: "USER_ENTERED"
            // insertDataOption: "INSERT_ROWS"
          });
          result = res;
        }
        return result;
      }
      // находит строку в столбце propName, где выполняется условие = propValue и возвращает props столбцы
      // async getItem (sheet, propName, propValue, props) {
      //     let result = null
      //     let auth = await GAuthorize()
      //     if(auth) {
      //         const sheets = google.sheets({version: 'v4', auth})
      //         let ranges = []
      //         props.forEach(async (prop) => {
      //             this.model[sheet].forEach(async (row,i)=>{
      //                 if(row === prop) { 
      //                     // находим свойство по имени, узнаем его номер и узнаем букву
      //                     ranges.push(sheet + '!' + LETTERS[i] + '2:' + LETTERS[i])
      //                 }   
      //             })
      //         })
      //         // ... %%%% WORK MORE HERE!!!
      //     }
      //     return result  
      // }
      // props - список колонок, который нужен
      // async getElement (sheet, idKey, id, props = null) {
      // }
    };
  }
});

// src/authorize.ts
var authorize_exports = {};
__export(authorize_exports, {
  default: () => authorize_default,
  getLocalPhone: () => getLocalPhone,
  getUserName: () => getUserName
});
function getUserName(msg) {
  let name;
  if (msg.chat.username !== void 0)
    name = msg.chat.username;
  else {
    const last = msg.chat.last_name !== void 0 ? msg.chat.last_name : "";
    name = msg.chat.first_name + last;
  }
  return name;
}
function getLocalPhone(username) {
  try {
    let data2 = fs2.readFileSync(TOKENS_FOLDER + "/" + username, "utf8");
    const o = JSON.parse(data2);
    return o.number;
  } catch (error) {
    return null;
  }
}
var fs2, TX_CONT_REQUEST, TX_CONT_SUCCES, TX_CONT_ERROR, TX_CONT_FILE_ERROR, TX_NO_ADMIN_ACCES, TOKENS_FOLDER, CASHED_AUTH_TIMOUT, authorize_default;
var init_authorize = __esm({
  "src/authorize.ts"() {
    fs2 = require("fs");
    TX_CONT_REQUEST = '\u0414\u043B\u044F \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "\u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u043B\u0435\u0444\u043E\u043D"';
    TX_CONT_SUCCES = "\u0412\u0441\u0435 \u043E\u0442\u043B\u0438\u0447\u043D\u043E! \u041C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u0443";
    TX_CONT_ERROR = "\u041F\u043E\u0445\u043E\u0436\u0435 \u0432\u0430\u0441 \u0437\u0430\u0431\u044B\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u0431\u0430\u0437\u0443. \u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C";
    TX_CONT_FILE_ERROR = "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A";
    TX_NO_ADMIN_ACCES = "\u0423 \u0432\u0430\u0441 \u043D\u0435\u0434 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u0444\u0443\u043D\u043A\u0446\u0438\u044F\u043C \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u0430";
    TOKENS_FOLDER = "auth-users";
    CASHED_AUTH_TIMOUT = 1e3 * 60 * 5;
    authorize_default = async (msg, c2, checkManager) => {
      let username = getUserName(msg);
      let auth = false;
      try {
        let data2 = fs2.readFileSync(TOKENS_FOLDER + "/" + username, "utf8");
        const o = JSON.parse(data2);
        let number = o.number;
        let manager = o.manager;
        let lastUse = o.lastTime;
        if (lastUse === void 0)
          lastUse = 0;
        if (Date.now() - lastUse > CASHED_AUTH_TIMOUT) {
          const userData = await c2.tableUI.getList(
            "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438",
            ["#", "\u0420\u043E\u043B\u044C"]
          );
          const numInd = userData["#"].indexOf(number);
          if (numInd === -1) {
            number = void 0;
          } else {
            if (userData["\u0420\u043E\u043B\u044C"][numInd] === "\u0423\u0432\u043E\u043B\u0435\u043D") {
              number = void 0;
              o.number = void 0;
            }
            if (checkManager) {
              if (userData["\u0420\u043E\u043B\u044C"][numInd] === "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440") {
                manager = true;
                o.manager = true;
              } else {
                manager = void 0;
                o.manager = void 0;
              }
            }
            o.lastTime = Date.now();
            fs2.writeFile(TOKENS_FOLDER + "/" + username, JSON.stringify(o), (err) => {
              if (err)
                c2.botUI.message(msg, TX_CONT_FILE_ERROR);
            });
          }
        }
        if (!number) {
          let err;
          err.catchError;
        } else {
          if (checkManager) {
            if (manager === void 0) {
              c2.botUI.message(msg, TX_NO_ADMIN_ACCES);
              auth = false;
            } else {
              auth = true;
            }
          } else {
            auth = true;
          }
        }
      } catch (error) {
        c2.botUI.context(msg, () => {
          const opts = {
            reply_markup: {
              keyboard: [
                //inline_keyboard not works!
                [{
                  text: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u043B\u0435\u0444\u043E\u043D",
                  request_contact: true
                }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          };
          c2.botUI.message(msg, TX_CONT_REQUEST, opts);
        }, {
          contact: async (msg2) => {
            const PHN = msg2.contact.phone_number;
            const tableSotrudniki = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0420\u043E\u043B\u044C"]);
            const ind = tableSotrudniki["#"].indexOf(String(PHN));
            if (ind !== -1 && tableSotrudniki["\u0420\u043E\u043B\u044C"][ind] !== "\u0423\u0432\u043E\u043B\u0435\u043D") {
              await c2.tableUI.updateRow("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ind + 2, { "Username": username, "ChatId": msg2.chat.id });
              const isManager = tableSotrudniki["\u0420\u043E\u043B\u044C"][ind] === "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440" ? true : false;
              c2.botUI.message(msg2, TX_CONT_SUCCES);
              let data2 = { number: PHN, lastTime: Date.now() };
              if (isManager)
                data2.manager = true;
              fs2.writeFile(TOKENS_FOLDER + "/" + username, JSON.stringify(data2), (err) => {
                if (err)
                  c2.botUI.message(msg2, TX_CONT_FILE_ERROR);
              });
            } else {
              c2.botUI.message(msg2, TX_CONT_ERROR);
            }
          }
        });
        return false;
      }
      return auth;
    };
  }
});

// src/common/requestConverter.ts
function dataToMessage(data2, objectTable, showName, usersTable) {
  let str = "";
  if (showName && usersTable) {
    const ind = usersTable["#"].indexOf(data2.user);
    let name = "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0431\u044B\u043B \u0443\u0434\u0430\u043B\u0435\u043D";
    if (ind !== -1) {
      name = usersTable["\u0424\u0418\u041E"][ind];
    }
    str += name + " (" + data2.user + ")\n";
    str += " - - - \n";
  }
  const sticon = data2.status === "\u041E\u0442\u043C\u0435\u043D\u0430" ? "\u26D4\uFE0F" : data2.status === "\u0421\u043A\u043B\u0430\u0434" ? "\u2705" : data2.status === "\u041E\u0431\u044A\u0435\u043A\u0442" ? "\u2705" : data2.status === "\u0421\u043E\u0431\u0440\u0430\u043D" ? "\u2705" : data2.status === "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430" ? "\u{1F699}" : "\u23F1\uFE0F";
  if (data2.id !== "Null")
    str += "# " + data2.id + "\n";
  str += "\u0421\u0442\u0430\u0442\u0443\u0441: " + sticon + " *" + data2.status + "*\n";
  str += "\u0422\u0438\u043F: *" + data2.type + "*\n";
  str += "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430: *" + data2.delivery + "*\n";
  str += "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F: *" + data2.dateTime + "*\n";
  if (data2.type !== "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F") {
    const fromId = objectTable["Auto #"].indexOf(data2.from);
    const from = objectTable["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][fromId];
    const toId = objectTable["Auto #"].indexOf(data2.to);
    const to = objectTable["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][toId];
    str += "\u0422\u043E\u0447\u043A\u0430 \u0410: *" + from + "*\n";
    str += "\u0422\u043E\u0447\u043A\u0430 B: *" + to + "*\n";
    if (Object.values(data2.tools).length !== 0)
      str += "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442: *" + Object.values(data2.tools).map(function(item, index) {
        const space = index === 0 ? "" : " ";
        return space + item;
      }) + "*\n";
    else
      str += "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442: *\u043D\u0435\u0442 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*\n";
    if (Object.values(data2.rashodniki).length !== 0)
      str += "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438: *" + Object.values(data2.rashodniki).map(function(item, index) {
        const space = index === 0 ? "" : " ";
        const over = item.over > 0 ? ": \u261D\uFE0F\u0434\u043E\u043A\u0443\u043F\u043A\u0430 " + item.over + " " + item.units + " " : "";
        return space + item.name + " - " + (item.count + item.over) + " " + item.units + over;
      }) + "*\n";
  }
  if (data2.comment !== "Null")
    str += "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439: *" + data2.comment + "*\n";
  if (data2.dateCreated !== "Null")
    str += "\u0421\u043E\u0437\u0434\u0430\u043D\u0430: " + data2.dateCreated + "\n";
  return str;
}
function zayavkaToData(i, allZayavkiObj) {
  let data2 = {
    id: allZayavkiObj["#"][i],
    dateCreated: allZayavkiObj["\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434."][i],
    type: allZayavkiObj["\u0422\u0438\u043F"][i],
    delivery: allZayavkiObj["\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430"][i],
    dateTime: allZayavkiObj["\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F"][i],
    status: allZayavkiObj["\u0421\u0442\u0430\u0442\u0443\u0441"][i],
    user: allZayavkiObj["C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"][i],
    from: allZayavkiObj["\u041E\u0431\u044A\u0435\u043A\u0442 A"][i],
    to: allZayavkiObj["\u041E\u0431\u044A\u0435\u043A\u0442 B"][i],
    tools: JSON.parse(allZayavkiObj["\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442"][i]),
    rashodniki: JSON.parse(allZayavkiObj["\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438"][i]),
    comment: allZayavkiObj["\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439"][i]
  };
  for (const id in data2.rashodniki) {
    data2.rashodniki[id].reserved = data2.rashodniki[id].count;
  }
  return data2;
}
var init_requestConverter = __esm({
  "src/common/requestConverter.ts"() {
  }
});

// src/common/next-id.ts
var next_id_default;
var init_next_id = __esm({
  "src/common/next-id.ts"() {
    next_id_default = (arr) => {
      let nextId = 0;
      for (const el of arr) {
        const n = Number(el);
        if (Number.isInteger(n) && n > nextId)
          nextId = n;
      }
      nextId++;
      return String(nextId);
    };
  }
});

// src/toObject.ts
var TX_INITIAL_MESSAGE_TO, TX_BTN_SELECT, TX_BTN_CUSTOM, TX_CUSTOM_QUESTION, TX_SELECTED_RES_FIRST, TX_SELECTED_RES_EDIT, TX_CUSTOM_ENTER, TX_CUSTOM_FINAL, TX_BTN_DELETE, TX_CANT_DELETE, toObject_default;
var init_toObject = __esm({
  "src/toObject.ts"() {
    init_authorize();
    init_next_id();
    TX_INITIAL_MESSAGE_TO = "*\u041D\u0430 \u043A\u0430\u043A\u043E\u0439 \u043E\u0431\u044A\u0435\u043A\u0442 \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0430\u0435\u043C?*";
    TX_BTN_SELECT = "\u0412\u044B\u0431\u0440\u0430\u0442\u044C";
    TX_BTN_CUSTOM = "\u0423\u043A\u0430\u0437\u0430\u0442\u044C \u0434\u0440\u0443\u0433\u043E\u0439";
    TX_CUSTOM_QUESTION = "*\u041D\u0435\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435?*";
    TX_SELECTED_RES_FIRST = "*\u0412\u044B\u0431\u0440\u0430\u043D \u043E\u0431\u044A\u0435\u043A\u0442*: ";
    TX_SELECTED_RES_EDIT = "*\u0417\u0430\u043C\u0435\u043D\u0435\u043D \u043E\u0431\u044A\u0435\u043A\u0442*: ";
    TX_CUSTOM_ENTER = "\u2328\uFE0F \u0412\u0432\u0435\u0434\u0438\u0442\u0435 *\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u043B\u0438 \u0430\u0434\u0440\u0435\u0441 \u043E\u0431\u044A\u0435\u043A\u0442\u0430*:";
    TX_CUSTOM_FINAL = "\u0425\u043E\u0440\u043E\u0448\u043E. \u0417\u0430\u043F\u0438\u0441\u0430\u043B";
    TX_BTN_DELETE = "\u0423\u0434\u0430\u043B\u0438\u0442\u044C";
    TX_CANT_DELETE = "\u041D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u0443\u0434\u0430\u043B\u0438\u0442\u044C. \u041D\u0430 \u044D\u0442\u043E\u043C \u043E\u0431\u044A\u0435\u043A\u0442\u0435 \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u0438\u043D\u0442\u0440\u0443\u043C\u0435\u043D\u0442.";
    toObject_default = async (msg, c2, editMode, end) => {
      const messagesIds = {};
      const objTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0421\u0442\u0430\u0442\u0443\u0441", "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"]);
      const currentUser = getLocalPhone(getUserName(msg));
      c2.botUI.context(msg, async () => {
        await c2.botUI.message(msg, TX_INITIAL_MESSAGE_TO, { mark_to_remove: true });
        let i = 0;
        for (const el of objTable["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]) {
          if (objTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] === "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439" || objTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] === "\u0414\u043E\u0431\u0430\u0432\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440" && objTable["C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"][i] === currentUser) {
            const opts2 = {
              reply_markup: { inline_keyboard: [[]] },
              mark_to_remove: true
            };
            const btns = opts2.reply_markup.inline_keyboard[0];
            btns.push({
              text: TX_BTN_SELECT,
              callback_data: "select_" + i
            });
            if (objTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] === "\u0414\u043E\u0431\u0430\u0432\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440") {
              btns.push({
                text: TX_BTN_DELETE,
                callback_data: "delete_" + i
              });
            }
            const nmsg = await c2.botUI.message(msg, objTable["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][i], opts2);
            messagesIds[String(i)] = nmsg.message_id;
          }
          i++;
        }
        const opts = {
          reply_markup: { inline_keyboard: [
            [{
              text: TX_BTN_CUSTOM,
              callback_data: "null"
            }]
          ] },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, TX_CUSTOM_QUESTION, opts);
      }, {
        callback_query: async (query) => {
          const split2 = query.data.split("_");
          let type = split2[0];
          let ind = Number(split2[1]);
          if (type === "select") {
            const TX = editMode ? TX_SELECTED_RES_EDIT : TX_SELECTED_RES_FIRST;
            const name = objTable["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][ind];
            await c2.botUI.message(msg, TX + name);
            c2.data[msg.chat.id].to = objTable["Auto #"][ind];
            c2.botUI.deleteAllMarked(msg);
            await end();
          } else if (type === "delete") {
            const toolsData = await c2.tableUI.getList("\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", ["\u041E\u0431\u044A\u0435\u043A\u0442"]);
            const indx = toolsData["\u041E\u0431\u044A\u0435\u043A\u0442"].indexOf(String(ind));
            if (indx === -1) {
              c2.tableUI.updateRow(
                "\u041E\u0431\u044A\u0435\u043A\u0442\u044B",
                ind + 2,
                // %%% всегда добавлять 2!!!
                { "\u0421\u0442\u0430\u0442\u0443\u0441": "\u0423\u0434\u0430\u043B\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440" }
              );
              c2.botUI.delete(msg, messagesIds[ind]);
            } else {
              await c2.botUI.message(msg, TX_CANT_DELETE, { mark_to_remove: true });
            }
          } else if (type === "null") {
            c2.botUI.context(msg, async () => {
              await c2.botUI.message(msg, TX_CUSTOM_ENTER);
            }, {
              message: async (msg2) => {
                const nextId = next_id_default(objTable["Auto #"]);
                const obj = [{
                  "Auto #": nextId,
                  "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435": msg2.text,
                  "\u0421\u0442\u0430\u0442\u0443\u0441": "\u0414\u043E\u0431\u0430\u0432\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440",
                  "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A": getLocalPhone(msg2.chat.username)
                }];
                await c2.tableUI.insertRows("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", obj);
                c2.data[msg2.chat.id].to = String(nextId);
                await c2.botUI.message(msg2, TX_CUSTOM_FINAL);
                c2.botUI.deleteAllMarked(msg2);
                await end();
              }
            });
          }
        }
      });
    };
  }
});

// src/dostavka.ts
var TX_INITIAL_QUESTION_ZABERU, TX_INITIAL_QUESTION_PRIVEZU, TX_BTN_SELF_ZABERU, TX_BTN_SELF_PRIVESU, TX_BTN_DELIVERY, TX_SUCESS_DELIVERY, TX_SUCESS_SELF, dostavka_default;
var init_dostavka = __esm({
  "src/dostavka.ts"() {
    TX_INITIAL_QUESTION_ZABERU = "\u041D\u0443\u0436\u043D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438\u043B\u0438 \u0441\u0430\u043C \u0437\u0430\u0431\u0435\u0440\u0435\u0448\u044C?";
    TX_INITIAL_QUESTION_PRIVEZU = "\u041D\u0443\u0436\u043D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0438\u043B\u0438 \u0441\u0430\u043C \u043F\u0440\u0438\u0432\u0435\u0437\u0435\u0448\u044C?";
    TX_BTN_SELF_ZABERU = "\u0417\u0430\u0431\u0435\u0440\u0443 \u0441\u0430\u043C";
    TX_BTN_SELF_PRIVESU = "\u0411\u0435\u0437 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438";
    TX_BTN_DELIVERY = "\u041D\u0443\u0436\u043D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430";
    TX_SUCESS_DELIVERY = "\u041F\u043E\u043D\u044F\u043B, *\u043F\u0440\u0438\u0432\u0435\u0437\u0435\u043C*";
    TX_SUCESS_SELF = "\u041F\u043E\u043D\u044F\u043B, *\u0437\u0430\u0431\u0435\u0440\u0435\u0448\u044C \u0441\u0430\u043C*";
    dostavka_default = async (msg, c2, editMode, end) => {
      let delMsg;
      c2.botUI.context(msg, async () => {
        const opts = {
          reply_markup: { inline_keyboard: [
            [{
              text: c2.data[msg.chat.id].type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430" ? TX_BTN_SELF_ZABERU : TX_BTN_SELF_PRIVESU,
              callback_data: "self"
            }, {
              text: TX_BTN_DELIVERY,
              callback_data: "delivery"
            }]
          ] },
          mark_to_remove: true
        };
        delMsg = await c2.botUI.message(
          msg,
          c2.data[msg.chat.id].type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430" ? TX_INITIAL_QUESTION_ZABERU : TX_INITIAL_QUESTION_PRIVEZU,
          opts
        );
      }, {
        callback_query: async (query) => {
          await c2.botUI.delete(msg, delMsg.message_id);
          c2.data[msg.chat.id].delivery = query.data === "delivery" ? "\u0414\u0430" : "\u041D\u0435\u0442";
          const SMSG = query.data === "self" ? TX_SUCESS_SELF : TX_SUCESS_DELIVERY;
          await c2.botUI.message(msg, SMSG);
          await end();
        }
      });
    };
  }
});

// src/dateTime.ts
var Calendar, TX_INITIAL_QUESTION_SELF, TX_INITIAL_QUESTION_DELIVERY, TX_CUSTOM_QUESTION2, TX_BTN_ASAP, TX_BTN_CUSTOM_TIME, TX_ASAP_REPLY, TX_CUSTOM_REPLY, dateTime_default;
var init_dateTime = __esm({
  "src/dateTime.ts"() {
    Calendar = require("telegram-inline-calendar");
    TX_INITIAL_QUESTION_SELF = "\u041A\u043E\u0433\u0434\u0430 \u0445\u043E\u0447\u0435\u0448\u044C \u0437\u0430\u0431\u0440\u0430\u0442\u044C?";
    TX_INITIAL_QUESTION_DELIVERY = "\u041A \u043A\u0430\u043A\u043E\u043C\u0443 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043F\u0440\u0438\u0432\u0435\u0437\u0442\u0438?";
    TX_CUSTOM_QUESTION2 = "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0438 \u0432\u0440\u0435\u043C\u044F:";
    TX_BTN_ASAP = "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438";
    TX_BTN_CUSTOM_TIME = "\u0422\u043E\u0447\u043D\u0430\u044F \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F";
    TX_ASAP_REPLY = "\u041F\u043E\u043D\u044F\u043B, *\u043F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438*. \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0441\u0432\u044F\u0436\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0443\u0442\u043E\u0447\u043D\u0435\u043D\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438";
    TX_CUSTOM_REPLY = "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F: ";
    dateTime_default = async (msg, c2, editMode, end) => {
      const dt = /* @__PURE__ */ new Date();
      const calendar = new Calendar(c2.botUI.bot, {
        date_format: "DD-MM-YYYY",
        language: "ru",
        close_calendar: true,
        time_selector_mod: true,
        // time_range: "05:00-23:59",
        time_step: "1h",
        custom_start_msg: TX_CUSTOM_QUESTION2
        // start_date: fromDate,
        // stop_date: false,
      });
      let delMsg;
      c2.botUI.context(msg, async () => {
        const opts = { reply_markup: { inline_keyboard: [
          [{
            text: TX_BTN_CUSTOM_TIME,
            callback_data: "custom"
          }],
          [{
            text: TX_BTN_ASAP,
            callback_data: "asap"
          }]
        ] } };
        const TX = c2.data[msg.chat.id].delivery === "\u041D\u0435\u0442" ? TX_INITIAL_QUESTION_SELF : TX_INITIAL_QUESTION_DELIVERY;
        delMsg = await c2.botUI.message(msg, TX, opts);
      }, {
        callback_query: async (query) => {
          c2.botUI.delete(msg, delMsg.message_id);
          if (query.data === "asap") {
            c2.data[msg.chat.id].dateTime = "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438";
            await c2.botUI.message(msg, TX_ASAP_REPLY);
            await end();
          } else {
            c2.botUI.context(msg, async () => {
              calendar.startNavCalendar(msg);
            }, {
              callback_query: async (query2) => {
                if (query2.message.message_id == calendar.chats.get(query2.message.chat.id)) {
                  let res = calendar.clickButtonCalendar(query2);
                  if (res !== -1) {
                    const d = query2.data.split(" ");
                    const date = d[0].split("_")[1];
                    const time = d[1].split("_")[0];
                    await c2.botUI.message(msg, TX_CUSTOM_REPLY + "*" + date + " | " + time + "*");
                    c2.data[msg.chat.id].dateTime = date + " | " + time;
                    await end();
                  }
                }
              }
            });
          }
        }
      });
    };
  }
});

// src/common/search.ts
function split(str) {
  const s = str.replace("\u0451", "\u0435").toLowerCase();
  return s.split(DECORATORS);
}
function escape(str) {
  const s = str.replace("\u0451", "\u0435").toLowerCase();
  return s.replace(DECORATORS, "");
}
async function SearchToolsByStr(c2, str) {
  let searchRes = [];
  const rows = await c2.tableUI.getList("\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", ["Auto #", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u0424\u043E\u0442\u043E", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C"]);
  const strArr = split(str);
  rows["Auto #"].forEach((id, i) => {
    const name = rows["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][i];
    const desc = rows["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][i];
    const nameEscaped = escape(name);
    const descEscaped = escape(desc);
    let foundAcc = strArr.length;
    strArr.forEach((str2) => {
      if (nameEscaped.indexOf(str2) != -1 || descEscaped.indexOf(str2) != -1) {
        foundAcc--;
      }
    });
    if (foundAcc === 0 && rows["\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C"][i] === "\u0418\u0441\u043F\u0440\u0430\u0432\u0435\u043D" && rows["\u0421\u0442\u0430\u0442\u0443\u0441"][i] === "\u0421\u043A\u043B\u0430\u0434") {
      searchRes.push({
        id,
        name,
        desc,
        url: rows["\u0424\u043E\u0442\u043E"][i]
      });
    }
  });
  return searchRes;
}
async function GetToolsByIds(c2, ids) {
  let searchRes = [];
  const rows = await c2.tableUI.getList("\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", ["Auto #", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u0424\u043E\u0442\u043E"]);
  for (const reqId in ids) {
    let i = 0;
    for (const id of rows["Auto #"]) {
      if (reqId === id) {
        searchRes.push({
          id,
          name: rows["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][i],
          desc: rows["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][i],
          url: rows["\u0424\u043E\u0442\u043E"][i]
        });
        continue;
      }
      i++;
    }
  }
  return searchRes;
}
var DECORATORS;
var init_search = __esm({
  "src/common/search.ts"() {
    DECORATORS = /[^a-zA-Zа-яА-ЯёЁ0-9]/g;
  }
});

// src/tools.ts
var LINK_TABLE, TX_INITIAL_MESSAGE, TX_SEARCH_MESSAGE, TX_INITIAL_MESSAGE_EDIT, TX_SEARCH_NORESULT, TX_END_MESSAGE, TX_BUTTON_ADD, TX_BUTTON_PHOTO, TX_BUTTON_DELETE, TX_BUTTON_END, TX_BUTTON_TOOLS_LIST, TX_BUTTON_EDIT_END, TX_FOUND_1, TX_FOUND_2, TX_FOUND_3, TX_TOOL, TX_END_CONFIRM_REQUEST, TX_BUTTON_CONFIRM, TX_BUTTON_NOT_CONFIRM, TX_END_CONFIRMED, TX_END_NOT_CONFIRMED, SEARCH_LIMIT, tools_default;
var init_tools = __esm({
  "src/tools.ts"() {
    init_search();
    LINK_TABLE = "https://docs.google.com/spreadsheets/d/12LFi9eXfizondNQgE7sBqrMr78Mt6pRnz8Jbuhzv14k/edit?usp=sharing";
    TX_INITIAL_MESSAGE = "*\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*:";
    TX_SEARCH_MESSAGE = "\u0414\u043B\u044F \u{1F50E} \u043F\u043E\u0438\u0441\u043A\u0430 \u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F *\u043F\u0438\u0448\u0438 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441 \u0432 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438*";
    TX_INITIAL_MESSAGE_EDIT = "*\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*:";
    TX_SEARCH_NORESULT = "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E";
    TX_END_MESSAGE = "\u0414\u043B\u044F \u0432\u044B\u0445\u043E\u0434\u0430 \u0438\u0437 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430 \u043D\u0430\u0436\u043C\u0438\u0442\u0435";
    TX_BUTTON_ADD = "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C";
    TX_BUTTON_PHOTO = "\u0424\u043E\u0442\u043E";
    TX_BUTTON_DELETE = "\u0423\u0434\u0430\u043B\u0438\u0442\u044C";
    TX_BUTTON_END = "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 >>";
    TX_BUTTON_TOOLS_LIST = "\u0421\u043F\u0438\u0441\u043E\u043A \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432";
    TX_BUTTON_EDIT_END = "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 >>";
    TX_FOUND_1 = "\u041D\u0430\u0439\u0434\u0435\u043D\u043E ";
    TX_FOUND_2 = " (\u043B\u0438\u043C\u0438\u0442 ";
    TX_FOUND_3 = ")";
    TX_TOOL = "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E: ";
    TX_END_CONFIRM_REQUEST = "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D. \u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u0431\u0435\u0437 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430?";
    TX_BUTTON_CONFIRM = "\u0414\u0430";
    TX_BUTTON_NOT_CONFIRM = "\u041D\u0435\u0442";
    TX_END_CONFIRMED = "\u041F\u043E\u043D\u044F\u043B, *\u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u043C \u0431\u0435\u0437 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*";
    TX_END_NOT_CONFIRMED = "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435";
    SEARCH_LIMIT = 6;
    tools_default = async (msg, c2, editMode, end) => {
      const addedToolsMessages = {};
      const searchResultMessages = {};
      const cachedObject = {};
      let yesNoMsg;
      let addedTools = c2.data[msg.chat.id].tools;
      let showFoundedTool = async (id, name, desc, photoUrl) => {
        const opts = {
          reply_markup: {
            inline_keyboard: [[{ text: TX_BUTTON_ADD, callback_data: "add_" + id }]]
          }
          // mark_to_remove: true
        };
        if (photoUrl) {
          opts.reply_markup.inline_keyboard[0].push({ text: TX_BUTTON_PHOTO, url: photoUrl });
        }
        const nmsg = await c2.botUI.message(msg, `*${desc}*
${name}`, opts);
        searchResultMessages[String(id)] = nmsg.message_id;
        cachedObject[String(id)] = { name, desc };
      };
      let showAddedTool = async (id, name, desc) => {
        const opts = {
          reply_markup: {
            inline_keyboard: [[{ text: TX_BUTTON_DELETE, callback_data: "delete_" + id }]]
          }
        };
        const nmsg = await c2.botUI.message(msg, TX_TOOL + "*" + desc + "*\n" + name, opts);
        addedToolsMessages[String(id)] = nmsg.message_id;
      };
      let showEndMessage = async () => {
        const endOpts = {
          reply_markup: {
            inline_keyboard: [
              [{ text: TX_BUTTON_TOOLS_LIST, url: LINK_TABLE }],
              [{ text: editMode ? TX_BUTTON_EDIT_END : TX_BUTTON_END, callback_data: "end" }]
            ]
          },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, TX_END_MESSAGE, endOpts);
      };
      let clearsearchResultMessagess = () => {
        for (const prop in searchResultMessages) {
          c2.botUI.delete(msg, searchResultMessages[prop]);
          delete searchResultMessages[prop];
        }
      };
      c2.botUI.context(msg, async () => {
        if (!editMode) {
          await c2.botUI.message(msg, TX_INITIAL_MESSAGE, { mark_to_remove: true });
          await showEndMessage();
          await c2.botUI.message(msg, TX_SEARCH_MESSAGE, { mark_to_remove: true });
        } else {
          await c2.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT);
          await c2.botUI.message(msg, TX_SEARCH_MESSAGE, { mark_to_remove: true });
          let tools = await GetToolsByIds(c2, c2.data[msg.chat.id].tools ? c2.data[msg.chat.id].tools : {});
          for (const o of tools) {
            await showAddedTool(o.id, o.name, o.desc);
            cachedObject[String(o.id)] = { name: o.name, desc: o.desc };
          }
          await showEndMessage();
        }
      }, {
        message: async (msg2) => {
          c2.botUI.deleteAllMarked(msg2);
          await clearsearchResultMessagess();
          c2.botUI.markToDelete(msg2, msg2.message_id);
          const searchRes = await SearchToolsByStr(c2, msg2.text);
          if (searchRes.length) {
            let cur_i = 0;
            for (let i = 0; i < searchRes.length; i++) {
              const o = searchRes[i];
              if (cur_i < SEARCH_LIMIT) {
                if (addedTools && !addedTools[String(o.id)]) {
                  await showFoundedTool(o.id, o.name, o.desc, o.url);
                  cur_i++;
                }
              }
            }
            await c2.botUI.message(msg2, TX_FOUND_1 + cur_i + TX_FOUND_2 + SEARCH_LIMIT + TX_FOUND_3, { mark_to_remove: true });
          } else {
            await c2.botUI.message(msg2, TX_SEARCH_NORESULT, { mark_to_remove: true });
          }
          await showEndMessage();
        },
        callback_query: async (query) => {
          if (query.data === "end") {
            if (Object.keys(addedTools).length === 0) {
              const opts = {
                reply_markup: {
                  inline_keyboard: [[
                    { text: TX_BUTTON_CONFIRM, callback_data: "end-confirmed" },
                    { text: TX_BUTTON_NOT_CONFIRM, callback_data: "end-not-confirmed" }
                  ]]
                },
                mark_to_remove: true
              };
              yesNoMsg = await c2.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts);
            } else {
              c2.data[msg.chat.id].tools = addedTools;
              c2.botUI.deleteAllMarked(msg);
              await clearsearchResultMessagess();
              for (const id in addedToolsMessages) {
                c2.botUI.delete(msg, addedToolsMessages[id]);
                await c2.botUI.message(msg, TX_TOOL + "*" + cachedObject[id].desc + "*\n" + cachedObject[id].name);
              }
              await end();
            }
          } else if (query.data === "end-confirmed") {
            c2.data[msg.chat.id].tools = addedTools;
            await c2.botUI.message(msg, TX_END_CONFIRMED);
            c2.botUI.deleteAllMarked(msg);
            await clearsearchResultMessagess();
            await end();
          } else if (query.data === "end-not-confirmed") {
            c2.botUI.delete(msg, yesNoMsg.message_id);
            await c2.botUI.message(msg, TX_END_NOT_CONFIRMED, { mark_to_remove: true });
          } else {
            const type = query.data.split("_")[0];
            const id = query.data.split("_")[1];
            if (type === "add") {
              await showAddedTool(id, cachedObject[id].name, cachedObject[id].desc);
              addedTools[id] = cachedObject[id].desc + " (" + cachedObject[id].name + ")";
              await c2.botUI.delete(msg, searchResultMessages[id]);
              delete searchResultMessages[id];
            } else {
              c2.botUI.delete(msg, addedToolsMessages[id]);
              delete addedToolsMessages[id];
              if (addedTools[id]) {
                delete addedTools[id];
              }
            }
          }
        }
      });
    };
  }
});

// src/comment.ts
var TX_INITIAL_MESSAGE2, TX_INITIAL_EDIT_MESSAGE, TX_NO_SUCCESS_MESSAGE, TX_NO_SKIP_MESSAGE, TX_BUTTON_SKIP, comment_default;
var init_comment = __esm({
  "src/comment.ts"() {
    TX_INITIAL_MESSAGE2 = "\u2328\uFE0F \u0412\u0432\u0435\u0434\u0438\u0442\u0435 *\u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0434\u043B\u044F \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u0430*:";
    TX_INITIAL_EDIT_MESSAGE = "\u2328\uFE0F \u0412\u0432\u0435\u0434\u0438\u0442\u0435 *\u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0434\u043B\u044F \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u0430*:";
    TX_NO_SUCCESS_MESSAGE = "\u041F\u043E\u043D\u044F\u043B, \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E *\u043F\u0435\u0440\u0435\u0434\u0430\u043C \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u0443*";
    TX_NO_SKIP_MESSAGE = "\u041E\u043A, *\u0431\u0435\u0437 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432*";
    TX_BUTTON_SKIP = "\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C";
    comment_default = async (msg, c2, editMode, end) => {
      let msdDelID;
      c2.botUI.context(msg, async () => {
        const opts = {
          reply_markup: {
            inline_keyboard: [[{ text: TX_BUTTON_SKIP, callback_data: "skip" }]]
          }
        };
        const nmsg = await c2.botUI.message(msg, editMode ? TX_INITIAL_EDIT_MESSAGE : TX_INITIAL_MESSAGE2, opts);
        msdDelID = nmsg.message_id;
      }, {
        message: async (msg2) => {
          c2.data[msg2.chat.id].comment = msg2.text;
          c2.botUI.delete(msg2, msdDelID);
          await c2.botUI.message(msg2, TX_NO_SUCCESS_MESSAGE);
          await end();
        },
        callback_query: async (query) => {
          if (query.data === "skip") {
            c2.data[msg.chat.id].comment = "Null";
            c2.botUI.delete(msg, msdDelID);
            await c2.botUI.message(msg, TX_NO_SKIP_MESSAGE);
            await end();
          }
        }
      });
    };
  }
});

// src/rashodniki.ts
var TX_INITIAL_MESSAGE3, TX_INITIAL_MESSAGE_EDIT2, TX_SELECT_CATEGORY, TX_CURRENT_CATEGORY, TX_END_MESSAGE2, TX_BACK_MESSAGE, TX_BUTTON_END2, TX_BUTTON_EDIT_END2, TX_BUTTON_BACK, TX_EXISTS, TX_END_CONFIRM_REQUEST2, TX_BUTTON_CONFIRM2, TX_BUTTON_NOT_CONFIRM2, TX_END_CONFIRMED2, TX_END_NOT_CONFIRMED2, addedRashodnikiMsgIds, MRashodniki, rashodniki_default;
var init_rashodniki = __esm({
  "src/rashodniki.ts"() {
    TX_INITIAL_MESSAGE3 = "*\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u044B\u0445 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432*:";
    TX_INITIAL_MESSAGE_EDIT2 = "*\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u044B\u0445 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432*:";
    TX_SELECT_CATEGORY = "\u0412\u044B\u0431\u0435\u0440\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E";
    TX_CURRENT_CATEGORY = "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F:";
    TX_END_MESSAGE2 = "\u0414\u043B\u044F \u0432\u044B\u0445\u0430\u0434 \u0438\u0437 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u043E\u0432 \u043D\u0430\u0436\u043C\u0438";
    TX_BACK_MESSAGE = "\u0414\u043B\u044F \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u043A \u0432\u044B\u0431\u043E\u0440\u0443 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u043D\u0430\u0436\u043C\u0438";
    TX_BUTTON_END2 = "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 >>";
    TX_BUTTON_EDIT_END2 = "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 >>";
    TX_BUTTON_BACK = "<< \u0412\u0435\u0440\u043D\u0443\u0442\u0441\u044F \u0432 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438";
    TX_EXISTS = " \u0443\u0436\u0435 \u0432 \u0441\u043F\u0438\u0441\u043E\u043A\u0435";
    TX_END_CONFIRM_REQUEST2 = "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B. \u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u0431\u0435\u0437 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u043E\u0432?";
    TX_BUTTON_CONFIRM2 = "\u0414\u0430";
    TX_BUTTON_NOT_CONFIRM2 = "\u041D\u0435\u0442";
    TX_END_CONFIRMED2 = "\u041F\u043E\u043D\u044F\u043B, *\u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u043C \u0431\u0435\u0437 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u043E\u0432*";
    TX_END_NOT_CONFIRMED2 = "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435";
    addedRashodnikiMsgIds = {};
    MRashodniki = async (msg, c2, editMode, showInitialMessage, end) => {
      addedRashodnikiMsgIds[msg.chat.id] = addedRashodnikiMsgIds[msg.chat.id] !== void 0 ? addedRashodnikiMsgIds[msg.chat.id] : {};
      const addedRashodniki = c2.data[msg.chat.id].rashodniki;
      let yesNoMsg;
      const Table = await c2.tableUI.getList("\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438", ["Auto #", "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435", "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0412\u0430\u0440\u0438\u0430\u043D\u0442"]);
      let showRashodnikMessage = async (id, update, endedEditMode) => {
        let msgId;
        if (update)
          msgId = addedRashodnikiMsgIds[msg.chat.id][id];
        const indx = Table["Auto #"].indexOf(id);
        const buttons = [];
        if (!endedEditMode) {
          if (addedRashodniki[id].count + addedRashodniki[id].over - 1 > 0)
            buttons.push({ text: "-1", callback_data: id + "_-1" });
          else
            buttons.push({ text: " ", callback_data: id + "_null" });
          if (addedRashodniki[id].count + addedRashodniki[id].over - 5 > 0)
            buttons.push({ text: "-5", callback_data: id + "_-5" });
          else
            buttons.push({ text: " ", callback_data: id + "_null" });
          buttons.push({ text: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", callback_data: id + "_del" });
          buttons.push({ text: "+5", callback_data: id + "_+5" });
          buttons.push({ text: "+1", callback_data: id + "_+1" });
        }
        const opts = {
          reply_markup: {
            inline_keyboard: [buttons]
          }
        };
        const availible = Number(Table["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][indx]) + addedRashodniki[id].reserved;
        const overuse = addedRashodniki[id].over;
        const cntx = !endedEditMode ? " (\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 " + availible + " " + Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][indx] + ")" : "";
        const warning = overuse > 0 ? "\n\u261D\uFE0F \u043D\u0443\u0436\u043D\u0430 \u0434\u043E\u043A\u0443\u043F\u043A\u0430: " + overuse + " " + Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][indx] : "";
        const count = "\n\u25BA *" + (addedRashodniki[id].count + addedRashodniki[id].over) + " " + Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][indx] + "* " + cntx;
        const name = "*" + addedRashodniki[id].name + "*";
        const tx = name + count + warning;
        if (update) {
          await c2.botUI.editMessage(msg, msgId, tx, opts);
        } else {
          const nmsg = await c2.botUI.message(msg, tx, opts);
          addedRashodnikiMsgIds[msg.chat.id][id] = nmsg.message_id;
        }
      };
      const showEndMessage = async () => {
        const opts2 = {
          reply_markup: {
            inline_keyboard: [[{ text: editMode ? TX_BUTTON_EDIT_END2 : TX_BUTTON_END2, callback_data: "end" }]]
          },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, TX_END_MESSAGE2, opts2);
      };
      const showBackMessage = async () => {
        const opts2 = {
          reply_markup: {
            inline_keyboard: [[{ text: TX_BUTTON_BACK, callback_data: "back" }]]
          },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, TX_BACK_MESSAGE, opts2);
      };
      const endConfirmationRashodniki = async () => {
        const opts = {
          reply_markup: {
            inline_keyboard: [[
              { text: TX_BUTTON_CONFIRM2, callback_data: "end-confirmed" },
              { text: TX_BUTTON_NOT_CONFIRM2, callback_data: "end-not-confirmed" }
            ]]
          },
          mark_to_remove: true
        };
        yesNoMsg = await c2.botUI.message(msg, TX_END_CONFIRM_REQUEST2, opts);
      };
      const endRashodniki = async () => {
        c2.data[msg.chat.id].rashodniki = addedRashodniki;
        c2.botUI.deleteAllMarked(msg);
        for (const id in addedRashodnikiMsgIds[msg.chat.id]) {
          showRashodnikMessage(id, true, true);
        }
        addedRashodnikiMsgIds[msg.chat.id] = void 0;
        await end();
      };
      const endRashodnikiConfirmed = async () => {
        await c2.botUI.message(msg, TX_END_CONFIRMED2);
        await endRashodniki();
      };
      const endRashodnikiNotConfirmed = async () => {
        c2.botUI.delete(msg, yesNoMsg.message_id);
        await c2.botUI.message(msg, TX_END_NOT_CONFIRMED2, { mark_to_remove: true });
      };
      const operationAdd = (id, v) => {
        const indx = Table["Auto #"].indexOf(id);
        const availible = Number(Table["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][indx]) + addedRashodniki[id].reserved;
        const total = addedRashodniki[id].over + addedRashodniki[id].count;
        if (total + v >= availible) {
          addedRashodniki[id].count = availible;
          addedRashodniki[id].over = total + v - availible;
        } else {
          addedRashodniki[id].count = total + v;
          addedRashodniki[id].over = 0;
        }
      };
      const callbackRashodnikControls = async (data2) => {
        let updateRashodnikiMsg = async (id2) => {
          await showRashodnikMessage(id2, true);
        };
        const id = data2.split("_")[0];
        const op = data2.split("_")[1];
        if (op === "+1") {
          operationAdd(id, 1);
          updateRashodnikiMsg(id);
        } else if (op === "+5") {
          operationAdd(id, 5);
          updateRashodnikiMsg(id);
        } else if (op === "-1") {
          operationAdd(id, -1);
          updateRashodnikiMsg(id);
        } else if (op === "-5") {
          operationAdd(id, -5);
          updateRashodnikiMsg(id);
        } else if (op === "del") {
          c2.botUI.delete(msg, addedRashodnikiMsgIds[msg.chat.id][id]);
          delete addedRashodniki[id];
          delete addedRashodnikiMsgIds[msg.chat.id][id];
        }
      };
      c2.botUI.context(msg, async () => {
        const buttons = [];
        const existCategories = {};
        Table["\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F"].forEach((el) => {
          if (!existCategories[el]) {
            buttons.push(
              [{ text: el, callback_data: el }]
            );
            existCategories[el] = true;
          }
        });
        const opts = {
          reply_markup: {
            inline_keyboard: buttons
          },
          mark_to_remove: true
        };
        if (!editMode) {
          if (showInitialMessage) {
            await c2.botUI.message(msg, TX_INITIAL_MESSAGE3);
          }
        } else {
          if (showInitialMessage) {
            await c2.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT2);
            for (const id in addedRashodniki) {
              showRashodnikMessage(id);
            }
          }
        }
        await c2.botUI.message(msg, TX_SELECT_CATEGORY, opts);
        await showEndMessage();
      }, {
        callback_query: async (query) => {
          if (query.data === "end") {
            if (Object.keys(addedRashodniki).length === 0) {
              endConfirmationRashodniki();
            } else {
              endRashodniki();
            }
          } else if (query.data === "end-confirmed") {
            endRashodnikiConfirmed();
          } else if (query.data === "end-not-confirmed") {
            endRashodnikiNotConfirmed();
          } else if (query.data.split("_").length === 2) {
            callbackRashodnikControls(query.data);
          } else {
            c2.botUI.context(msg, async () => {
              const List = {};
              const Category = query.data;
              c2.botUI.deleteAllMarked(msg);
              await showBackMessage();
              await c2.botUI.message(msg, TX_CURRENT_CATEGORY + "*" + query.data + "*", { mark_to_remove: true });
              Table["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"].forEach((el, i) => {
                if (Table["\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F"][i] === Category) {
                  let firstTime = false;
                  if (!List[el]) {
                    List[el] = [];
                    firstTime = true;
                  }
                  if (Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][i] !== "" && Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][i] !== " " && Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][i] !== void 0)
                    List[el].push({
                      name: Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][i],
                      id: Table["Auto #"][i],
                      count: Table["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][i],
                      items: Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][i]
                    });
                  else if (firstTime)
                    List[el].push({
                      name: Table["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][i],
                      // пишем название а не вариант
                      id: Table["Auto #"][i],
                      count: Table["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][i],
                      items: Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][i]
                    });
                }
              });
              for (let el in List) {
                const buttons = [];
                List[el].forEach((variant) => {
                  buttons.push(
                    [{
                      text: variant.name + " (" + variant.count + " " + variant.items + ")",
                      callback_data: variant.id
                    }]
                  );
                });
                const opts = {
                  reply_markup: {
                    inline_keyboard: buttons
                  },
                  mark_to_remove: true
                };
                await c2.botUI.message(msg, "*" + el + "*", opts);
              }
              showEndMessage();
            }, {
              callback_query: async (query2) => {
                if (query2.data === "end") {
                  if (Object.keys(addedRashodniki).length === 0) {
                    endConfirmationRashodniki();
                  } else {
                    endRashodniki();
                  }
                } else if (query2.data === "end-confirmed") {
                  endRashodnikiConfirmed();
                } else if (query2.data === "end-not-confirmed") {
                  endRashodnikiNotConfirmed();
                } else if (query2.data === "back") {
                  c2.botUI.deleteAllMarked(msg);
                  MRashodniki(msg, c2, editMode, false, end);
                } else if (query2.data.split("_").length === 2) {
                  callbackRashodnikControls(query2.data);
                } else {
                  const id = query2.data;
                  const indx = Table["Auto #"].indexOf(id);
                  if (addedRashodniki[id] === void 0) {
                    let name = Table["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][indx];
                    if (Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][indx] !== "" && Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][indx] !== void 0)
                      name += " (" + Table["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][indx] + ")";
                    addedRashodniki[id] = {
                      name,
                      count: 0,
                      over: 0,
                      reserved: 0,
                      units: Table["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][indx]
                    };
                    operationAdd(id, 1);
                    showRashodnikMessage(id);
                  } else {
                    await c2.botUI.message(msg, Table["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][indx] + TX_EXISTS, { mark_to_remove: true });
                  }
                }
              }
            });
          }
        }
      });
    };
    rashodniki_default = MRashodniki;
  }
});

// src/fromObjectTools.ts
var TX_INITIAL_MESSAGE_NO_TOOLS, TX_INITIAL_MESSAGE_RETURN, TX_INITIAL_MESSAGE_BETWEEN, TX_BTN_RETURN_SELECT, TX_BTN_RETURN_ALL, TX_BTN_RETURN_SELECTIVE, TX_BTN_ADD, TX_BTN_DELETE2, TX_BUTTON_EDIT_END3, TX_BUTTON_NAVIGATION, TX_END_CONFIRM_REQUEST3, TX_BUTTON_CONFIRM3, TX_BUTTON_NOT_CONFIRM3, TX_END_CONFIRMED3, TX_END_NOT_CONFIRMED3, fromObjectTools_default;
var init_fromObjectTools = __esm({
  "src/fromObjectTools.ts"() {
    TX_INITIAL_MESSAGE_NO_TOOLS = "\u0423 \u0432\u0430\u0441 \u043D\u0435\u0442 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430 \u043D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u0445. \u0417\u0430\u0432\u043A\u0430 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u0430.";
    TX_INITIAL_MESSAGE_RETURN = "\u0412\u044B\u0431\u0435\u0440\u0438 \u043E\u0431\u044A\u0435\u043A\u0442 \u0434\u043B\u044F \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430";
    TX_INITIAL_MESSAGE_BETWEEN = "\u0412\u044B\u0431\u0435\u0440\u0438 \u043E\u0431\u044A\u0435\u043A\u0442 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430";
    TX_BTN_RETURN_SELECT = "\u0412\u044B\u0431\u0440\u0430\u0442\u044C";
    TX_BTN_RETURN_ALL = "\u0412\u0435\u0441\u044C \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442";
    TX_BTN_RETURN_SELECTIVE = "\u0412\u044B\u0431\u043E\u0440\u043E\u0447\u043D\u043E";
    TX_BTN_ADD = "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C";
    TX_BTN_DELETE2 = "\u0423\u0431\u0440\u0430\u0442\u044C";
    TX_BUTTON_EDIT_END3 = "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 >>";
    TX_BUTTON_NAVIGATION = "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F:";
    TX_END_CONFIRM_REQUEST3 = "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D. \u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u0431\u0435\u0437 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430?";
    TX_BUTTON_CONFIRM3 = "\u0414\u0430";
    TX_BUTTON_NOT_CONFIRM3 = "\u041D\u0435\u0442";
    TX_END_CONFIRMED3 = "\u041F\u043E\u043D\u044F\u043B, *\u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u043C \u0431\u0435\u0437 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0435 \u0432 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438 \u0434\u0430\u043B\u0435\u0435.";
    TX_END_NOT_CONFIRMED3 = "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043C \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435";
    fromObjectTools_default = async (msg, c2, editTools, end) => {
      let yesNoMsg;
      const user = c2.data[msg.chat.id].user;
      const toolsOrderedByObject = {};
      const savedMessagesIdsByIndex = {};
      const savedAddedMessagesIdsByIndex = {};
      const toolsData = await c2.tableUI.getList(
        "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
        ["Auto #", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u041C\u0435\u0441\u0442\u043E\u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435", "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u0417\u0430\u044F\u0432\u043A\u0430", "\u041E\u0431\u044A\u0435\u043A\u0442"]
      );
      const objectData = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      let found = false;
      for (const [i, dataUser] of toolsData["\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"].entries()) {
        if (dataUser === user && toolsData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u0421\u043A\u043B\u0430\u0434" && //показывае и заявкку и на объекте
        toolsData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u0417\u0430\u044F\u0432\u043A\u0430") {
          const objectID = toolsData["\u041E\u0431\u044A\u0435\u043A\u0442"][i];
          if (toolsOrderedByObject[objectID] === void 0)
            toolsOrderedByObject[objectID] = [];
          toolsOrderedByObject[objectID].push({ ind: i, selected: true });
          found = true;
        }
      }
      async function ObjectTools(objectId, end2) {
        c2.botUI.deleteAllMarked(msg);
        const ind = objectData["Auto #"].indexOf(objectId);
        let toolsStr = "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442: \n";
        if (toolsOrderedByObject[objectId])
          Object.values(toolsOrderedByObject[objectId]).map(function(item) {
            const indd = item.ind;
            toolsStr += "*" + toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][indd] + "* (" + toolsData["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][indd] + ")\n";
          });
        const objName = ind !== -1 ? objectData["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][ind] : "\u041E\u0431\u044A\u0435\u043A\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D";
        const msgStr = "\u041E\u0431\u044A\u0435\u043A\u0442: *" + objName + "*\n\n" + toolsStr;
        c2.botUI.context(msg, async () => {
          const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
          const btns = opts.reply_markup.inline_keyboard[0];
          btns.push({
            text: TX_BTN_RETURN_ALL,
            callback_data: "all"
          });
          btns.push({
            text: TX_BTN_RETURN_SELECTIVE,
            callback_data: "selective"
          });
          await c2.botUI.message(msg, msgStr, opts);
        }, {
          callback_query: async (query) => {
            if (query.data === "all") {
              c2.botUI.deleteAllMarked(msg);
              await c2.botUI.message(msg, msgStr);
              let saveAll = () => {
                let tools = {};
                Object.values(toolsOrderedByObject[objectId]).map(function(item) {
                  const ind2 = item.ind;
                  if (item.selected)
                    tools[toolsData["Auto #"][ind2]] = toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind2];
                });
                c2.data[msg.chat.id].tools = tools;
              };
              await saveAll();
              await end2();
            } else if (query.data === "selective") {
              let getAddMessage = (ind2, showButton) => {
                const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
                const btns = opts.reply_markup.inline_keyboard[0];
                btns.push({
                  text: TX_BTN_ADD,
                  callback_data: "add_" + ind2
                });
                const str = "*" + toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind2] + "* (" + toolsData["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][ind2] + ")";
                if (showButton)
                  return { msg: str, opts };
                else
                  return { msg: str, opts: { mark_to_remove: true } };
              };
              let getAddedMessage = (ind2, showButton) => {
                const opts = { reply_markup: { inline_keyboard: [[]] } };
                opts.mark_to_remove = true;
                const btns = opts.reply_markup.inline_keyboard[0];
                btns.push({
                  text: TX_BTN_DELETE2,
                  callback_data: "delete_" + ind2
                });
                const str = "*\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E: " + toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind2] + "* (" + toolsData["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][ind2] + ")";
                if (showButton)
                  return { msg: str, opts };
                else
                  return { msg: str, opts: {} };
              };
              c2.botUI.context(msg, async () => {
                c2.data[msg.chat.id].tools = {};
                c2.botUI.deleteAllMarked(msg);
                const str = "\u041E\u0431\u044A\u0435\u043A\u0442: *" + objName + "*";
                await c2.botUI.message(msg, str, { mark_to_remove: true });
                for (const obj of toolsOrderedByObject[objectId]) {
                  const ind2 = obj.ind;
                  const o = getAddMessage(ind2, true);
                  const nmsg = await c2.botUI.message(msg, o.msg, o.opts);
                  savedMessagesIdsByIndex[ind2] = nmsg.message_id;
                }
                const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
                const btns = opts.reply_markup.inline_keyboard[0];
                btns.push({
                  text: TX_BUTTON_EDIT_END3,
                  callback_data: "end"
                });
                await c2.botUI.message(msg, TX_BUTTON_NAVIGATION, opts);
              }, {
                callback_query: async (query2) => {
                  const split2 = query2.data.split("_");
                  let type = split2[0];
                  let ind2 = split2[1];
                  if (type === "add") {
                    const oa = getAddedMessage(ind2, true);
                    const addMsg = await c2.botUI.message(msg, oa.msg, oa.opts);
                    savedAddedMessagesIdsByIndex[ind2] = addMsg.message_id;
                    const o = getAddMessage(ind2, false);
                    c2.botUI.editMessage(msg, savedMessagesIdsByIndex[ind2], o.msg, o.opts);
                    c2.data[msg.chat.id].tools[toolsData["Auto #"][ind2]] = toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind2];
                  } else if (type === "delete") {
                    c2.botUI.delete(msg, savedAddedMessagesIdsByIndex[ind2]);
                    const o = getAddMessage(ind2, true);
                    c2.botUI.editMessage(msg, savedMessagesIdsByIndex[ind2], o.msg, o.opts);
                    delete c2.data[msg.chat.id].tools[toolsData["Auto #"][ind2]];
                  } else if (type === "end") {
                    if (Object.keys(c2.data[msg.chat.id].tools).length === 0) {
                      const opts = {
                        reply_markup: {
                          inline_keyboard: [[
                            { text: TX_BUTTON_CONFIRM3, callback_data: "end-confirmed" },
                            { text: TX_BUTTON_NOT_CONFIRM3, callback_data: "end-not-confirmed" }
                          ]]
                        },
                        mark_to_remove: true
                      };
                      yesNoMsg = await c2.botUI.message(msg, TX_END_CONFIRM_REQUEST3, opts);
                    } else {
                      for (const key in savedAddedMessagesIdsByIndex) {
                        const o = getAddedMessage(key, false);
                        await c2.botUI.editMessage(msg, savedAddedMessagesIdsByIndex[key], o.msg, o.opts);
                        c2.botUI.deleteFromMarked(msg, savedAddedMessagesIdsByIndex[key]);
                      }
                      c2.botUI.deleteAllMarked(msg);
                      await end2();
                    }
                  } else if (type === "end-confirmed") {
                    await c2.botUI.message(msg, TX_END_CONFIRMED3);
                    c2.botUI.deleteAllMarked(msg);
                    await end2();
                  } else if (type === "end-not-confirmed") {
                    c2.botUI.delete(msg, yesNoMsg.message_id);
                    await c2.botUI.message(msg, TX_END_NOT_CONFIRMED3, { mark_to_remove: true });
                  }
                }
              });
            }
          }
        });
      }
      if (editTools) {
        await ObjectTools(c2.data[msg.chat.id].from, end);
        return;
      }
      c2.botUI.context(msg, async () => {
        if (!found) {
          await c2.botUI.message(msg, TX_INITIAL_MESSAGE_NO_TOOLS, { mark_to_remove: true });
          return;
        }
        const keyArr = Object.keys(toolsOrderedByObject);
        if (keyArr.length === 1) {
          await ObjectTools(keyArr[0], end);
          return;
        }
        const tx = c2.data[msg.chat.id].type === "\u0412\u043E\u0437\u0432\u0440\u0430\u0442" ? TX_INITIAL_MESSAGE_RETURN : TX_INITIAL_MESSAGE_BETWEEN;
        await c2.botUI.message(msg, tx, { mark_to_remove: true });
        for (const objectID in toolsOrderedByObject) {
          const ind = objectData["Auto #"].indexOf(objectID);
          const objName = ind !== -1 ? objectData["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][ind] : "\u041E\u0431\u044A\u0435\u043A\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D";
          const opts = { reply_markup: { inline_keyboard: [[]] }, mark_to_remove: true };
          const btns = opts.reply_markup.inline_keyboard[0];
          btns.push({
            text: TX_BTN_RETURN_SELECT,
            callback_data: "select_" + objectID
          });
          let toolsStr = "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442: " + toolsOrderedByObject[objectID].length + " \u0448\u0442.";
          await c2.botUI.message(msg, "\u041E\u0431\u044A\u0435\u043A\u0442: *" + objName + "*\n" + toolsStr, opts);
        }
      }, {
        callback_query: async (query) => {
          const type = query.data.split("_")[0];
          const oid = query.data.split("_")[1];
          if (type === "select") {
            c2.data[msg.chat.id].from = oid;
            await ObjectTools(oid, end);
          }
        }
      });
    };
  }
});

// src/edit.ts
var TX_INTIAL_MESSAGE, TX_OBJECT_TO, TX_DOSTAVKA, TX_TIME, TX_ADD_COMMENT, TX_BUTTON_FROM_OBJECT, TX_BUTTON_FROM_OBJECT_TOOLS, TX_BUTTON_OBJECT_TO, TX_BUTTON_DOSTAVKA, TX_BUTTON_TIME, TX_BUTTON_INSTRUMENT, TX_BUTTON_RASHODNIKI, TX_BUTTON_COMMENT, TX_NAVIGATION, TX_BUTTON_BACK2, TX_SAVE, TX_BUTTON_SAVE, Edit, edit_default;
var init_edit = __esm({
  "src/edit.ts"() {
    init_tools();
    init_rashodniki();
    init_comment();
    init_dateTime();
    init_dostavka();
    init_toObject();
    init_fromObjectTools();
    init_requestConverter();
    TX_INTIAL_MESSAGE = "\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C?";
    TX_OBJECT_TO = "*\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435* \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F:";
    TX_DOSTAVKA = "*\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435* \u0442\u0438\u043F\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438:";
    TX_TIME = "*\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435* \u0432\u0440\u0435\u043C\u0435\u043D\u0438:";
    TX_ADD_COMMENT = "*\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435* \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u044F:";
    TX_BUTTON_FROM_OBJECT = "\u0421 \u043E\u0431\u044A\u0435\u043A\u0442\u0430";
    TX_BUTTON_FROM_OBJECT_TOOLS = "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442";
    TX_BUTTON_OBJECT_TO = "\u041D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442";
    TX_BUTTON_DOSTAVKA = "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430";
    TX_BUTTON_TIME = "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F";
    TX_BUTTON_INSTRUMENT = "\u0418\u043D\u0441\u0440\u0443\u043C\u0435\u043D\u0442";
    TX_BUTTON_RASHODNIKI = "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u044B\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B";
    TX_BUTTON_COMMENT = "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439";
    TX_NAVIGATION = "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F";
    TX_BUTTON_BACK2 = "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F";
    TX_SAVE = "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435";
    TX_BUTTON_SAVE = "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C";
    Edit = async (msg, c2, end, editingHappen, usersTable) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      let nmsg;
      let showZayavka = async () => {
        const showName = usersTable ? true : false;
        nmsg = await c2.botUI.message(
          msg,
          dataToMessage(c2.data[msg.chat.id], objectsTable, showName, usersTable),
          { mark_to_remove: true }
        );
      };
      c2.botUI.context(msg, async () => {
        c2.botUI.deleteAllMarked(msg);
        await showZayavka();
        const optsC = {
          reply_markup: {
            inline_keyboard: [
              [{
                text: editingHappen ? TX_BUTTON_SAVE : TX_BUTTON_BACK2,
                callback_data: editingHappen ? "backAndEdit" : "back"
              }]
            ]
          },
          mark_to_remove: true
        };
        const opts = {
          reply_markup: {
            inline_keyboard: [[], [], []]
          },
          mark_to_remove: true
        };
        const line1 = opts.reply_markup.inline_keyboard[0];
        const line2 = opts.reply_markup.inline_keyboard[1];
        const line3 = opts.reply_markup.inline_keyboard[2];
        if (c2.data[msg.chat.id].type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430") {
          line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: "object_to" });
          line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: "dostavka" });
          line1.push({ text: TX_BUTTON_TIME, callback_data: "time" });
          line2.push({ text: TX_BUTTON_INSTRUMENT, callback_data: "tools" });
          line2.push({ text: TX_BUTTON_RASHODNIKI, callback_data: "rashodnniki" });
          line3.push({ text: TX_BUTTON_COMMENT, callback_data: "comment" });
        } else if (c2.data[msg.chat.id].type === "\u0412\u043E\u0437\u0432\u0440\u0430\u0442") {
          line1.push({ text: TX_BUTTON_FROM_OBJECT, callback_data: "from_object" });
          line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: "from_object_tools" });
          line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: "dostavka" });
          line2.push({ text: TX_BUTTON_TIME, callback_data: "time" });
          line3.push({ text: TX_BUTTON_COMMENT, callback_data: "comment" });
        } else if (c2.data[msg.chat.id].type === "\u041C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438") {
          line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: "from_object_tools" });
          line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: "object_to" });
          line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: "dostavka" });
          line2.push({ text: TX_BUTTON_TIME, callback_data: "time" });
          line3.push({ text: TX_BUTTON_COMMENT, callback_data: "comment" });
        } else if (c2.data[msg.chat.id].type === "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F") {
          line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: "dostavka" });
          line1.push({ text: TX_BUTTON_TIME, callback_data: "time" });
          line3.push({ text: TX_BUTTON_COMMENT, callback_data: "comment" });
        }
        await c2.botUI.message(msg, TX_INTIAL_MESSAGE, opts);
        await c2.botUI.message(msg, editingHappen ? TX_SAVE : TX_NAVIGATION, optsC);
      }, {
        callback_query: async (query) => {
          c2.botUI.deleteAllMarked(msg);
          await showZayavka();
          if (query.data === "tools") {
            await tools_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "rashodnniki") {
            await rashodniki_default(msg, c2, true, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "comment") {
            await c2.botUI.message(msg, TX_ADD_COMMENT);
            await comment_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "time") {
            await c2.botUI.message(msg, TX_TIME);
            await dateTime_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "dostavka") {
            await c2.botUI.message(msg, TX_DOSTAVKA);
            await dostavka_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "object_tools") {
            await c2.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS);
            await fromObjectTools_default(msg, c2, false, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "from_object_tools") {
            await c2.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS);
            await fromObjectTools_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "object_to") {
            await c2.botUI.message(msg, TX_OBJECT_TO);
            await toObject_default(msg, c2, true, async () => {
              await Edit(msg, c2, end, true);
            });
          } else if (query.data === "back") {
            c2.botUI.deleteAllMarked(msg);
            await end(false);
          } else if (query.data === "backAndEdit") {
            if (nmsg)
              c2.botUI.deleteFromMarked(msg, nmsg.message_id);
            await end(true);
          }
        }
      });
    };
    edit_default = Edit;
  }
});

// src/confirm.ts
var TX_INITIAL_MESSAGE4, TX_BUTTON_CONFIRM4, TX_BUTTON_NOT_CONFIRM4, Confirm, confirm_default;
var init_confirm = __esm({
  "src/confirm.ts"() {
    init_edit();
    init_requestConverter();
    TX_INITIAL_MESSAGE4 = "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430 \u0432\u044B\u0448\u0435, *\u0432\u0441\u0435 \u043B\u0438 \u0432\u0435\u0440\u043D\u043E*?";
    TX_BUTTON_CONFIRM4 = "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C";
    TX_BUTTON_NOT_CONFIRM4 = "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C";
    Confirm = async (msg, c2, end) => {
      const editNow = async () => {
        await edit_default(msg, c2, async (isEdited) => {
          if (isEdited)
            await end();
          else
            await Confirm(msg, c2, end);
        }, false);
      };
      c2.botUI.deleteAllMarked(msg);
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      const nmsg = await c2.botUI.message(msg, dataToMessage(c2.data[msg.chat.id], objectsTable), { mark_to_remove: true });
      c2.botUI.context(msg, async () => {
        const opts = {
          reply_markup: {
            inline_keyboard: [[
              { text: TX_BUTTON_NOT_CONFIRM4, callback_data: "not-confirmed" },
              { text: TX_BUTTON_CONFIRM4, callback_data: "confirmed" }
            ]]
          },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, TX_INITIAL_MESSAGE4, opts);
      }, {
        callback_query: async (query) => {
          if (query.data === "confirmed") {
            c2.botUI.deleteFromMarked(msg, nmsg.message_id);
            c2.botUI.deleteAllMarked(msg);
            await end();
          } else {
            c2.botUI.deleteAllMarked(msg);
            await editNow();
          }
        }
      });
    };
    confirm_default = Confirm;
  }
});

// src/common/notify.ts
var Notify, notify_default;
var init_notify = __esm({
  "src/common/notify.ts"() {
    Notify = async (msg, c2, text, usersTable, phone) => {
      if (phone === null) {
        const ind = usersTable["\u0420\u043E\u043B\u044C"].indexOf("\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440");
        if (ind !== -1) {
          const chatId = usersTable["ChatId"][ind];
          if (chatId !== "") {
            await c2.botUI.message(msg, text, void 0, chatId);
          } else {
            await c2.botUI.message(msg, "\u041E\u0448\u0438\u0431\u043A\u0430. \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u043D\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435. \u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430 \u0441 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u043C.");
          }
        } else {
          await c2.botUI.message(msg, "\u041E\u0448\u0438\u0431\u043A\u0430. \u0420\u043E\u043B\u044C \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u0430 \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u043E\u0432. \u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430 \u0441 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u043C.");
        }
      } else {
        const ind = usersTable["#"].indexOf(phone);
        if (ind !== -1) {
          const chatId = usersTable["ChatId"][ind];
          if (chatId !== "") {
            await c2.botUI.message(msg, text, void 0, chatId);
          } else {
            await c2.botUI.message(msg, "\u041E\u0448\u0438\u0431\u043A\u0430. \u041C\u0430\u0441\u0442\u0435\u0440 \u043D\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435. \u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430 \u0441 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u043C.");
          }
        } else {
          console.log("\u043E\u0448\u0438\u0431\u043A\u0430, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0434\u043B\u044F Notify \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D");
        }
      }
    };
    notify_default = Notify;
  }
});

// src/common/saveRequest.ts
async function updateTools(msg, c2, tools, status, object, requestId) {
  const obj = [];
  for (const toolId in tools) {
    obj.push({
      "\u0417\u0430\u044F\u0432\u043A\u0430": requestId,
      // #id
      "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442": toolId,
      // #id
      "\u0421\u0442\u0430\u0442\u0443\u0441": status,
      "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C.": stringDate(/* @__PURE__ */ new Date()),
      "\u041E\u0431\u044A\u0435\u043A\u0442": object,
      "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A": status !== "\u0421\u043A\u043B\u0430\u0434" ? c2.data[msg.chat.id].user : ""
    });
  }
  await c2.tableUI.insertRows("\u0416\u0443\u0440\u043D\u0430\u043B \u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", obj);
}
async function updateRashodniki(msg, c2, prevRash, newRash) {
  let clone = (co) => {
    let o = {};
    for (const key in co) {
      o[key] = co[key];
    }
    return o;
  };
  const objAllRashidniki = await c2.tableUI.getList(
    "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438",
    ["Auto #", "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435", "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0412\u0430\u0440\u0438\u0430\u043D\u0442", "\u0424\u043E\u0442\u043E", "\u041C\u0435\u0441\u0442\u043E"]
  );
  let prevMergeAcc = clone(prevRash);
  let newMergeAcc = clone(newRash);
  for (const key in prevMergeAcc) {
    if (newMergeAcc[key] === void 0) {
      newMergeAcc[key] = clone(prevMergeAcc[key]);
      newMergeAcc[key].count = 0;
    }
  }
  for (const key in newMergeAcc) {
    if (prevMergeAcc[key] === void 0) {
      prevMergeAcc[key] = clone(newMergeAcc[key]);
      prevMergeAcc[key].count = 0;
    }
  }
  for (const newRashId in newMergeAcc) {
    const i = objAllRashidniki["Auto #"].indexOf(newRashId);
    if (i !== -1) {
      const currentCount = Number(objAllRashidniki["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][i]);
      const prevCount = prevMergeAcc[newRashId].count;
      const newCount = newMergeAcc[newRashId].count;
      const updatedCount = currentCount - (newCount - prevCount);
      c2.tableUI.updateRow(
        "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438",
        i + 2,
        // %%% всегда добавлять 2???
        { "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E": updatedCount }
      );
    } else {
      await c2.botUI.message(msg, "\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0430. \u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A #" + i + " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D, \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u0431\u044B\u043B \u0443\u0434\u0430\u043B\u0435\u043D \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C. \u0421\u043E\u043E\u0431\u0449\u0438\u0442\u0435 \u0438 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0443.");
    }
  }
}
async function saveRequest(msg, c2, requestId, onlyStatus) {
  const objZayavki = await c2.tableUI.getList("\u0417\u0430\u044F\u0432\u043A\u0438", ["#", "\u0422\u0438\u043F", "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430", "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F", "\u0421\u0442\u0430\u0442\u0443\u0441", "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u041E\u0431\u044A\u0435\u043A\u0442 A", "\u041E\u0431\u044A\u0435\u043A\u0442 B", "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438", "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434.", "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C."]);
  const newRequest = c2.data[msg.chat.id];
  let prevRequest = void 0;
  let id;
  if (requestId === void 0)
    id = next_id_default(objZayavki["#"]);
  else
    id = requestId;
  let obj;
  for (const id2 in newRequest.rashodniki) {
    delete newRequest.rashodniki[id2].reserved;
  }
  if (!onlyStatus)
    obj = {
      "#": id,
      "\u0422\u0438\u043F": newRequest.type,
      "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430": String(newRequest.delivery),
      "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F": newRequest.dateTime,
      "\u0421\u0442\u0430\u0442\u0443\u0441": newRequest.status,
      "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A": newRequest.user,
      //телефон
      "\u041E\u0431\u044A\u0435\u043A\u0442 A": newRequest.from,
      "\u041E\u0431\u044A\u0435\u043A\u0442 B": newRequest.to,
      "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442": JSON.stringify(newRequest.tools),
      "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438": JSON.stringify(newRequest.rashodniki),
      "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439": newRequest.comment,
      "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434.": stringDate(/* @__PURE__ */ new Date()),
      "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C.": stringDate(/* @__PURE__ */ new Date())
    };
  else
    obj = {
      "\u0421\u0442\u0430\u0442\u0443\u0441": newRequest.status
    };
  if (requestId === void 0) {
    c2.tableUI.insertRows("\u0417\u0430\u044F\u0432\u043A\u0438", [obj]);
    if (newRequest.type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430") {
      updateTools(msg, c2, newRequest.tools, "\u0417\u0430\u044F\u0432\u043A\u0430", newRequest.to, id);
      updateRashodniki(msg, c2, {}, newRequest.rashodniki);
    } else if (newRequest.type === "\u0412\u043E\u0437\u0432\u0440\u0430\u0442") {
      updateTools(msg, c2, newRequest.tools, "\u0417\u0430\u044F\u0432\u043A\u0430", newRequest.from, id);
    } else if (newRequest.type === "\u041C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438") {
      updateTools(msg, c2, newRequest.tools, "\u0417\u0430\u044F\u0432\u043A\u0430", newRequest.from, id);
    }
  } else {
    const ind = objZayavki["#"].indexOf(requestId);
    if (ind === -1) {
      console.log("\u041E\u0448\u0438\u0431\u043A\u0430 saveRequest. \u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430");
      return;
    }
    await c2.tableUI.updateRow("\u0417\u0430\u044F\u0432\u043A\u0438", ind + 2, obj);
    prevRequest = zayavkaToData(ind, objZayavki);
    const prevToolsString = JSON.stringify(prevRequest.tools);
    const newToolsString = JSON.stringify(newRequest.tools);
    const prevRashString = JSON.stringify(prevRequest.rashodniki);
    const newRashString = JSON.stringify(newRequest.rashodniki);
    let getDeletedTools = () => {
      let deleteToolsAcc = {};
      if (prevRequest) {
        for (const key in prevRequest.tools) {
          if (newRequest.tools[key] === void 0) {
            deleteToolsAcc[key] = prevRequest.tools[key];
          }
        }
      }
      return deleteToolsAcc;
    };
    let getAddedTools = () => {
      let addedToolsAcc = {};
      if (prevRequest) {
        for (const key in newRequest.tools) {
          if (prevRequest.tools[key] === void 0) {
            addedToolsAcc[key] = newRequest.tools[key];
          }
        }
      }
      return addedToolsAcc;
    };
    if (newRequest.type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430") {
      if (newRequest.status === "\u041E\u0442\u043C\u0435\u043D\u0430") {
        updateTools(msg, c2, newRequest.tools, "\u0421\u043A\u043B\u0430\u0434", newRequest.from, requestId);
        updateRashodniki(msg, c2, newRequest.rashodniki, {});
      }
      if (newRequest.status === "\u041E\u0431\u044A\u0435\u043A\u0442") {
        updateTools(msg, c2, newRequest.tools, "\u041E\u0431\u044A\u0435\u043A\u0442", newRequest.to, requestId);
      }
      if (prevToolsString !== newToolsString) {
        updateTools(msg, c2, getDeletedTools(), "\u0421\u043A\u043B\u0430\u0434", newRequest.to, requestId);
        updateTools(msg, c2, getAddedTools(), convertToJournalStatus(newRequest.status), newRequest.to, requestId);
      }
      if (prevRashString !== newRashString) {
        updateRashodniki(msg, c2, prevRequest.rashodniki, newRequest.rashodniki);
      }
    } else if (newRequest.type === "\u0412\u043E\u0437\u0432\u0440\u0430\u0442") {
      if (newRequest.status === "\u041E\u0442\u043C\u0435\u043D\u0430") {
        updateTools(msg, c2, newRequest.tools, "\u041E\u0431\u044A\u0435\u043A\u0442", newRequest.from, requestId);
      }
      if (newRequest.status === "\u0421\u043A\u043B\u0430\u0434") {
        updateTools(msg, c2, newRequest.tools, "\u0421\u043A\u043B\u0430\u0434", newRequest.to, requestId);
      }
    } else if (newRequest.type === "\u041C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438") {
      if (newRequest.status === "\u041E\u0442\u043C\u0435\u043D\u0430") {
        updateTools(msg, c2, newRequest.tools, "\u041E\u0431\u044A\u0435\u043A\u0442", newRequest.from, requestId);
      }
      if (newRequest.status === "\u041E\u0431\u044A\u0435\u043A\u0442") {
        updateTools(msg, c2, newRequest.tools, "\u041E\u0431\u044A\u0435\u043A\u0442", newRequest.to, requestId);
      }
    }
  }
}
var stringDate, convertToJournalStatus;
var init_saveRequest = __esm({
  "src/common/saveRequest.ts"() {
    init_requestConverter();
    init_next_id();
    stringDate = (date) => {
      const mm = date.getMonth() + 1;
      const dd = date.getDate();
      const h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
      const dt = [
        (dd > 9 ? "" : "0") + dd,
        (mm > 9 ? "" : "0") + mm,
        date.getFullYear()
      ].join(".");
      const tm = [
        (h > 9 ? "" : "0") + h,
        (m > 9 ? "" : "0") + m,
        (s > 9 ? "" : "0") + s
      ].join(":");
      const res = dt + " " + tm;
      return res;
    };
    convertToJournalStatus = (status) => {
      let js;
      js = "\u0417\u0430\u044F\u0432\u043A\u0430";
      switch (status) {
        case "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430":
        case "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430":
        case "\u0421\u043E\u0431\u0440\u0430\u043D":
          js = "\u0417\u0430\u044F\u0432\u043A\u0430";
          break;
        case "\u041E\u0431\u044A\u0435\u043A\u0442":
          js = "\u041E\u0431\u044A\u0435\u043A\u0442";
          break;
        case "\u0421\u043A\u043B\u0430\u0434":
          js = "\u0421\u043A\u043B\u0430\u0434";
          break;
        case "\u041E\u0442\u043C\u0435\u043D\u0430":
          console.log('\u041A\u043E\u0432\u0435\u0440\u0442\u0435\u0440 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 to JournalStatus \u043D\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0434\u043B\u044F "\u041E\u0442\u043C\u0435\u043D\u0430"');
          break;
      }
      return js;
    };
  }
});

// src/main/zayavka.ts
var zayavka_exports = {};
__export(zayavka_exports, {
  default: () => zayavka_default
});
var TX_NEW_ZAYAVKA_MNG, TX_REQEST_CONFIRMED, TX_INITIAL_MESSAGE5, TX_CONFLICT_TOOLS, TX_CONFLICT_RASHODNIKI, zayavka_default;
var init_zayavka = __esm({
  "src/main/zayavka.ts"() {
    init_authorize();
    init_requestConverter();
    init_toObject();
    init_dostavka();
    init_dateTime();
    init_tools();
    init_comment();
    init_confirm();
    init_rashodniki();
    init_notify();
    init_saveRequest();
    TX_NEW_ZAYAVKA_MNG = "\u2705 \u{1F51C}\u{1F3E2} \u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u043E \u0441\u043A\u043B\u0430\u0434\u0430:\n";
    TX_REQEST_CONFIRMED = "\u2705 *\u0417\u0430\u044F\u0432\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u043E \u0441\u043A\u043B\u0430\u0434\u0430 \u043F\u0440\u0438\u043D\u044F\u0442\u0430*. \u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0442\u044C \u0432 \u044D\u0442\u043E\u0442 \u0447\u0430\u0442.\n\u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u044F\u0432\u043A\u0430\u043C\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043B \u043C\u0435\u043D\u044E /moizayavki";
    TX_INITIAL_MESSAGE5 = "*\u0417\u0430\u044F\u0432\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u043E \u0441\u043A\u043B\u0430\u0434\u0430*";
    TX_CONFLICT_TOOLS = "*\u2757\uFE0F\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u0435\u043B \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0438\u043D\u043C\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430*. \u0414\u0440\u0443\u0433\u043E\u0439 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u0443\u0436\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043B \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0432\u0430\u043C\u0438 \u0438\u043D\u0441\u0442\u0440\u0443\u0435\u043C\u0435\u043D\u0442. \n\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0442\u0438\u0442\u0435 \u043D\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0435.";
    TX_CONFLICT_RASHODNIKI = "*\u2757\uFE0F\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u0435\u043B \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u043E\u0432*. \u041A\u0442\u043E-\u0442\u043E \u0443\u0436\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043B \u0447\u0430\u0441\u0442\u044C \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u043E\u0432 \n\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0442\u0438\u0442\u0435 \u043D\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432 \u0440\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0430\u0445.";
    zayavka_default = async (msg, c2, end) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      await c2.botUI.message(msg, TX_INITIAL_MESSAGE5);
      c2.data[msg.chat.id] = {
        id: "Null",
        type: "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430",
        from: "0",
        to: "1",
        status: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
        delivery: "\u041D\u0435\u0442",
        dateTime: "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438",
        tools: {},
        //{"2":"СПЕЦ-3447","3":"BORT BNG-2000X"}
        rashodniki: {},
        //{"1":{"name":"Лезвия | Прямы е","count":100}, "2":{"name":"Лезвия | Лезвия Крючок","count":100}}
        comment: "Null",
        user: getLocalPhone(getUserName(msg)),
        dateCreated: "Null"
      };
      let ConfirmedByUser = async () => {
        const toolsData = await c2.tableUI.getList(
          "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
          ["Auto #", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u041E\u0431\u044A\u0435\u043A\u0442", "\u041C\u0435\u0441\u0442\u043E\u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435", "\u041E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u044B\u0439", "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u0417\u0430\u044F\u0432\u043A\u0430"]
        );
        let conflictTool = false;
        let conflictRash = false;
        for (const toolId in c2.data[msg.chat.id].tools) {
          const ind = toolsData["Auto #"].indexOf(toolId);
          if (toolsData["\u0421\u0442\u0430\u0442\u0443\u0441"][ind] !== "\u0421\u043A\u043B\u0430\u0434") {
            let tx = "\u26D4\uFE0F" + toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind] + " | " + toolsData["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][ind] + "\n\u0423\u0436\u0435 \u0437\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u0430\u0432\u0430\u043B: " + toolsData["\u041E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u044B\u0439"][ind];
            await c2.botUI.message(msg, tx);
            conflictTool = true;
            delete c2.data[msg.chat.id].tools[toolId];
          }
        }
        const rashodniki = await c2.tableUI.getList(
          "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438",
          ["Auto #", "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435", "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0412\u0430\u0440\u0438\u0430\u043D\u0442", "\u0424\u043E\u0442\u043E", "\u041C\u0435\u0441\u0442\u043E"]
        );
        for (const toolId in c2.data[msg.chat.id].rashodniki) {
          const ind = rashodniki["Auto #"].indexOf(toolId);
          if (ind !== -1 && rashodniki["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][ind]) {
            const a = Number(rashodniki["\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E"][ind]);
            const b = c2.data[msg.chat.id].rashodniki[toolId].count;
            const dif = a - b;
            if (dif < 0) {
              let tx = "\u26D4\uFE0F" + rashodniki["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"][ind] + " | " + rashodniki["\u0412\u0430\u0440\u0438\u0430\u043D\u0442"][ind] + "\n\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043E\u043B\u044C\u043D\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E: " + a + rashodniki["\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435"][ind];
              await c2.botUI.message(msg, tx);
              const newCount = c2.data[msg.chat.id].rashodniki[toolId].count + dif;
              c2.data[msg.chat.id].rashodniki[toolId].count = newCount;
              c2.data[msg.chat.id].rashodniki[toolId].over += -dif;
              conflictRash = true;
            }
          }
        }
        if (conflictTool)
          await c2.botUI.message(msg, TX_CONFLICT_TOOLS);
        if (conflictRash)
          await c2.botUI.message(msg, TX_CONFLICT_RASHODNIKI);
        if (conflictTool || conflictRash) {
          await confirm_default(msg, c2, async () => {
            ConfirmedByUser();
          });
          return;
        }
        await saveRequest(msg, c2);
        await c2.botUI.message(msg, TX_REQEST_CONFIRMED);
        const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
        await notify_default(
          msg,
          c2,
          TX_NEW_ZAYAVKA_MNG + dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable),
          usersTable,
          null
        );
        await end();
      };
      await toObject_default(msg, c2, false, async () => {
        await dostavka_default(msg, c2, false, async () => {
          await dateTime_default(msg, c2, false, async () => {
            await tools_default(msg, c2, false, async () => {
              await rashodniki_default(msg, c2, false, true, async () => {
                await comment_default(msg, c2, false, async () => {
                  await confirm_default(msg, c2, async () => {
                    await ConfirmedByUser();
                  });
                });
              });
            });
          });
        });
      });
    };
  }
});

// src/main/vozvrat.ts
var vozvrat_exports = {};
__export(vozvrat_exports, {
  default: () => vozvrat_default
});
var TX_NEW_ZAYAVKA_MNG2, TX_REQEST_CONFIRMED2, TX_INITIAL_MESSAGE6, vozvrat_default;
var init_vozvrat = __esm({
  "src/main/vozvrat.ts"() {
    init_authorize();
    init_requestConverter();
    init_fromObjectTools();
    init_dostavka();
    init_dateTime();
    init_comment();
    init_confirm();
    init_notify();
    init_saveRequest();
    TX_NEW_ZAYAVKA_MNG2 = "\u2705 \u{1F3E0}\u{1F519} \u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430:\n";
    TX_REQEST_CONFIRMED2 = "\u2705 *\u0417\u0430\u044F\u0432\u043A\u0430 \u0432\u043E\u0437\u0440\u0430\u0442\u0430 \u043F\u0440\u0438\u043D\u044F\u0442\u0430*. \u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0442\u044C \u0432 \u044D\u0442\u043E\u0442 \u0447\u0430\u0442.\n\u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u044F\u0432\u043A\u0430\u043C\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043B \u043C\u0435\u043D\u044E /moizayavki";
    TX_INITIAL_MESSAGE6 = "*\u0417\u0430\u044F\u0432\u043A\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434*";
    vozvrat_default = async (msg, c2, end) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      await c2.botUI.message(msg, TX_INITIAL_MESSAGE6);
      c2.data[msg.chat.id] = {
        id: "Null",
        type: "\u0412\u043E\u0437\u0432\u0440\u0430\u0442",
        from: "1",
        //заменим потом
        to: "0",
        status: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
        delivery: "\u041D\u0435\u0442",
        dateTime: "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438",
        tools: {},
        rashodniki: {},
        comment: "Null",
        user: getLocalPhone(getUserName(msg)),
        dateCreated: "Null"
      };
      let otherCall = async () => {
        await comment_default(msg, c2, false, async () => {
          await confirm_default(msg, c2, async () => {
            await saveRequest(msg, c2);
            await c2.botUI.message(msg, TX_REQEST_CONFIRMED2);
            const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
            await notify_default(
              msg,
              c2,
              TX_NEW_ZAYAVKA_MNG2 + dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable),
              usersTable,
              null
            );
            await end();
          });
        });
      };
      await fromObjectTools_default(msg, c2, false, async () => {
        await dostavka_default(msg, c2, false, async () => {
          if (c2.data[msg.chat.id].delivery === "\u0414\u0430")
            await dateTime_default(msg, c2, false, async () => {
              await otherCall();
            });
          else
            await otherCall();
        });
      });
    };
  }
});

// src/main/megduobj.ts
var megduobj_exports = {};
__export(megduobj_exports, {
  default: () => megduobj_default
});
var TX_NEW_ZAYAVKA_MNG3, TX_REQEST_CONFIRMED3, TX_INITIAL_MESSAGE7, megduobj_default;
var init_megduobj = __esm({
  "src/main/megduobj.ts"() {
    init_authorize();
    init_requestConverter();
    init_toObject();
    init_fromObjectTools();
    init_dostavka();
    init_dateTime();
    init_comment();
    init_confirm();
    init_notify();
    init_saveRequest();
    TX_NEW_ZAYAVKA_MNG3 = "\u2705 \u{1F3E2}\u{1F51C}\u{1F3E2} \u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430 \u043C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438:\n";
    TX_REQEST_CONFIRMED3 = "\u2705 *\u0417\u0430\u044F\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430 \u043C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438 \u043F\u0440\u0438\u043D\u044F\u0442\u0430*. \u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0442\u044C \u0432 \u044D\u0442\u043E\u0442 \u0447\u0430\u0442.\n\u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u044F\u0432\u043A\u0430\u043C\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043B \u043C\u0435\u043D\u044E /moizayavki";
    TX_INITIAL_MESSAGE7 = "*\u0417\u0430\u044F\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430 \u043C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438*";
    megduobj_default = async (msg, c2, end) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      await c2.botUI.message(msg, TX_INITIAL_MESSAGE7);
      c2.data[msg.chat.id] = {
        id: "Null",
        type: "\u041C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438",
        from: "1",
        //заменим при выборе
        to: "1",
        //заменим при выборе
        status: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
        delivery: "\u041D\u0435\u0442",
        dateTime: "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438",
        tools: {},
        rashodniki: {},
        //не используется при возврате
        comment: "Null",
        user: getLocalPhone(getUserName(msg)),
        dateCreated: "Null"
      };
      let otherCall = async () => {
        await comment_default(msg, c2, false, async () => {
          await confirm_default(msg, c2, async () => {
            await saveRequest(msg, c2);
            await c2.botUI.message(msg, TX_REQEST_CONFIRMED3);
            const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
            await notify_default(
              msg,
              c2,
              TX_NEW_ZAYAVKA_MNG3 + dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable),
              usersTable,
              null
            );
            await end();
          });
        });
      };
      await fromObjectTools_default(msg, c2, false, async () => {
        await toObject_default(msg, c2, false, async () => {
          await dostavka_default(msg, c2, false, async () => {
            if (c2.data[msg.chat.id].delivery === "\u0414\u0430")
              await dateTime_default(msg, c2, false, async () => {
                await otherCall();
              });
            else
              await otherCall();
          });
        });
      });
    };
  }
});

// src/main/svobodnaya.ts
var svobodnaya_exports = {};
__export(svobodnaya_exports, {
  default: () => svobodnaya_default
});
var TX_NEW_ZAYAVKA_MNG4, TX_REQEST_CONFIRMED4, TX_INITIAL_MESSAGE8, svobodnaya_default;
var init_svobodnaya = __esm({
  "src/main/svobodnaya.ts"() {
    init_authorize();
    init_requestConverter();
    init_dostavka();
    init_dateTime();
    init_comment();
    init_confirm();
    init_notify();
    init_saveRequest();
    TX_NEW_ZAYAVKA_MNG4 = "\u2705 \u{1F193} \u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u0432 \u0441\u0432\u043E\u0431\u043E\u043D\u043E\u0439 \u0444\u043E\u0440\u043C\u0435:\n";
    TX_REQEST_CONFIRMED4 = "\u2705 *\u0417\u0430\u044F\u0432\u043A\u0430 \u0432 \u0441\u0432\u043E\u0431\u043E\u043D\u043E\u0439 \u0444\u043E\u0440\u043C\u0435 \u043F\u0440\u0438\u043D\u044F\u0442\u0430*. \u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438 \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u0442\u044C \u0432 \u044D\u0442\u043E\u0442 \u0447\u0430\u0442.\n\u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u044F\u0432\u043A\u0430\u043C\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043B \u043C\u0435\u043D\u044E /moizayavki";
    TX_INITIAL_MESSAGE8 = "*\u0417\u0430\u044F\u0432\u043A\u0430 \u0432 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0439 \u0444\u043E\u0440\u043C\u0435*";
    svobodnaya_default = async (msg, c2, end) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      await c2.botUI.message(msg, TX_INITIAL_MESSAGE8);
      c2.data[msg.chat.id] = {
        id: "Null",
        type: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F",
        from: "0",
        to: "0",
        status: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
        // применимо
        delivery: "\u041D\u0435\u0442",
        // применимо
        dateTime: "\u041F\u043E \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u0438",
        // применимо
        tools: {},
        //не используется
        rashodniki: {},
        //не используется
        comment: "Null",
        user: getLocalPhone(getUserName(msg)),
        dateCreated: "Null"
      };
      let otherCall = async () => {
        await comment_default(msg, c2, false, async () => {
          await confirm_default(msg, c2, async () => {
            await saveRequest(msg, c2);
            await c2.botUI.message(msg, TX_REQEST_CONFIRMED4);
            const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
            await notify_default(
              msg,
              c2,
              TX_NEW_ZAYAVKA_MNG4 + dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable),
              usersTable,
              null
            );
            await end();
          });
        });
      };
      await dostavka_default(msg, c2, false, async () => {
        if (c2.data[msg.chat.id].delivery === "\u0414\u0430")
          await dateTime_default(msg, c2, false, async () => {
            await otherCall();
          });
        else
          await otherCall();
      });
    };
  }
});

// src/main/moizayavki.ts
var moizayavki_exports = {};
__export(moizayavki_exports, {
  default: () => moizayavki_default
});
var TX_NOTIFY_UPDATE, TX_NOTIFY_CANCELED, TX_NO_ZAYAVOK, TX_MY_ZAYAVKI, TX_PAGE, TX_BTN_CANCEL, TX_BTN_EDIT, TX_CONFIRN, TX_BTN_YES, TX_BTN_NO, COUNT_PER_PAGE, TX_BTN_NEXT_PAGE, TX_BTN_PREV_PAGE, TX_NEXT_MESSAGE, TX_PREV_MESSAGE, TX_EDIT_CONFIRMED, TX_EDIT_CANCELED, MoiZayavki, moizayavki_default;
var init_moizayavki = __esm({
  "src/main/moizayavki.ts"() {
    init_authorize();
    init_requestConverter();
    init_saveRequest();
    init_edit();
    init_notify();
    TX_NOTIFY_UPDATE = "\u{1F48A} \u0417\u0430\u044F\u0432\u043A\u0430 \u0431\u044B\u043B\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430:";
    TX_NOTIFY_CANCELED = "\u26D4\uFE0F \u0417\u0430\u044F\u0432\u043A\u0430 \u0431\u044B\u043B\u0430 \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430:";
    TX_NO_ZAYAVOK = "\u0423 \u0442\u0435\u0431\u044F \u0435\u0449\u0435 \u043D\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u0437\u0430\u044F\u0432\u043E\u043A";
    TX_MY_ZAYAVKI = "\u0417\u0430\u044F\u0432\u043A\u0438";
    TX_PAGE = "\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430";
    TX_BTN_CANCEL = "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C";
    TX_BTN_EDIT = "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C";
    TX_CONFIRN = "\u0422\u043E\u0447\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u044F\u0435\u043C \u0437\u0430\u044F\u0432\u043A\u0443?";
    TX_BTN_YES = "\u0414\u0430";
    TX_BTN_NO = "\u041D\u0435\u0442";
    COUNT_PER_PAGE = 3;
    TX_BTN_NEXT_PAGE = "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430";
    TX_BTN_PREV_PAGE = "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430";
    TX_NEXT_MESSAGE = "\u041F\u0440\u043E\u0448\u043B\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438";
    TX_PREV_MESSAGE = "\u0411\u043E\u043B\u0435\u0435 \u043D\u043E\u0432\u044B\u0435";
    TX_EDIT_CONFIRMED = "\u2705 *\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430*. \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0443";
    TX_EDIT_CANCELED = "\u26D4\uFE0F *\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430*. \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0443";
    MoiZayavki = async (msg, c2, page, end, newZayavkiData) => {
      const objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
      let zayavkiData;
      if (newZayavkiData)
        zayavkiData = newZayavkiData;
      else
        zayavkiData = await c2.tableUI.getList(
          "\u0417\u0430\u044F\u0432\u043A\u0438",
          [
            "#",
            "\u0422\u0438\u043F",
            "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430",
            "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F",
            "\u0421\u0442\u0430\u0442\u0443\u0441",
            "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A",
            "\u041E\u0431\u044A\u0435\u043A\u0442 A",
            "\u041E\u0431\u044A\u0435\u043A\u0442 B",
            "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
            "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438",
            "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439",
            "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434.",
            "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C."
          ]
        );
      for (const key in zayavkiData) {
        zayavkiData[key] = zayavkiData[key].reverse();
      }
      const messagesIds = {};
      const showNavigationButton = async (type, page2, totalItems) => {
        const newPage = type === "next" ? Number(page2) + 1 : Number(page2) - 1;
        const a = totalItems - 1;
        const b = COUNT_PER_PAGE;
        const totalPages = (a + b - a % b) / b;
        if (newPage < 1)
          return;
        if (newPage > totalPages)
          return;
        const opts = {
          reply_markup: { inline_keyboard: [
            [{
              text: type === "next" ? TX_BTN_NEXT_PAGE + " " + newPage + " >>" : "<< " + TX_BTN_PREV_PAGE + " " + newPage,
              callback_data: "page_" + newPage
              //id zayavki
            }]
          ] },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, type === "next" ? TX_NEXT_MESSAGE : TX_PREV_MESSAGE, opts);
      };
      c2.botUI.context(msg, async () => {
        const user = getLocalPhone(getUserName(msg));
        if (zayavkiData["C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"].indexOf(String(user)) === -1) {
          await c2.botUI.message(msg, TX_NO_ZAYAVOK, { mark_to_remove: true });
          return;
        }
        await c2.botUI.message(msg, TX_MY_ZAYAVKI + " (" + TX_PAGE + " " + page + ")", { mark_to_remove: true });
        await showNavigationButton("prev", page, zayavkiData["#"].length);
        for (const [i, phone] of zayavkiData["C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"].entries()) {
          const b = COUNT_PER_PAGE;
          if (i < (page - 1) * b)
            continue;
          if (i >= page * b)
            continue;
          if (phone === user && zayavkiData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u041E\u0442\u043C\u0435\u043D\u0430" && zayavkiData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u041E\u0431\u044A\u0435\u043A\u0442" && zayavkiData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u0421\u043A\u043B\u0430\u0434") {
            const opts = {
              reply_markup: { inline_keyboard: [[]] },
              mark_to_remove: true
            };
            const btns = opts.reply_markup.inline_keyboard[0];
            if (zayavkiData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] === "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430")
              btns.push({
                text: TX_BTN_EDIT,
                callback_data: "edit_" + zayavkiData["#"][i] + "_" + i
                //_id_i //индекс
              });
            btns.push({
              text: TX_BTN_CANCEL,
              callback_data: "cancel_" + zayavkiData["#"][i] + "_" + i
            });
            const nmsg = await c2.botUI.message(msg, dataToMessage(zayavkaToData(i, zayavkiData), objectsTable), opts);
            messagesIds[zayavkiData["#"][i]] = nmsg.message_id;
          } else {
            await c2.botUI.message(msg, dataToMessage(zayavkaToData(i, zayavkiData), objectsTable), { mark_to_remove: true });
          }
        }
        await showNavigationButton("next", page, zayavkiData["#"].length);
      }, {
        callback_query: async (query) => {
          const split2 = query.data.split("_");
          const type = split2[0];
          const val1 = split2[1];
          const val2 = split2[2];
          if (type === "edit") {
            c2.botUI.deleteAllMarked(msg);
            c2.data[msg.chat.id] = zayavkaToData(val2, zayavkiData);
            edit_default(msg, c2, async (isEdited) => {
              if (isEdited) {
                await saveRequest(msg, c2, val1);
                await c2.botUI.message(msg, TX_EDIT_CONFIRMED);
                const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
                await notify_default(msg, c2, TX_NOTIFY_UPDATE + "\n" + dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable), usersTable, null);
                await end();
              } else {
                MoiZayavki(msg, c2, page, end, newZayavkiData);
              }
            }, false);
          } else if (type === "cancel") {
            c2.botUI.context(msg, async () => {
              c2.botUI.deleteAllMarked(msg);
              c2.data[msg.chat.id] = zayavkaToData(val2, zayavkiData);
              await c2.botUI.message(msg, dataToMessage(c2.data[msg.chat.id], objectsTable), { mark_to_remove: true });
              const opts = {
                reply_markup: { inline_keyboard: [
                  [
                    {
                      text: TX_BTN_YES,
                      callback_data: "yes_" + val1 + "_" + val2
                    },
                    {
                      text: TX_BTN_NO,
                      callback_data: "no"
                    }
                  ]
                ] },
                mark_to_remove: true
              };
              await c2.botUI.message(msg, TX_CONFIRN, opts);
            }, {
              callback_query: async (query2) => {
                const split3 = query2.data.split("_");
                const type2 = split3[0];
                const id = split3[1];
                const ind = split3[2];
                if (type2 === "yes") {
                  c2.botUI.deleteAllMarked(msg);
                  c2.data[msg.chat.id].status = "\u041E\u0442\u043C\u0435\u043D\u0430";
                  await saveRequest(msg, c2, id, true);
                  zayavkiData["\u0421\u0442\u0430\u0442\u0443\u0441"][ind] = "\u041E\u0442\u043C\u0435\u043D\u0430";
                  await c2.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiData), objectsTable));
                  await c2.botUI.message(msg, TX_EDIT_CANCELED);
                  const usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "ChatId"]);
                  await notify_default(msg, c2, TX_NOTIFY_CANCELED + "\n" + dataToMessage(c2.data[msg.chat.id], objectsTable), usersTable, null);
                  await end();
                } else {
                  c2.botUI.deleteAllMarked(msg);
                  MoiZayavki(msg, c2, page, end);
                }
              }
            });
          } else if (type === "page") {
            c2.botUI.deleteAllMarked(msg);
            MoiZayavki(msg, c2, val1, end);
          }
        }
      });
    };
    moizayavki_default = MoiZayavki;
  }
});

// src/main/namne.ts
var namne_exports = {};
__export(namne_exports, {
  default: () => namne_default
});
var TX_INITIAL_MESSAGE_NO_TOOLS2, namne_default;
var init_namne = __esm({
  "src/main/namne.ts"() {
    init_authorize();
    TX_INITIAL_MESSAGE_NO_TOOLS2 = "\u0423 \u0432\u0430\u0441 \u043D\u0435\u0442 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430 \u043D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u0445.";
    namne_default = async (msg, c2, end) => {
      const user = getLocalPhone(getUserName(msg));
      const toolsOrderedByRequests = {};
      const objectsById = {};
      const toolsData = await c2.tableUI.getList(
        "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
        ["Auto #", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u041E\u0431\u044A\u0435\u043A\u0442", "\u041C\u0435\u0441\u0442\u043E\u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435", "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u0417\u0430\u044F\u0432\u043A\u0430"]
      );
      let found = false;
      for (const [i, dataUser] of toolsData["\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"].entries()) {
        if (dataUser === user && toolsData["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u0417\u0430\u044F\u0432\u043A\u0430") {
          const objectID = toolsData["\u041E\u0431\u044A\u0435\u043A\u0442"][i];
          if (toolsOrderedByRequests[objectID] === void 0) {
            toolsOrderedByRequests[objectID] = [];
            objectsById[objectID] = toolsData["\u041C\u0435\u0441\u0442\u043E\u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435"][i];
          }
          toolsOrderedByRequests[objectID].push(i);
          found = true;
        }
      }
      if (found === false) {
        await c2.botUI.message(msg, TX_INITIAL_MESSAGE_NO_TOOLS2, { mark_to_remove: true });
        return;
      }
      for (const objectID in toolsOrderedByRequests) {
        await c2.botUI.message(msg, "- - - *" + objectsById[objectID] + "* - - -", { mark_to_remove: true });
        let msgStr = "";
        for (const ind of toolsOrderedByRequests[objectID]) {
          msgStr += "*" + toolsData["\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"][ind] + "* | ";
          msgStr += toolsData["\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"][ind] + "\n";
          msgStr += "\u0421\u0442\u0430\u0442\u0443\u0441: *" + toolsData["\u0421\u0442\u0430\u0442\u0443\u0441"][ind] + "*\n";
          msgStr += "\n";
        }
        await c2.botUI.message(msg, msgStr, { mark_to_remove: true });
      }
    };
  }
});

// src/yesno.ts
var TX_BTN_YES2, TX_BTN_NO2, yesno_default;
var init_yesno = __esm({
  "src/yesno.ts"() {
    TX_BTN_YES2 = "\u0414\u0430";
    TX_BTN_NO2 = "\u041D\u0435\u0442";
    yesno_default = async (msg, c2, initialMsg, yes, no) => {
      c2.botUI.context(msg, async () => {
        const opts = {
          reply_markup: { inline_keyboard: [
            [
              {
                text: TX_BTN_YES2,
                callback_data: "yes"
              },
              {
                text: TX_BTN_NO2,
                callback_data: "no"
              }
            ]
          ] },
          mark_to_remove: true
        };
        await c2.botUI.message(msg, initialMsg, opts);
      }, {
        callback_query: async (query) => {
          if (query.data === "yes") {
            await yes();
          } else {
            await no();
          }
        }
      });
    };
  }
});

// src/main/manager.ts
var manager_exports = {};
__export(manager_exports, {
  default: () => manager_default
});
var TX_NO_ZAYAVOK2, TX_BTN_STATUS, TX_BTN_EDIT2, TX_NAVIAGTION, TX_BUTTON_BACK3, TX_SELECT_STATUS, TX_CONFIRN_CANCEL, TX_CONFIRN_OBJ, STATUS_OBRABOTKA, STATUS_SOBRAN, STATUS_DOSTAVKA, STATUS_OBJ, STATUS_SKLAD, STATUS_CANCEL, TX_EDIT_CONFIRMED2, TX_EDIT_CONFIRMED_INFO, TX_EDIT_CANCELED2, TX_EDIT_CANCELED_IMFO, TX_EDIT_STATUS, TX_EDIT_STATUS_INFO, Manager, manager_default;
var init_manager = __esm({
  "src/main/manager.ts"() {
    init_requestConverter();
    init_saveRequest();
    init_yesno();
    init_edit();
    init_notify();
    TX_NO_ZAYAVOK2 = "\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u044F\u0432\u043E\u043A";
    TX_BTN_STATUS = "C\u0442\u0430\u0442\u0443\u0441";
    TX_BTN_EDIT2 = "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C";
    TX_NAVIAGTION = "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F";
    TX_BUTTON_BACK3 = "<< \u0412\u0435\u0440\u043D\u0443\u0442\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443";
    TX_SELECT_STATUS = "\u0421\u043C\u0435\u043D\u0430 \u0441\u0442\u0430\u0442\u0443\u0441\u0430:";
    TX_CONFIRN_CANCEL = "*\u0422\u043E\u0447\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u044F\u0435\u043C?*\n\u041F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B \u0437\u0430\u044F\u0432\u043A\u0430 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u043A\u0440\u044B\u0442\u0430 \u0438 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F";
    TX_CONFIRN_OBJ = "*\u0422\u043E\u0447\u043D\u043E \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0438 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0430 \u043E\u0431\u044C\u0435\u043A\u0442\u0435?*\n\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0437\u0430\u044F\u0432\u043A\u0430 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u043A\u0440\u044B\u0442\u0430, \u0430 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u0438 \u043C\u0435\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0431\u0443\u0434\u0443 \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u044B \u043D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0435";
    STATUS_OBRABOTKA = "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430";
    STATUS_SOBRAN = "\u0421\u043E\u0431\u0440\u0430\u043D";
    STATUS_DOSTAVKA = "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430";
    STATUS_OBJ = "\u041E\u0431\u044A\u0435\u043A\u0442";
    STATUS_SKLAD = "\u0421\u043A\u043B\u0430\u0434";
    STATUS_CANCEL = "\u041E\u0442\u043C\u0435\u043D\u0430";
    TX_EDIT_CONFIRMED2 = "\u{1F48A} *\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430*. \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043C\u0430\u0441\u0442\u0435\u0440\u0443";
    TX_EDIT_CONFIRMED_INFO = "\u{1F48A} \u0422\u0432\u043E\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u0431\u044B\u043B\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u043E\u043C:";
    TX_EDIT_CANCELED2 = "\u26D4\uFE0F *\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430*. \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043C\u0430\u0441\u0442\u0435\u0440\u0443";
    TX_EDIT_CANCELED_IMFO = "\u26D4\uFE0F \u0422\u0432\u043E\u044F *\u0437\u0430\u044F\u0432\u043A\u0430 \u0431\u044B\u043B\u0430 \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430* \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u043E\u043C:";
    TX_EDIT_STATUS = "\u{1F680} *C\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u044F\u0432\u043A\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D*. \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043C\u0430\u0441\u0442\u0435\u0440\u0443";
    TX_EDIT_STATUS_INFO = "\u{1F680} C\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u044F\u0432\u043A\u0438 \u0431\u044B\u043B \u0438\u0437\u043C\u0435\u043D\u0435\u043D \u043C\u0435\u043D\u0434\u0436\u0435\u0440\u043E\u043C:";
    Manager = async (msg, c2, end, cashedData) => {
      let zayavkiTable;
      let usersTable;
      let objectsTable;
      let newCashedData;
      if (cashedData) {
        zayavkiTable = cashedData.zayavkiTable;
        usersTable = cashedData.usersTable;
        objectsTable = cashedData.objectsTable;
        newCashedData = cashedData;
      } else {
        zayavkiTable = await c2.tableUI.getList("\u0417\u0430\u044F\u0432\u043A\u0438", [
          "#",
          "\u0422\u0438\u043F",
          "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430",
          "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F",
          "\u0421\u0442\u0430\u0442\u0443\u0441",
          "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A",
          "\u041E\u0431\u044A\u0435\u043A\u0442 A",
          "\u041E\u0431\u044A\u0435\u043A\u0442 B",
          "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
          "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438",
          "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439",
          "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434.",
          "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C."
        ]);
        usersTable = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", [
          "#",
          "\u0424\u0418\u041E",
          "\u0420\u043E\u043B\u044C",
          "ChatId"
        ]);
        objectsTable = await c2.tableUI.getList("\u041E\u0431\u044A\u0435\u043A\u0442\u044B", ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"]);
        newCashedData = {
          zayavkiTable,
          usersTable,
          objectsTable
        };
      }
      const messagesIds = {};
      c2.botUI.context(msg, async () => {
        await c2.botUI.deleteAllMarked(msg);
        let found = false;
        for (const [i, phone] of zayavkiTable["C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"].entries()) {
          if (zayavkiTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u041E\u0442\u043C\u0435\u043D\u0430" && zayavkiTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u041E\u0431\u044A\u0435\u043A\u0442" && zayavkiTable["\u0421\u0442\u0430\u0442\u0443\u0441"][i] !== "\u0421\u043A\u043B\u0430\u0434") {
            found = true;
            const opts = {
              reply_markup: { inline_keyboard: [
                []
              ] },
              mark_to_remove: true
            };
            const btns = opts.reply_markup.inline_keyboard[0];
            btns.push({
              text: TX_BTN_STATUS,
              callback_data: "status_" + zayavkiTable["#"][i] + "_" + i
            });
            btns.push({
              text: TX_BTN_EDIT2,
              callback_data: "edit_" + zayavkiTable["#"][i] + "_" + i
              //_id_i //индекс
            });
            let dt = zayavkaToData(i, zayavkiTable);
            let zayavka = dataToMessage(dt, objectsTable, true, usersTable);
            const nmsg = await c2.botUI.message(msg, zayavka, opts);
            messagesIds[zayavkiTable["#"][i]] = nmsg.message_id;
          }
        }
        if (!found)
          await c2.botUI.message(msg, TX_NO_ZAYAVOK2, { mark_to_remove: true });
      }, {
        callback_query: async (query) => {
          const split2 = query.data.split("_");
          const type = split2[0];
          const id = split2[1];
          const ind = split2[2];
          if (type === "edit") {
            c2.botUI.deleteAllMarked(msg);
            c2.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable);
            await edit_default(msg, c2, async (isEdited) => {
              if (isEdited) {
                await saveRequest(msg, c2, id);
                await c2.botUI.message(msg, TX_EDIT_CONFIRMED2);
                let usersTable2 = await c2.tableUI.getList("\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438", ["#", "\u0420\u043E\u043B\u044C", "ChatId"]);
                await notify_default(msg, c2, TX_EDIT_CONFIRMED_INFO + "\n" + dataToMessage(c2.data[msg.chat.id], objectsTable), usersTable2, c2.data[msg.chat.id].user);
              } else {
                await Manager(msg, c2, end, newCashedData);
              }
            }, false, usersTable);
          } else if (type === "status") {
            c2.botUI.context(msg, async () => {
              c2.botUI.deleteAllMarked(msg);
              c2.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable);
              await c2.botUI.message(msg, dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable), { mark_to_remove: true });
              const opts = {
                reply_markup: { inline_keyboard: [] },
                mark_to_remove: true
              };
              const btns = opts.reply_markup.inline_keyboard;
              const z = c2.data[msg.chat.id];
              let obrabotka = () => {
                if (z.status !== STATUS_OBRABOTKA)
                  btns.push([{
                    text: STATUS_OBRABOTKA,
                    callback_data: STATUS_OBRABOTKA + "_" + zayavkiTable["#"][ind] + "_" + ind
                  }]);
              };
              let sobran = () => {
                if (z.delivery === "\u041D\u0435\u0442" && z.status !== STATUS_SOBRAN)
                  btns.push([{
                    text: STATUS_SOBRAN,
                    callback_data: STATUS_SOBRAN + "_" + zayavkiTable["#"][ind] + "_" + ind
                  }]);
              };
              let dostavka = () => {
                if (z.delivery === "\u0414\u0430" && z.status !== STATUS_DOSTAVKA)
                  btns.push([{
                    text: STATUS_DOSTAVKA,
                    callback_data: STATUS_DOSTAVKA + "_" + zayavkiTable["#"][ind] + "_" + ind
                  }]);
              };
              let object = () => {
                btns.push([{
                  text: STATUS_OBJ,
                  callback_data: STATUS_OBJ + "_" + zayavkiTable["#"][ind] + "_" + ind
                }]);
              };
              let sklad = () => {
                btns.push([{
                  text: STATUS_SKLAD,
                  callback_data: STATUS_SKLAD + "_" + zayavkiTable["#"][ind] + "_" + ind
                }]);
              };
              let otmena = () => {
                btns.push([{
                  text: STATUS_CANCEL,
                  callback_data: STATUS_CANCEL + "_" + zayavkiTable["#"][ind] + "_" + ind
                }]);
              };
              if (z.type === "\u0421\u043E \u0441\u043A\u043B\u0430\u0434\u0430") {
                obrabotka();
                sobran();
                dostavka();
                object();
                otmena();
              } else if (z.type === "\u0412\u043E\u0437\u0432\u0440\u0430\u0442") {
                obrabotka();
                dostavka();
                sklad();
                otmena();
              } else if (z.type === "\u041C\u0435\u0436\u0434\u0443 \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C\u0438") {
                obrabotka();
                dostavka();
                object();
                otmena();
              } else if (z.type === "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F") {
                obrabotka();
                sobran();
                dostavka();
                object();
                sklad();
                otmena();
              }
              await c2.botUI.message(msg, TX_SELECT_STATUS, opts);
              const opts2 = {
                reply_markup: { inline_keyboard: [[
                  {
                    text: TX_BUTTON_BACK3,
                    callback_data: "back"
                  }
                ]] },
                mark_to_remove: true
              };
              await c2.botUI.message(msg, TX_NAVIAGTION, opts2);
            }, {
              callback_query: async (query2) => {
                const split3 = query2.data.split("_");
                const type2 = split3[0];
                const id2 = split3[1];
                const ind2 = split3[2];
                if (type2 === "back") {
                  c2.botUI.deleteAllMarked(msg);
                  await Manager(msg, c2, end, newCashedData);
                } else if (type2 === STATUS_OBRABOTKA || type2 === STATUS_SOBRAN || type2 === STATUS_DOSTAVKA || type2 === STATUS_OBJ || type2 === STATUS_SKLAD) {
                  let save = async () => {
                    c2.botUI.deleteAllMarked(msg);
                    c2.data[msg.chat.id].status = type2;
                    await saveRequest(msg, c2, id2, true);
                    zayavkiTable["\u0421\u0442\u0430\u0442\u0443\u0441"][ind2] = type2;
                    await c2.botUI.message(msg, dataToMessage(zayavkaToData(ind2, zayavkiTable), objectsTable, true, usersTable));
                    await c2.botUI.message(msg, TX_EDIT_STATUS);
                    await notify_default(msg, c2, TX_EDIT_STATUS_INFO + "\n" + dataToMessage(c2.data[msg.chat.id], objectsTable), usersTable, c2.data[msg.chat.id].user);
                  };
                  if (type2 === STATUS_OBJ || type2 === STATUS_SKLAD) {
                    c2.botUI.deleteAllMarked(msg);
                    c2.data[msg.chat.id] = zayavkaToData(ind2, zayavkiTable);
                    await c2.botUI.message(msg, dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable), { mark_to_remove: true });
                    await yesno_default(msg, c2, TX_CONFIRN_OBJ, async () => {
                      await save();
                    }, async () => {
                      await Manager(msg, c2, end, newCashedData);
                    });
                  } else {
                    await save();
                  }
                } else if (type2 === STATUS_CANCEL) {
                  c2.botUI.deleteAllMarked(msg);
                  c2.data[msg.chat.id] = zayavkaToData(ind2, zayavkiTable);
                  await c2.botUI.message(msg, dataToMessage(c2.data[msg.chat.id], objectsTable, true, usersTable), { mark_to_remove: true });
                  await yesno_default(msg, c2, TX_CONFIRN_CANCEL, async () => {
                    c2.botUI.deleteAllMarked(msg);
                    c2.data[msg.chat.id].status = "\u041E\u0442\u043C\u0435\u043D\u0430";
                    await saveRequest(msg, c2, id2, true);
                    zayavkiTable["\u0421\u0442\u0430\u0442\u0443\u0441"][ind2] = "\u041E\u0442\u043C\u0435\u043D\u0430";
                    await c2.botUI.message(msg, dataToMessage(zayavkaToData(ind2, zayavkiTable), objectsTable, true, usersTable));
                    await c2.botUI.message(msg, TX_EDIT_CANCELED2);
                    await notify_default(msg, c2, TX_EDIT_CANCELED_IMFO + "\n" + dataToMessage(c2.data[msg.chat.id], objectsTable), usersTable, c2.data[msg.chat.id].user);
                  }, async () => {
                    c2.botUI.deleteAllMarked(msg);
                    Manager(msg, c2, end, newCashedData);
                  });
                }
              }
            });
          }
        }
      });
    };
    manager_default = Manager;
  }
});

// main.js
var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bot_ui_1 = __importDefault((init_bot_ui(), __toCommonJS(bot_ui_exports)));
var TableUI = require_table_ui();
var authorize_1 = __importDefault((init_authorize(), __toCommonJS(authorize_exports)));
var zayavka_1 = __importDefault((init_zayavka(), __toCommonJS(zayavka_exports)));
var vozvrat_1 = __importDefault((init_vozvrat(), __toCommonJS(vozvrat_exports)));
var megduobj_1 = __importDefault((init_megduobj(), __toCommonJS(megduobj_exports)));
var svobodnaya_1 = __importDefault((init_svobodnaya(), __toCommonJS(svobodnaya_exports)));
var moizayavki_1 = __importDefault((init_moizayavki(), __toCommonJS(moizayavki_exports)));
var namne_1 = __importDefault((init_namne(), __toCommonJS(namne_exports)));
var manager_1 = __importDefault((init_manager(), __toCommonJS(manager_exports)));
var TX_WELLCOME_MESSAGE = "\u041F\u0440\u0438\u0432\u0435\u0442! \u042F \u0431\u043E\u0442 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 Naptech. *\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439 \u043C\u0435\u043D\u044E /* \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0441\u043E \u043C\u043D\u043E\u0439.";
var SHEET_ID = "12LFi9eXfizondNQgE7sBqrMr78Mt6pRnz8Jbuhzv14k";
var BOTTOKEN = "6511717620:AAGImOYrSujIshw-T5qu6CdBnhaP91nSFlY";
var OPT = {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
};
var EVENTS = ["message", "callback_query", "contact"];
var TABLE_MODEL = {
  "\u041E\u0431\u044A\u0435\u043A\u0442\u044B": ["Auto #", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0421\u0442\u0430\u0442\u0443\u0441", "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"],
  "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438": ["#", "\u0424\u0418\u041E", "\u0420\u043E\u043B\u044C", "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C", "Username", "ChatId"],
  "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442": ["Auto #", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C", "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u0424\u043E\u0442\u043E", "\u041C\u0435\u0441\u0442\u043E\u043D\u0430\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435", "\u041E\u0442\u0432\u0435\u0442\u0441\u0432\u0435\u043D\u043D\u044B\u0439", "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u041E\u0431\u044A\u0435\u043A\u0442", "\u0417\u0430\u044F\u0432\u043A\u0430", "\u041C\u0435\u0441\u0442\u043E"],
  "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438": ["Auto #", "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "\u0418\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u0435", "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "\u0412\u0430\u0440\u0438\u0430\u043D\u0442", "\u0424\u043E\u0442\u043E", "\u041C\u0435\u0441\u0442\u043E"],
  "\u0417\u0430\u044F\u0432\u043A\u0438": ["#", "\u0422\u0438\u043F", "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430", "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F", "\u0421\u0442\u0430\u0442\u0443\u0441", "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A", "\u041E\u0431\u044A\u0435\u043A\u0442 A", "\u041E\u0431\u044A\u0435\u043A\u0442 B", "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u0438\u043A\u0438", "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434.", "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C."],
  "\u0416\u0443\u0440\u043D\u0430\u043B \u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442": ["\u0417\u0430\u044F\u0432\u043A\u0430", "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442", "\u0421\u0442\u0430\u0442\u0443\u0441", "\u0414\u0430\u0442\u0430 \u0438\u0437\u043C.", "\u041E\u0431\u044A\u0435\u043A\u0442", "C\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"]
};
var botUI = new bot_ui_1.default(BOTTOKEN, OPT, EVENTS);
var tableUI = new TableUI(SHEET_ID, TABLE_MODEL);
var data = {};
var c = { botUI, tableUI, data };
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
      }));
    }
  }),
  moizayavki: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c)) {
      yield (0, moizayavki_1.default)(msg, c, 1, () => {
      });
    }
  }),
  namne: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c)) {
      yield (0, namne_1.default)(msg, c, () => {
      });
    }
  }),
  vozvrat: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c)) {
      yield (0, vozvrat_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
      }));
    }
  }),
  megduobj: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c)) {
      yield (0, megduobj_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
      }));
    }
  }),
  freezayavka: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c)) {
      yield (0, svobodnaya_1.default)(msg, c, () => __awaiter(void 0, void 0, void 0, function* () {
      }));
    }
  }),
  mng: (msg) => __awaiter(void 0, void 0, void 0, function* () {
    yield c.botUI.deleteAllMarked(msg);
    if (yield (0, authorize_1.default)(msg, c, true)) {
      yield (0, manager_1.default)(msg, c, () => {
      });
    }
  })
});
//!!! Телеграм ругается если прихояд дубликаты кнопок
//!!! чистии ID добавленное при создании, а не при edit (там не важно что)
