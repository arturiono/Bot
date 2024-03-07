
import { MainContext} from '../../types/types'
import {getLocalPhone, getUserName} from '../authorize'
import {zayavkaToData, dataToMessage} from '../common/requestConverter'
import {saveRequest} from '../common/saveRequest'
import Edit from '../edit'

import Notify from '../common/notify'
// import { ABReqest } from '../../types/types';

const TX_NOTIFY_UPDATE = "💊 Заявка была обновлена:"
const TX_NOTIFY_CANCELED ="⛔️ Заявка была отменена:"

const TX_NO_ZAYAVOK = 'У тебя еще нет созданный заявок'
const TX_MY_ZAYAVKI = "Заявки"
const TX_PAGE = "страница"
const TX_BTN_CANCEL = "Отменить"
const TX_BTN_EDIT = "Редактировать"

const TX_CONFIRN = "Точно отменяем заявку?"
const TX_BTN_YES = "Да"
const TX_BTN_NO = "Нет"

const COUNT_PER_PAGE = 3
const TX_BTN_NEXT_PAGE = "Страница"
const TX_BTN_PREV_PAGE = "Страница"

const TX_NEXT_MESSAGE = "Прошлые заявки"
const TX_PREV_MESSAGE = "Более новые"

const TX_EDIT_CONFIRMED = "✅ *Заявка обновлена*. Отправил информацию менеджеру";
const TX_EDIT_CANCELED = "⛔️ *Заявка отменена*. Отправил информацию менеджеру";

// const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:'
// page = 1,2,3 ...

const MoiZayavki = async (msg:any, c: MainContext, page: number, end:()=>any, newZayavkiData?:any) => {

    const objectsTable = await c.tableUI.getList('Объекты', ['Auto #', 'Название'])

    // кэшируемые данные
    let zayavkiData: any

    if(newZayavkiData)
        zayavkiData = newZayavkiData
    else 
        zayavkiData = await c.tableUI.getList('Заявки', 
        ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 
        'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'])
  

    // реверс порядок для массива
    for(const key in zayavkiData) {
        zayavkiData[key] = zayavkiData[key].reverse()
    }

    // console.log(zayavkiData)
    const messagesIds:any = {}

    const showNavigationButton = async (type:'next' | 'prev', page: number, totalItems: number)=>{

        const newPage:number = type === 'next'? Number(page)+1 : Number(page)-1
        const a = totalItems-1
        const b = COUNT_PER_PAGE
        const totalPages = (a+b-a%b)/b

        // console.log(totalPages)
        // console.log('новая сраница: ' + newPage)
        // console.log('всего страниц: ' + totalPages)

        if(newPage<1) return
        if(newPage>totalPages) return

        const opts = {
            reply_markup: { inline_keyboard: [ 
                [ { 
                    text: type === 'next'? 
                        TX_BTN_NEXT_PAGE + " " + newPage + " >>": 
                        "<< "+TX_BTN_PREV_PAGE + " " + newPage,
                    callback_data: 'page_' + newPage //id zayavki
                }] 
            ]},
            mark_to_remove: true
        }

        await c.botUI.message(msg, type === 'next'? TX_NEXT_MESSAGE : TX_PREV_MESSAGE, opts)
 
    }

    c.botUI.context(msg, async ()=>{

        const user = getLocalPhone(getUserName(msg)) 
        // console.log(Array.from(zayavkiData['Cотрудник'].entries()))
        // console.log(zayavkiData['Cотрудник'])
        // console.log(String(user))

        if (zayavkiData['Cотрудник'].indexOf(String(user)) === -1) {
            await c.botUI.message(msg, TX_NO_ZAYAVOK, {mark_to_remove: true})
            return
        }
        
        await c.botUI.message(msg, TX_MY_ZAYAVKI + " (" + TX_PAGE  + " " + page + ")", {mark_to_remove: true})
        // await c.botUI.
         
        await showNavigationButton('prev', page, zayavkiData['#'].length)

        // показываем все заявки, где сотрудник = этот сотрудник
        for (const [i, phone] of zayavkiData['Cотрудник'].entries()) {
            
            // const ii = zayavkiData['Cотрудник'].length - 1 - i
            // console.log(ii)
            //  если совпадает телефон и статус не Отменен

            const b = COUNT_PER_PAGE
            if(i<(page-1) * b) continue
            if(i>=page * b ) continue

            if( phone === user 
                && zayavkiData['Статус'][i] !== 'Отмена'
                && zayavkiData['Статус'][i] !== 'Объект'
                && zayavkiData['Статус'][i] !== 'Склад'
            ) {
                const opts = {
                    reply_markup: { inline_keyboard: [[]]},
                    mark_to_remove: true
                }
                const btns:any = opts.reply_markup.inline_keyboard[0]

                // редактирование доступно только в обработке
                if(zayavkiData['Статус'][i] === 'Обработка')
                    btns.push({ 
                        text: TX_BTN_EDIT, 
                        callback_data: 'edit' + '_' + zayavkiData['#'][i] + '_' + i, //_id_i //индекс
                    })

                btns.push({ 
                    text: TX_BTN_CANCEL, 
                    callback_data: 'cancel' + '_' + zayavkiData['#'][i] + '_' + i,
                })

                const nmsg = await c.botUI.message(msg, dataToMessage(zayavkaToData(i, zayavkiData), objectsTable), opts)
                messagesIds[zayavkiData['#'][i]] = nmsg.message_id
            } else {
                await c.botUI.message(msg, dataToMessage(zayavkaToData(i, zayavkiData), objectsTable), {mark_to_remove: true})
            }

        }

        await showNavigationButton('next', page, zayavkiData['#'].length)
        
    },{ 
        callback_query:
        async (query:any)=>{
            const split = query.data.split('_')
            const type = split[0]
            const val1 = split[1] //id 
            const val2 = split[2] //ind

            if(type === 'edit') {

                c.botUI.deleteAllMarked(msg)
                // заполняем данным c.data - временную контекстную модель заявки, val2 - index
                c.data[msg.chat.id] = zayavkaToData(val2, zayavkiData)

                Edit(msg, c, async (isEdited:Boolean)=>{
                    if(isEdited) {
                        // console.log('SAVE')
                        await saveRequest(msg, c, val1)
                        await c.botUI.message(msg, TX_EDIT_CONFIRMED)
                        // уведомляем менеджера
                        const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])
                        await Notify(msg, c, TX_NOTIFY_UPDATE + '\n' 
                            + dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), usersTable, null) 
                        await end()
                    } else {
                        MoiZayavki(msg, c, page, end, newZayavkiData) 
                    }
                }, false) // запускаем сценарий confirmation сразу с редактирования


            } else if(type === 'cancel') {
                
                c.botUI.context(msg, async ()=>{

                    c.botUI.deleteAllMarked(msg)
                    c.data[msg.chat.id] = zayavkaToData(val2, zayavkiData)
                    await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], objectsTable), {mark_to_remove: true})

                    const opts = {
                        reply_markup: { inline_keyboard: [ 
                            [ { 
                                text: TX_BTN_YES, 
                                callback_data: 'yes_' + val1 + '_' + val2, 
                            } ,
                            { 
                                text: TX_BTN_NO, 
                                callback_data: 'no', 
                            } ] 
                        ]},
                        mark_to_remove: true
                    }
    
                    await c.botUI.message(msg, TX_CONFIRN, opts)

                },{ 
                    callback_query:
                    async (query:any)=>{    
                        
                        const split = query.data.split('_')
                        const type = split[0]
                        const id = split[1]
                        const ind = split[2]
                        
                        if(type === 'yes') {

                            c.botUI.deleteAllMarked(msg)
                            
                            c.data[msg.chat.id].status = 'Отмена'
                            await saveRequest(msg, c, id, true) //save only status

                            zayavkiData['Статус'][ind] = 'Отмена'
                            await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiData), objectsTable))
                            await c.botUI.message(msg, TX_EDIT_CANCELED)

                            const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])
                            await Notify(msg, c, TX_NOTIFY_CANCELED + '\n' 
                                + dataToMessage(c.data[msg.chat.id], objectsTable), usersTable, null) //пишем менджеру

                            await end()

                        } else {
                            c.botUI.deleteAllMarked(msg)
                            MoiZayavki(msg, c, page, end)
                        }                     
                    }
                })

                
                // %%% отменяем заявку и удаляем ее из списка сообщений
                
            } else if(type === 'page') { 
                
                c.botUI.deleteAllMarked(msg)
                MoiZayavki(msg, c, val1, end)
            }
        }
    })
}

export default MoiZayavki