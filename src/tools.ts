import {MainContext, Tools} from '../types/types'
import {SearchToolsByStr, GetToolsByIds} from './common/search'

const TX_INITIAL_MESSAGE = '*Добавление инструмента*:'
const TX_SEARCH_MESSAGE = 'Для 🔎 поиска и добавления *пиши поисковый запрос в сообщении*'
const TX_INITIAL_MESSAGE_EDIT = '*Редактирование инструмента*:'
const TX_SEARCH_NORESULT = "По запросу ничего не найдено"
const TX_END_MESSAGE = "Для выхода из добавления инструмента нажмите"
const TX_BUTTON_ADD = "Добавить"
const TX_BUTTON_PHOTO = "Фото"
const TX_BUTTON_DELETE = "Удалить"
const TX_BUTTON_END = "Закончить добавление >>"
const TX_BUTTON_TOOLS_LIST = "Список инструментов"
const TX_BUTTON_EDIT_END = "Закончить редактирование >>"
const TX_FOUND_1 = 'Найдено '
const TX_FOUND_2 = ' (лимит '
const TX_FOUND_3 = ')'
const TX_TOOL = 'Инсрумент: '

const TX_END_CONFIRM_REQUEST = "Инструмент не добавлен. Оставить заявку без инструмента?"
const TX_BUTTON_CONFIRM = 'Да'
const TX_BUTTON_NOT_CONFIRM = 'Нет'
const TX_END_CONFIRMED = "Понял, *продолжаем без инструмента*"
const TX_END_NOT_CONFIRMED = "Продолжим добавление"

// ограничить вывод поиска до (шт)
const SEARCH_LIMIT = 6

export default async (msg:any, c: MainContext, editMode:Boolean, end:()=>any) => {

    const addedToolsMessages: any = {} //ассоциативный масив key->msgId (для замены на сообщения без [Delete] btn)
    const searchResultMessages: any = {}
    const cachedObject:any = {} //хранит весь поиск сессии
    let yesNoMsg: any //confirmation сообщение для удаления

    let addedTools:Tools = c.data[msg.chat.id].tools

    let showFoundedTool = async (id:String, name:String, desc:String, photoUrl:String) => {

        // console.log(name)
        // console.log(desc)
        // console.log(photoUrl)
        // console.log('- - -')

        const opts:any = {
            reply_markup: {
                inline_keyboard: [ [ { text: TX_BUTTON_ADD, callback_data: "add_" + id }]]
            },
            // mark_to_remove: true
        }

        // can be undefined!
        if(photoUrl) {
            opts.reply_markup.inline_keyboard[0].push({ text: TX_BUTTON_PHOTO, url: photoUrl})
        }

        const nmsg = await c.botUI.message(msg, `*${desc}*\n${name}`, opts)
        searchResultMessages[String(id)] = nmsg.message_id
        cachedObject[String(id)] = {name: name, desc: desc}
    }

    let showAddedTool = async (id:String, name:String, desc:String) => {
        const opts = {
            reply_markup: {
                inline_keyboard: [ [ { text: TX_BUTTON_DELETE, callback_data: "delete_" + id }] ]
            }
        }
        const nmsg = await c.botUI.message(msg, TX_TOOL + '*' + desc + '*' + 
        '\n' + name, opts)
        // добавляем с возможностью будущего удаления
        addedToolsMessages[String(id)] = nmsg.message_id 
    }

    let showEndMessage = async () => {

        const endOpts = {
            reply_markup: {
                inline_keyboard: [  
                    [ { text: TX_BUTTON_TOOLS_LIST , url: 'https://docs.google.com/spreadsheets/d/16Z6opmCk2VnXFHraYIqdGhOTT_MJtQwIRHe3KPhNys0/edit?usp=sharing' }],
                    [ { text: editMode? TX_BUTTON_EDIT_END : TX_BUTTON_END, callback_data: 'end' }]                       
                ]
            },
            mark_to_remove: true
        }

        await c.botUI.message(msg, TX_END_MESSAGE, endOpts)
    }

    let clearsearchResultMessagess = () => {
        // очистим вручную список найденных иснтсрументов, которые не были удалены при добавлении
        for (const prop in searchResultMessages) {
            c.botUI.delete(msg, searchResultMessages[prop])
            delete searchResultMessages[prop] 
        }
    }

    c.botUI.context(msg, async ()=>{

        if(!editMode) { // S.Первичное добавление
            
            await c.botUI.message(msg, TX_INITIAL_MESSAGE, {mark_to_remove: true})
            await showEndMessage() 
            await c.botUI.message(msg, TX_SEARCH_MESSAGE, {mark_to_remove: true})
            
        } else { // S.Редактирование списка 

            await c.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT)
            await c.botUI.message(msg, TX_SEARCH_MESSAGE, {mark_to_remove: true})

            let tools = await GetToolsByIds(c, c.data[msg.chat.id].tools? c.data[msg.chat.id].tools:{})
            // Вывод предыдущего списка.
            for(const o of tools) {
                await showAddedTool(o.id, o.name, o.desc)
                cachedObject[String(o.id)] = {name: o.name, desc: o.desc}
            } 

            await showEndMessage()

        }

    },{ 
        message:
        async (msg:any)=>{

            // S.Результаты поиска

            // очистим предыдущий список сообщений            
            c.botUI.deleteAllMarked(msg)
            await clearsearchResultMessagess()
            
            // messagesToRemove = [msg.message_id]
            c.botUI.markToDelete(msg, msg.message_id) //добавляем для будущего удалению сообщение пользователя

            const searchRes = await SearchToolsByStr(c, msg.text)

            if (searchRes.length) {
                
                let cur_i = 0
                for (let i = 0; i < searchRes.length; i++) {
                    
                    const o = searchRes[i]

                    // показываем только те, которые не добавлены
                    if (cur_i < SEARCH_LIMIT)
                        if (addedTools && !addedTools[String(o.id)]) {
                            await showFoundedTool(o.id, o.name, o.desc, o.url)
                            cur_i ++
                        }
                    
                }

                await c.botUI.message(msg, TX_FOUND_1 + cur_i + TX_FOUND_2 + SEARCH_LIMIT + TX_FOUND_3, {mark_to_remove: true})

            } else {
                await c.botUI.message(msg, TX_SEARCH_NORESULT, { mark_to_remove: true })
            }

            await showEndMessage()
        },

        callback_query:
        async (query:any)=>{
        
            if(query.data === 'end') { // Нажато закончить 
                if (Object.keys(addedTools).length === 0) { // Подтверждение   
                    const opts = {
                        reply_markup: {
                            inline_keyboard: [ [ { text: TX_BUTTON_CONFIRM, callback_data: 'end-confirmed'},
                                                 { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'end-not-confirmed' }] ]
                        },
                        mark_to_remove: true
                    }
                    yesNoMsg = await c.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts)
 
                } else { //  S.S Закончить

                    c.data[msg.chat.id].tools = addedTools
                    c.botUI.deleteAllMarked(msg)
                    await clearsearchResultMessagess()

                    // заменяем все добавленные на сообщения без кнопки
                    for (const id in addedToolsMessages) {
                        c.botUI.delete(msg, addedToolsMessages[id])
                        await c.botUI.message(msg, TX_TOOL + '*' + cachedObject[id].desc + '*' + 
                        '\n' + cachedObject[id].name)
                    }

                    await end()
                }
                
            // S. нажата кнопка подтверждения выхода без инструмента
            } else if(query.data === 'end-confirmed') {
                c.data[msg.chat.id].tools = addedTools
                await c.botUI.message(msg, TX_END_CONFIRMED)
                c.botUI.deleteAllMarked(msg)
                await clearsearchResultMessagess()
                await end()
            
            // S. продолжаем добавление инструмента
            } else if(query.data === 'end-not-confirmed') { 
                // удалить сообщение и продолжить
                c.botUI.delete(msg, yesNoMsg.message_id)
                await c.botUI.message(msg, TX_END_NOT_CONFIRMED, {mark_to_remove: true})
            } else { //S. Пришел ID

                // "add_23"
                // "delete_23
                const type = query.data.split('_')[0]
                const id = query.data.split('_')[1]

                if(type === 'add') { // S.S Пришел add_ID

                    // if(addedTools.includes(id)) {
                    //     await c.botUI.message(msg, cachedObject[id].name + TX_EXISTS_2, {mark_to_remove: true})
                    // } else {
                        await showAddedTool(id, cachedObject[id].name, cachedObject[id].desc)
                        addedTools[id] = cachedObject[id].desc + ' (' + cachedObject[id].name + ')'

                        await c.botUI.delete(msg, searchResultMessages[id])
                        delete searchResultMessages[id] 
                    // }  
                    
                } else { // S.S Пришел delete_ID

                    c.botUI.delete(msg, addedToolsMessages[id])
                    delete addedToolsMessages[id]

                    if (addedTools[id]) {
                       delete addedTools[id]
                    }

                }
            }  
        }
    })

}