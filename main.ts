// Сервер REG
// Логин: root
// Пароль: P61kwfZ5L8mAbSAn
// 95.163.229.14

// скопировать бот на SSH
// scp /Users/inarty/Yandex.Disk.localized/My\ Projects/Naptech/Bot/bot.js root@95.163.229.14:/

// Библиотеки
import {MainContext, Data} from './types/types'
import BotUI from './lib/bot-ui'
const TableUI = require('./lib/table-ui')

// const process = require('node:process');
// const fs = require('fs')
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

//inarty. БД. Каталог (разработка бота)
// const SHEET_ID = '16Z6opmCk2VnXFHraYIqdGhOTT_MJtQwIRHe3KPhNys0' 

// k1Pro. Бот. Учет ТМЦ. Склад. НапТех
const SHEET_ID = '12LFi9eXfizondNQgE7sBqrMr78Mt6pRnz8Jbuhzv14k' 

// const BOTTOKEN = "6839163652:AAGNG9Uu9rrpwnil6WFMlw6tOLeITmxcRqI" //4321 bot
// const BOTTOKEN = "6287688949:AAFalubhPUjnzkiSBb3ESxnogmlOpqpQXgc" //1234 bot
const BOTTOKEN = "6511717620:AAGImOYrSujIshw-T5qu6CdBnhaP91nSFlY" // k1Pro

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
        'Объекты': ['Auto #', 'Название', 'Статус', 'Cотрудник'],
        'Сотрудники': ['#', 'ФИО', 'Роль', 'Должность', 'Username', 'ChatId'],
        'Инструмент': ['Auto #', 'Статус', 'Доступность', 'Наименование', 'Описание', 'Фото',  'Местонахождение', 'Ответсвенный', 'Сотрудник', 'Объект', 'Заявка', 'Место'],
        'Расходники': ['Auto #', 'Количество', 'Измерение', 'Категория' ,'Название', 'Вариант', 'Фото', 'Место'],
        'Заявки': ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'],
        'Журнал Инструмент' : ['Заявка', 'Инструмент', 'Статус', 'Дата изм.', 'Объект', 'Cотрудник']
}

let botUI = new BotUI(BOTTOKEN, OPT, EVENTS)
let tableUI = new TableUI(SHEET_ID, TABLE_MODEL)

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
        await botUI.deleteAllMarked(msg)
        await botUI.message(msg, TX_WELLCOME_MESSAGE)
        await Authorize(msg, c)
    },

    zayavka: async (msg:any) => {
        await botUI.deleteAllMarked(msg)
        if(await Authorize(msg, c)) {           
            await Zayavka(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
},

    moizayavki: async (msg:any) => {
        await botUI.deleteAllMarked(msg) 
        if(await Authorize(msg, c)){
            await MoiZayavki(msg, c, 1, ()=>{
                // console.log('ended')
            })
        }
    },

    namne: async (msg:any) => {
        await botUI.deleteAllMarked(msg)
        if(await Authorize(msg, c)){
            await NaMne(msg, c, ()=>{
                // console.log('ended NaMne')
            })
        } 
    },

    vozvrat: async (msg:any) => {
        await botUI.deleteAllMarked(msg)
        if(await Authorize(msg, c)) {           
            await Vozvrat(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    megduobj: async (msg:any) => {
        await botUI.deleteAllMarked(msg)
        if(await Authorize(msg, c)) {           
            await MegduObj(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    freezayavka: async (msg:any) => {
        await botUI.deleteAllMarked(msg)
        if(await  Authorize(msg, c)) {           
            await Svobodnaya(msg, c, async ()=>{
                // console.log(data)
            }) 
        }
    },

    mng: async (msg:any) => {
        await c.botUI.deleteAllMarked(msg)
        if(await Authorize(msg, c, true)){
            await Manager(msg, c, ()=>{
                // console.log('ended')
            })
        }
    },

})

// - - -

// moizayavki - Мои заявки
// zayavka - Заказать со склада
// vozvrat - Вернуть на склад
// megduobj - Переместить между объектами
// freezayavka - Заявка в свободной форме
// namne - Инструмент на мне
// mng - Заявки в работе для менеджера
