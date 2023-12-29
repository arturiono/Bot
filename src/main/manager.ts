
import {MainContext} from '../../types/types'
import {zayavkaToData, dataToMessage} from '../common/requestConverter'
import {saveRequest} from '../common/saveRequest'
import YesNo from '../yesno' 

// import Confirm from '../confirm'
import Edit from '../edit'

import Notify from '../common/notify'
// import { ABReqest } from '../../types/types';

const TX_NO_ZAYAVOK = 'Нет активных заявок'
// const TX_MY_ZAYAVKI = "Заявки"
// const TX_PAGE = "страница"
const TX_BTN_STATUS = "Cтатус"
const TX_BTN_EDIT = "Редактировать"

const TX_NAVIAGTION = 'Навигация'
const TX_BUTTON_BACK = '<< Вернутся к списку'
const TX_SELECT_STATUS = "Смена статуса:"

const TX_CONFIRN_CANCEL = "*Точно отменяем?*\nПосле отмены заявка будет закрыта и недоступна для редактирования"
const TX_CONFIRN_OBJ = "*Точно инструмент и материал на обьекте?*\nПосле подтверждение заявка будет закрыта, а инструменты и метериалы буду зафиксированы на объекте"
// const TX_BTN_YES = "Да"
// const TX_BTN_NO = "Нет"

const STATUS_OBRABOTKA = "Обработка"
const STATUS_SOBRAN = "Собран"
const STATUS_DOSTAVKA = "Доставка"
const STATUS_OBJ = "Объект"
const STATUS_SKLAD = "Склад"
const STATUS_CANCEL = "Отмена"

const TX_EDIT_CONFIRMED = "💊 *Заявка обновлена*. Отправил информацию мастеру";
const TX_EDIT_CONFIRMED_INFO = "💊 Твоя заявка была обновлена менджером:";
const TX_EDIT_CANCELED = "⛔️ *Заявка отменена*. Отправил информацию мастеру";
const TX_EDIT_CANCELED_IMFO = "⛔️ Твоя *заявка была отменена* менджером:";
const TX_EDIT_STATUS = "🚀 *Cтатус заявки изменен*. Отправил информацию мастеру";
const TX_EDIT_STATUS_INFO = "🚀 Cтатус заявки был изменен менджером:";

// Задачи
// 1. Показать все авткальные заявки
// 1.a Знать кто создал заявку

// const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:'
// page = 1,2,3 ...


interface cashedData {
    zayavkiTable: any
    usersTable: any
    objectsTable: any
}

const Manager = async (msg:any, c: MainContext, end:()=>any, cashedData?:cashedData ) => {

    let zayavkiTable: any
    let usersTable: any 
    let objectsTable: any
    let newCashedData: cashedData

    if(cashedData) {

        zayavkiTable = cashedData.zayavkiTable
        usersTable = cashedData.usersTable
        objectsTable = cashedData.objectsTable

        newCashedData = cashedData

    } else {

        zayavkiTable = await c.tableUI.getList('Заявки', [
            '#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 
            'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'
        ])
        
        usersTable = await c.tableUI.getList('Сотрудники', [
            '#', 'ФИО', 'Роль', 'ChatId'
        ])

        objectsTable = await c.tableUI.getList('Обьекты', ['Auto #', 'Название'])

        newCashedData = {
            zayavkiTable,
            usersTable,
            objectsTable
        }

    }

    
    // // реверс порядок для массива
    // for(const key in zayavkiTable) {
    //     zayavkiTable[key] = zayavkiTable[key].reverse()
    // }

    // console.log(zayavkiTable)
    const messagesIds:any = {}

    c.botUI.context(msg, async ()=>{

        await c.botUI.deleteAllMarked(msg)

        let found = false
        for (const [i, phone] of zayavkiTable['Cотрудник'].entries()) {
            
            // только актуальные заявки показываем
            if( zayavkiTable['Статус'][i] !== 'Отмена'
                && zayavkiTable['Статус'][i] !== 'Объект'
                && zayavkiTable['Статус'][i] !== 'Склад'
            ) {
                found = true
                const opts = {
                    reply_markup: { inline_keyboard: [ 
                        []
                    ]},
                    mark_to_remove: true
                }
                const btns:any = opts.reply_markup.inline_keyboard[0]
                
                // 'Отменить', 'Редактировать'
                btns.push({ 
                    text: TX_BTN_STATUS, 
                    callback_data: 'status' + '_' + zayavkiTable['#'][i] + '_' + i,
                })

                btns.push ({
                    text: TX_BTN_EDIT, 
                    callback_data: 'edit' + '_' + zayavkiTable['#'][i] + '_' + i,  //_id_i //индекс
                })
     
                let dt:any = zayavkaToData(i, zayavkiTable)
                let zayavka = dataToMessage(dt, objectsTable, true, usersTable)

                const nmsg = await c.botUI.message(msg, zayavka , opts)
                messagesIds[zayavkiTable['#'][i]] = nmsg.message_id
            } 

        }

        if(!found) await c.botUI.message(msg, TX_NO_ZAYAVOK, {mark_to_remove: true})
        
    },{ 
        callback_query:
        async (query:any)=>{
            const split = query.data.split('_')
            const type = split[0]
            const id = split[1] //id 
            const ind = split[2] //ind

            if(type === 'edit') {

                c.botUI.deleteAllMarked(msg)

                // заполняем данным c.data - временную контекстную модель заявки
                c.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable)
                
                // %%% ВМЕСТО Confirm startFromEdit пишем нормальтную логику вместо Confirm
                // %%% тоже самое для moizayavki
                // Cofirm2
                // - вернутся
                // - 

                await Edit(msg, c, async (isEdited:Boolean)=>{

                    if(isEdited) {
                        await saveRequest(msg, c, id)
                        await c.botUI.message(msg, TX_EDIT_CONFIRMED)
                        // уведомляем мастера
                        let usersTable = await c.tableUI.getList('Сотрудники', ['#', 'Роль', 'ChatId'])
                        await Notify(msg, c, TX_EDIT_CONFIRMED_INFO + '\n' 
                            + dataToMessage(c.data[msg.chat.id], objectsTable), usersTable, c.data[msg.chat.id].user) //пишем мастеру
                    } else {
                        // console.log('ВЕРНУТЬСЯ HAPPEN')
                        await Manager(msg, c, end, newCashedData) 
                    }

                }, false, usersTable) // запускаем сценарий confirmation сразу с редактирования

            } else if(type === 'status') {

                c.botUI.context(msg, async ()=>{

                    c.botUI.deleteAllMarked(msg)
                    c.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable)
                    await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), {mark_to_remove: true})

                    const opts = {
                        reply_markup: { inline_keyboard: []}, mark_to_remove: true
                    }

                    const btns:any = opts.reply_markup.inline_keyboard
                    const z = c.data[msg.chat.id]

                    let obrabotka = ()=>{
                        if(z.status !== STATUS_OBRABOTKA)
                            btns.push([{ 
                                text: STATUS_OBRABOTKA, 
                                callback_data: STATUS_OBRABOTKA + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    let sobran = ()=>{
                        if(z.delivery === 'Нет' && z.status !== STATUS_SOBRAN)
                            btns.push ([{
                                text: STATUS_SOBRAN, 
                                callback_data: STATUS_SOBRAN + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    let dostavka = ()=>{
                        if(z.delivery === 'Да' && z.status !== STATUS_DOSTAVKA)
                            btns.push ([{
                                text: STATUS_DOSTAVKA, 
                                callback_data: STATUS_DOSTAVKA + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    let object = ()=>{
                        // if(z.status !== STATUS_OBJ) //в текщей логике никогда не выполдняеться
                            btns.push ([{
                                text: STATUS_OBJ, 
                                callback_data: STATUS_OBJ + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    let sklad = ()=>{
                        // if(z.status !== STATUS_SKLAD) //в текщей логике никогда не выполдняеться
                            btns.push ([{
                                text: STATUS_SKLAD, 
                                callback_data: STATUS_SKLAD + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    let otmena = ()=>{
                        // if(z.status !== STATUS_CANCEL) //в текщей логике никогда не выполдняеться
                            btns.push ([{
                                text: STATUS_CANCEL,
                                callback_data: STATUS_CANCEL + '_' + zayavkiTable['#'][ind] + '_' + ind,
                            }])
                    }

                    // type = Со склада (кнопки)
                    // "Обработка", "Собран", ("Доставка"), "Объект"

                    // type = Возврат
                    // "Обработка", ("Доставка"), "Склад"

                    // type =  Между объектами 
                    // "Обработка", ("Доставка"), "Объект"

                    // type = Свободная
                    // "Обработка" -> "Собран" -> "Доставка" -> "Объект" -> "Склад"


                    if(z.type === 'Со склада') {
                        obrabotka()
                        sobran()
                        dostavka()
                        object()
                        otmena()
                    } else if(z.type === 'Возврат') {
                        obrabotka()
                        dostavka()
                        sklad()
                        otmena()
                    } else if(z.type === 'Между объектами') {
                        obrabotka()
                        dostavka()
                        object()
                        otmena()
                    } else if(z.type === 'Свободная') {
                        obrabotka()
                        sobran()
                        dostavka()
                        object()
                        sklad()
                        otmena()
                    }
                    
                    // сообщение с кнопками
                    await c.botUI.message(msg, TX_SELECT_STATUS, opts)

                    const opts2 = {
                        reply_markup: { inline_keyboard: [[
                            {
                                text: TX_BUTTON_BACK, 
                                callback_data: 'back',
                            }
                        ]]}, mark_to_remove: true
                    }
                    await c.botUI.message(msg, TX_NAVIAGTION, opts2)


                },{ 
                    callback_query:
                    async (query:any)=>{    
                        
                        const split = query.data.split('_')
                        const type = split[0]
                        const id = split[1]
                        const ind = split[2]
                        
                        if(type === 'back') {
                            
                            c.botUI.deleteAllMarked(msg)
                            await Manager(msg, c, end, newCashedData)

                            // const STATUS_OBRABOTKA = "Обработка"
                            // const STATUS_SOBRAN = "Собран"
                            // const STATUS_DOSTAVKA = "Доставка"
                            // const STATUS_OBJ = "Объект"
                            // const STATUS_SKLAD = "Склад"
                            // const STATUS_CANCEL = "Отмена"

                        } else if(type === STATUS_OBRABOTKA || type === STATUS_SOBRAN 
                               || type === STATUS_DOSTAVKA || type === STATUS_OBJ || type === STATUS_SKLAD
                        ) {

                            let save = async ()=>{
                                c.botUI.deleteAllMarked(msg)

                                c.data[msg.chat.id].status = type
                                await saveRequest(msg, c, id, true) //save only status
                                
                                // если все хорошо и нет ошибки, то сразу меняем сатус в КЭШ (не спрашиваем у сервера)
                                zayavkiTable['Статус'][ind] = type
                                await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiTable), objectsTable, true, usersTable))
                                await c.botUI.message(msg, TX_EDIT_STATUS)

                                //пишем мастеру
                                await Notify(msg, c, TX_EDIT_STATUS_INFO + '\n' + 
                                    dataToMessage(c.data[msg.chat.id], objectsTable), usersTable, c.data[msg.chat.id].user) 

                            }

                            // Возврат на склад и инструмент на объекте - необратимы статусы в текуще реализации
                            if(type === STATUS_OBJ || type === STATUS_SKLAD) {

                                c.botUI.deleteAllMarked(msg)
                                c.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable)
                                await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), {mark_to_remove: true})

                                await YesNo(msg, c, TX_CONFIRN_OBJ, async ()=>{
                                    await save()
                                }, async ()=>{
                                    await Manager(msg, c, end, newCashedData)
                                })

                            } else {
                                await save()
                            }
                            

                        } else if(type === STATUS_CANCEL) {
                
                            c.botUI.deleteAllMarked(msg)
                            c.data[msg.chat.id] = zayavkaToData(ind, zayavkiTable)
                            await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), {mark_to_remove: true})

                            await YesNo(msg, c, TX_CONFIRN_CANCEL, async ()=>{

                                c.botUI.deleteAllMarked(msg)

                                c.data[msg.chat.id].status = 'Отмена'
                                await saveRequest(msg, c, id, true) //save only status
                                
                                zayavkiTable['Статус'][ind] = 'Отмена'
                                await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiTable), objectsTable, true, usersTable))
                                await c.botUI.message(msg, TX_EDIT_CANCELED)

                                //пишем мастеру
                                await Notify(msg, c, TX_EDIT_CANCELED_IMFO + '\n' + 
                                    dataToMessage(c.data[msg.chat.id], objectsTable), usersTable, c.data[msg.chat.id].user) 

                            }, async ()=>{

                                c.botUI.deleteAllMarked(msg)
                                Manager(msg, c, end, newCashedData)

                            })
                            
                        }                     
                    }
                })

            }
            
        }
    })
}

export default Manager