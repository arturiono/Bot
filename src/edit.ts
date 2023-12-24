import { MainContext, RequestType } from '../types/types'

import Tools from './tools'
import Rashodniki from './rashodniki'
import Comment from './comment'
import DateTime from './dateTime'
import Dostavka from './dostavka'
import Object from './toObject'
import FromObjectTools from './fromObjectTools'

import {dataToMessage} from './common/requestConverter'

const TX_INTIAL_MESSAGE = "Что нужно редактировать?"

// %%% перенеси сообщение про редактирование внутрь модуля  
// const TX_ADD_OBJECT_FROM = "*Изменение* объекта отправления:"
const TX_OBJECT_TO = "*Изменение* объекта назначения:"
const TX_DOSTAVKA = "*Изменение* типа доставки:"
const TX_TIME = "*Изменение* времени:"
// const TX_ADD_INSTRUMENT = "*Редактирование* списка инструмента:"
const TX_ADD_COMMENT = "*Изменение* комментария:"

const TX_BUTTON_FROM_OBJECT = "С объекта"
const TX_BUTTON_FROM_OBJECT_TOOLS = "Инструмент"
const TX_BUTTON_OBJECT_TO = "На объект"
const TX_BUTTON_DOSTAVKA = "Доставка"
const TX_BUTTON_TIME = "Дата и время"
const TX_BUTTON_INSTRUMENT = "Инсрумент"
const TX_BUTTON_RASHODNIKI = "Расходные материалы"
const TX_BUTTON_COMMENT = "Комментарий"

const TX_NAVIGATION = "Сохранение"
const TX_SAVE = "Подтвердить"
const TX_BUTTON_BACK = "Вернуться"
const TX_BUTTON_SAVE = "Сохранить"

// предлагаем пользователю вернутся в сценарии редактирования

const Edit = async (msg:any, c: MainContext, end:(wasEdited:Boolean)=>any, editingHappen:Boolean, usersTable?:any ) => {

    let nmsg:any
    let showZayavka = async ()=> {
        const showName = usersTable? true : false
        nmsg = await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], showName, usersTable), 
        {mark_to_remove: true} )
    }
    
    c.botUI.context(msg, async ()=>{

        c.botUI.deleteAllMarked(msg)
        await showZayavka()

        const optsC = {
            reply_markup: {
                inline_keyboard: [
                        [{ text: editingHappen? TX_BUTTON_SAVE : TX_BUTTON_BACK, 
                           callback_data: editingHappen? 'backAndEdit':'back' }]
                    ]
            },

            mark_to_remove: true
        }

        const opts = {
            reply_markup: {
                inline_keyboard: [[], [], []]
            },
            mark_to_remove: true 
        }

        const line1:any = opts.reply_markup.inline_keyboard[0]
        const line2:any = opts.reply_markup.inline_keyboard[1]
        const line3:any = opts.reply_markup.inline_keyboard[2]

        // логика для редактирования объекотв назначения / отправления
        // !!! конечный автомат, лучше параметризации (всегда!)
        // + контролиоуемо!
        // + поняттно!
        // + машстабируемо
        // - многа букав
        if(c.data[msg.chat.id].type === 'Со склада') {

            line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: 'object_to' })
            line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' })
            line1.push({ text: TX_BUTTON_TIME, callback_data: 'time' })
            line2.push({ text: TX_BUTTON_INSTRUMENT, callback_data: 'tools' })
            line2.push({ text: TX_BUTTON_RASHODNIKI, callback_data: 'rashodnniki' })
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' })
    
        } else if (c.data[msg.chat.id].type === 'Возврат') {

            line1.push({ text: TX_BUTTON_FROM_OBJECT, callback_data: 'from_object' })
            line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: 'from_object_tools' })
            line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' })
            line2.push({ text: TX_BUTTON_TIME, callback_data: 'time' })
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' })

        } else if (c.data[msg.chat.id].type === 'Между объектами') {

            line1.push({ text: TX_BUTTON_FROM_OBJECT_TOOLS, callback_data: 'from_object_tools' })
            line1.push({ text: TX_BUTTON_OBJECT_TO, callback_data: 'object_to' })
            line2.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' })
            line2.push({ text: TX_BUTTON_TIME, callback_data: 'time' })
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' })

        } else if (c.data[msg.chat.id].type === 'Свободная') {

            line1.push({ text: TX_BUTTON_DOSTAVKA, callback_data: 'dostavka' })
            line1.push({ text: TX_BUTTON_TIME, callback_data: 'time' })
            line3.push({ text: TX_BUTTON_COMMENT, callback_data: 'comment' })
            
        }

        await c.botUI.message(msg, TX_INTIAL_MESSAGE, opts)
        await c.botUI.message(msg, editingHappen? TX_SAVE : TX_NAVIGATION, optsC)
    
    },{ 
        callback_query:
        async (query:any)=>{
            
            c.botUI.deleteAllMarked(msg)
            await showZayavka()

            if(query.data === 'tools') {
                await Tools(msg, c, true, async ()=>{
                    // end(true)
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'rashodnniki') {
                await Rashodniki(msg, c, true, true, async ()=>{
                    // end(true)
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'comment') {
                await c.botUI.message(msg, TX_ADD_COMMENT) //%%% move inside module
                await Comment(msg, c, true, async ()=>{
                    // end(true)
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'time') { 
                await c.botUI.message(msg, TX_TIME) //%%% move inside module
                await DateTime(msg, c, true, async ()=>{
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'dostavka') {
                await c.botUI.message(msg, TX_DOSTAVKA) //%%% move inside module
                await Dostavka(msg, c, true, async ()=>{
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'object_tools') {
                await c.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS)
                await FromObjectTools(msg, c, false, async ()=>{ //в самое начало выбора объекта
                    await Edit(msg, c, end, true)
                })    
            } else if(query.data === 'from_object_tools') {
                await c.botUI.message(msg, TX_BUTTON_FROM_OBJECT_TOOLS)
                await FromObjectTools(msg, c, true, async()=>{ //сразу редактируем инсрумент (объект уже выбран)
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'object_to') {
                await c.botUI.message(msg, TX_OBJECT_TO) //%%% move inside module
                await Object(msg, c, true, async ()=>{
                    // end(true)
                    await Edit(msg, c, end, true)
                })
            } else if(query.data === 'back') {
                c.botUI.deleteAllMarked(msg)
                await end(false) 
            } else if(query.data === 'backAndEdit') {
                if(nmsg) c.botUI.deleteFromMarked(msg, nmsg.message_id) //оставляем последнее сообщение нв ленте
                await end(true)
            }
            
        }
    })

}

export default Edit

// const opts = {
//     reply_markup: {
//         inline_keyboard: [[{ text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' },
//                 { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' }]]
//     }
// };
// yield c.botUI.message(msg, 'Проверь пожалуйста, все ли верно?', { mark_to_remove: true });

// callback_query: (query) => __awaiter(void 0, void 0, void 0, function* () {
//     if (query.data === 'confirmed') {
//         yield c.botUI.message(msg, TX_REQEST_CONFIRMED);
//         c.botUI.deleteAllMarked(msg);
//         end();
//     }
//     else {
//         c.botUI.context(msg, () => __awaiter(void 0, void 0, void 0, function* () {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[
//                             { text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                             { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
//                         ]]
//                 }
//             };
//         }), {});
//     }
// })