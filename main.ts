// %%% Invalid Grand Acess постоянно ломает бот через время!
// import {updateToolsByStatus, updateRashodnikiByType} from './src/common/ABrequest' //test only

// Библиотеки
// const BotUI = require('./lib/bot-ui')
import {MainContext, Data} from './types/types'
import BotUI from './lib/bot-ui'
const TableUI = require('./lib/table-ui')

// import Zayavka from './src/zayavkaView'

// Сценарии 
import Authorize from './src/authorize'
import Zayavka from './src/main/zayavka'
import Vozvrat from './src/main/vozvrat'
import MegduObj from './src/main/megduobj'
import Svobodnaya from './src/main/svobodnaya'
import MoiZayavki from './src/main/moizayavki'
import NaMne from './src/main/namne'
import Manager from './src/main/manager'

const TX_WELLCOME_MESSAGE = "Привет! Я бот компании Naptech. *Используй меню /* для работы со мной."

// Типы
import { ABReqest } from './types/types';
import { saveRequest } from './src/common/saveRequest'
import vozvrat from './src/main/vozvrat'

const SHEET_ID = '16Z6opmCk2VnXFHraYIqdGhOTT_MJtQwIRHe3KPhNys0'
const BOTTOKEN = "6287688949:AAFalubhPUjnzkiSBb3ESxnogmlOpqpQXgc"
const OPT = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
}
const EVENTS = ['message', 'callback_query', 'contact']
const TABLE_MODEL =  { 
        'Обьекты': ['Auto #', 'Название', 'Статус', 'Cотрудник'],
        'Сотрудники': ['#', 'ФИО', 'Роль', 'Должность', 'Username', 'ChatId'],
        'Инструмент': ['Auto #', 'Статус', 'Доступность', 'Наименование', 'Описание', 'Фото',  'Местонахождение', 'Ответсвенный', 'Сотрудник', 'Объект', 'Заявка', 'Место'],
        'Расходники': ['Auto #', 'Количество', 'Измерение', 'Категория' ,'Название', 'Вариант', 'Фото', 'Место'],
        'Заявки': ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'],
        'Журнал Инструмент' : ['Заявка', 'Инструмент', 'Статус', 'Дата изм.', 'Объект', 'Cотрудник']
}

let botUI = new BotUI(BOTTOKEN, OPT, EVENTS)
let tableUI = new TableUI(SHEET_ID, TABLE_MODEL)

// TESTS
// tableUI.updateRow('Сотрудники', 2, {'Username': 'vasya', 'ChatId': '1256758'})

const data:Data = {}
const c:MainContext  = {botUI, tableUI, data}

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

    start: async (msg: any) => {

        botUI.deleteAllMarked(msg)
        botUI.message(msg, TX_WELLCOME_MESSAGE)
        Authorize(msg, c)

        // const data:ABReqest = {}
        // const c = {botUI, tableUI, data}
        // updateToolsByStatus(c, 'Отмена', '16')
        // updateRashodnikiByType(c, 'Отмена', '18')
             
    },

    zayavka: async (msg:any) => {
 
        botUI.deleteAllMarked(msg)
        if(Authorize(msg, c)) {           
            Zayavka(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    moizayavki: async (msg:any) => {
        
        botUI.deleteAllMarked(msg) 
        if(Authorize(msg, c)){
            MoiZayavki(msg, c, 1, ()=>{
                // console.log('ended')
            }, true)
        }
    },

    namne: async (msg:any) => {

        botUI.deleteAllMarked(msg)
        if(Authorize(msg, c)){
            NaMne(msg, c, ()=>{
                // console.log('ended NaMne')
            })
        }
    },

    vozvrat: async (msg:any) => {

        botUI.deleteAllMarked(msg)
        if(Authorize(msg, c)) {           
            Vozvrat(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    megduobj: async (msg:any) => {

        botUI.deleteAllMarked(msg)
        if(Authorize(msg, c)) {           
            MegduObj(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    freezayavka: async (msg:any) => {

        botUI.deleteAllMarked(msg)
        if(Authorize(msg, c)) {           
            Svobodnaya(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    mng: async (msg:any) => {

        c.botUI.deleteAllMarked(msg)
        if(Authorize(msg, c, true)){
            Manager(msg, c, ()=>{
                // console.log('ended')
            }, true)
        }
    },

})

// async function run() {
//     let obj = await tableUI.getList('Обьекты',['#', 'Название'])
//     console.log(obj)
// }
// run()

// - - -

// moizayavki - Мои заявки
// zayavka - Заказать со склада
// vozvrat - Вернуть на склад
// megduobj - Переместить между объектами
// freezayavka - Заявка в свободной форме
// namne - Инструмент на мне
// mng - Заявки в работе для менеджера
