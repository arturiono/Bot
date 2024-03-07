import { MainContext} from '../types/types'
import { getLocalPhone, getUserName } from './authorize'

import NextId from './common/next-id'

const TX_INITIAL_MESSAGE_TO = '*На какой объект перемещаем?*'
const TX_BTN_SELECT = 'Выбрать'
const TX_BTN_CUSTOM = 'Указать другой'
const TX_CUSTOM_QUESTION = '*Нет в списке?*'
const TX_SELECTED_RES_FIRST = '*Выбран объект*: '
const TX_SELECTED_RES_EDIT = '*Заменен объект*: '
const TX_CUSTOM_ENTER = '⌨️ Введите *название или адрес объекта*:'
const TX_CUSTOM_FINAL = 'Хорошо. Записал'

const TX_BTN_DELETE = 'Удалить'
const TX_CANT_DELETE = "Невозможно удалить. На этом объекте остался интрумент."

// Сценарий выбора объекта назначения
export default async (msg:any, c: MainContext, editMode:Boolean, end:()=>any) => {

    //ассоциативный масив для кэшироания сообщений, чтобы потом удалить при удвлении
    const messagesIds:any = {}

    const objTable = await c.tableUI.getList('Объекты',['Auto #', 'Название', 'Статус', 'Cотрудник'])
    const currentUser = getLocalPhone(getUserName(msg))

    c.botUI.context(msg, async ()=>{

        await c.botUI.message(msg, TX_INITIAL_MESSAGE_TO, {mark_to_remove: true})

        // сценирий получения всех объектов для отправки на объект
        let i = 0
        for (const el of objTable['Название']) {
            //склад не может быть активный
            if (objTable['Статус'][i] === 'Активный'           
                || (objTable['Статус'][i] === 'Добавил мастер' && objTable['Cотрудник'][i] === currentUser)
                ) {  

                const opts = { 
                    reply_markup: { inline_keyboard: [[]]},
                    mark_to_remove: true
                }
                const btns:any = opts.reply_markup.inline_keyboard[0]
                btns.push({ 
                    text: TX_BTN_SELECT, 
                    callback_data: 'select_' + i
                })

                if(objTable['Статус'][i] === 'Добавил мастер') {
                    btns.push({ 
                        text: TX_BTN_DELETE, 
                        callback_data: 'delete_' + i
                    })
                }

                const nmsg = await c.botUI.message(msg, objTable['Название'][i], opts)
                messagesIds[String(i)] = nmsg.message_id

            }
            i++
        }

        // for (const el of objects) {
        //     cachedObject[String(el.id)] = el.name
        //     const opts = { 
        //         reply_markup: 
        //         { inline_keyboard: [ 
        //         [{ 
        //             text: TX_BTN_SELECT, 
        //             callback_data: el.id
        //         }]]},
        //         mark_to_remove: true
        //     }
        //     await c.botUI.message(msg, el.name, opts)

        // }

        const opts = { 
            reply_markup: { inline_keyboard: [ 
            [ { 
                text: TX_BTN_CUSTOM, 
                callback_data: 'null',
            }]]},
            mark_to_remove: true
        }

        await c.botUI.message(msg, TX_CUSTOM_QUESTION, opts)

    },{ 
    
        callback_query:
        async (query:any)=>{

            const split = query.data.split('_')
            let type = split[0]
            let ind = Number(split[1])


            if(type === 'select') {
                const TX = editMode? TX_SELECTED_RES_EDIT : TX_SELECTED_RES_FIRST

                const name = objTable['Название'][ind]
                await c.botUI.message(msg, TX + name)
                
                c.data[msg.chat.id].to = objTable['Auto #'][ind]

                c.botUI.deleteAllMarked(msg)
                await end() //все данные сохранены, сценарий закончен
            
            } else if(type === 'delete') {
                
                const toolsData = await c.tableUI.getList('Инструмент', ['Объект'])
                const indx = toolsData['Объект'].indexOf(String(ind))

                // если нет ни одного инструмента на этом объекты
                if(indx === -1) {
                    
                    // console.log(ind)

                    // 1. Меняем статус на "Удалил мастер"
                    c.tableUI.updateRow(
                        'Объекты', 
                        ind+2, // %%% всегда добавлять 2!!!
                        { 'Статус':  'Удалил мастер' } 
                    ) 

                    // 2. Удвляем сообщение
                    c.botUI.delete(msg, messagesIds[ind])

                } else {
                    await c.botUI.message(msg, TX_CANT_DELETE, {mark_to_remove: true})
                }

            
            } else if(type === 'null') { //ввод новго адреса не из ссписка

                c.botUI.context(msg, async ()=>{
                    await c.botUI.message(msg, TX_CUSTOM_ENTER)
                },{ 
                    message: 
                    async (msg:any)=>{

                        const nextId = NextId(objTable['Auto #'])
                        const obj = [{
                            'Auto #': nextId,
                            'Название': msg.text,
                            'Статус': 'Добавил мастер',
                            'Cотрудник': getLocalPhone(msg.chat.username)
                        }]
                         
                        await c.tableUI.insertRows('Объекты', obj)
                        c.data[msg.chat.id].to = String(nextId)
                        
                        await c.botUI.message(msg, TX_CUSTOM_FINAL)
                        c.botUI.deleteAllMarked(msg)   
                        await end()
                    }
                })

            }

        }
    })
}