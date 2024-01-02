// %%% Invalid Grand Acess постоянно ломает бот через время!
// import {updateToolsByStatus, updateRashodnikiByType} from './src/common/ABrequest' //test only

// Библиотеки
// const BotUI = require('./lib/bot-ui')
import {MainContext, Data} from './types/types'
import BotUI from './lib/bot-ui'
const TableUI = require('./lib/table-ui')

const process = require('node:process');
const fs = require('fs')

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

const data:Data = {}
const c:MainContext  = {botUI, tableUI, data}

// ловит все ошибки, чтобы скрипт продолжал работать
// сохраняет все оишбки в trycatch.log'
let tryCatch = async (msg:any, func:any)=>{
    try {
        await func()
    } catch (e) {
        fs.writeSync(
            process.stderr.fd,
            `Caught exception: ${e}\n`, (err:any)=>{}
        )
        fs.writeFile('trycatch.log',
            `Time: ${new Date().toString()}\n` +
            `Caught exception: ${e}\n`, { flag: 'a+' }, (err:any)=>{}
        )

        await botUI.message(msg, '*Произошла неизвестная ошибка!* Попробуй заново воспользоватся меню')
    }
}

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
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            await botUI.message(msg, TX_WELLCOME_MESSAGE)
            await Authorize(msg, c)
        })
    },

    zayavka: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            if(await Authorize(msg, c)) {           
                await Zayavka(msg, c, async ()=>{
                    // console.log(data)
                }) 
            }
        })
    },

    moizayavki: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg) 
            if(await Authorize(msg, c)){
                await MoiZayavki(msg, c, 1, ()=>{
                    // console.log('ended')
                })
            }
        })
    },

    namne: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            if(await Authorize(msg, c)){
                await NaMne(msg, c, ()=>{
                    // console.log('ended NaMne')
                })
            } 
        })
    },

    vozvrat: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            if(await Authorize(msg, c)) {           
                await Vozvrat(msg, c, async ()=>{
                    // console.log(data)
                }) 
            }
        })
    },

    megduobj: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            if(await Authorize(msg, c)) {           
                await MegduObj(msg, c, async ()=>{
                    // console.log(data)
                }) 
            }
        })
    },

    freezayavka: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await botUI.deleteAllMarked(msg)
            if(await  Authorize(msg, c)) {           
                await Svobodnaya(msg, c, async ()=>{
                    // console.log(data)
                }) 
            }
        })
    },

    mng: async (msg:any) => {
        await tryCatch(msg, async ()=>{
            await c.botUI.deleteAllMarked(msg)
            if(await Authorize(msg, c, true)){
                await Manager(msg, c, ()=>{
                    // console.log('ended')
                })
            }
        })
    },

})

// promise
// process.on('uncaughtExceptionMonitor', (err:any, origin:any) => {
    
//     // console.log('HAPPEN')
//     // console.log(err)
//     // console.log(origin)
//     // console.log('===========')
    
//     fs.writeSync(
//         process.stderr.fd,
//         `Caught exception: ${err}\n` +
//         `Exception origin: ${origin}`,
//     )

//     fs.writeFile('exception-monitor.log',
//         `Time: ${new Date().toString()}\n` +
//         `Caught exception: ${err}\n` +
//         `Exception origin: ${origin}\n`, { flag: 'a+' }, (err:any)=>{}
//     )
     
// })

// - - -

// moizayavki - Мои заявки
// zayavka - Заказать со склада
// vozvrat - Вернуть на склад
// megduobj - Переместить между объектами
// freezayavka - Заявка в свободной форме
// namne - Инструмент на мне
// mng - Заявки в работе для менеджера
