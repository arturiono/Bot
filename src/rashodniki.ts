
import {MainContext, Rashodniki} from '../types/types'

const TX_INITIAL_MESSAGE = '*Добавление расходных материалов*:'
const TX_INITIAL_MESSAGE_EDIT = '*Редактирование расходных материалов*:'
const TX_SELECT_CATEGORY= 'Выбери категорию'
const TX_CURRENT_CATEGORY= 'Текущая категория:'
const TX_END_MESSAGE = 'Для выхад из добавления расходников нажми'
const TX_BACK_MESSAGE = 'Для возврата к выбору категорий нажми'
const TX_BUTTON_END = "Закончить добавление >>"
const TX_BUTTON_EDIT_END = "Закончить редактирование >>"
const TX_BUTTON_BACK = '<< Вернутся в категории'
// const TX_MATERIAL = 'Расходники: '
const TX_EXISTS = ' уже в списоке'

const TX_END_CONFIRM_REQUEST = "Расходники не добавлены. Оставить заявку без расходников?"
const TX_BUTTON_CONFIRM = 'Да'
const TX_BUTTON_NOT_CONFIRM = 'Нет'
const TX_END_CONFIRMED = "Понял, *продолжаем без расходников*"
const TX_END_NOT_CONFIRMED = "Продолжим добавление"

// export interface RashodnikiMsg {
//     [key: string]: {
//         id:string, 
//         // prevText:string, 
//         // prevReplyMarkup: any
//     }
//  } 

// кэшированные расходники (глобально для всех)
let addedRashodnikiMsgIds: any = {}

let MRashodniki = async (msg:any, c: MainContext, editMode:Boolean, showInitialMessage:Boolean,  end:()=>any) => {

    addedRashodnikiMsgIds[msg.chat.id] = addedRashodnikiMsgIds[msg.chat.id] !== undefined? addedRashodnikiMsgIds[msg.chat.id] : {}

    const addedRashodniki = c.data[msg.chat.id].rashodniki
    let yesNoMsg: any //сообщение для удаления
    
    const Table = await c.tableUI.getList('Расходники',['Auto #', 'Количество', 'Измерение', 'Категория', 'Название', 'Вариант'])
    // console.log(Table)

    // msgId - если хотим заменить добавляем этот параметр
    let showRashodnikMessage = async (id:string, update?:boolean, endedEditMode?:boolean)=>{

        let msgId
        if(update) msgId = addedRashodnikiMsgIds[msg.chat.id][id]
        const indx = Table['Auto #'].indexOf(id)

        const buttons:any = []

        if(!endedEditMode) {

            // Удалены все ограничения после кейса, что пользователю нужно
            // иметь возможность заказть больше расходников, чем есть на складе (докупка по пути)
            
            if (addedRashodniki[id].count + addedRashodniki[id].over - 1 > 0) 
                    buttons.push({text: '-1', callback_data: id + '_' + '-1'})
            else buttons.push({text: ' ', callback_data: id + '_' + 'null'})

            if (addedRashodniki[id].count + addedRashodniki[id].over - 5 > 0)
                    buttons.push({text: '-5', callback_data: id + '_' + '-5'})
            else buttons.push({text: ' ', callback_data: id + '_' + 'null'})

            buttons.push({text: 'Удалить', callback_data: id + '_' + 'del'})

            // if (addedRashodniki[id].count + 5 <= Table['Количество'][indx])
                    buttons.push({text: '+5', callback_data: id + '_' + '+5'})
            // else buttons.push({text: ' ', callback_data: id + '_' + 'null'})

            // if (addedRashodniki[id].count + 1 <= Table['Количество'][indx])
                    buttons.push({text: '+1', callback_data: id + '_' + '+1'})
            // else buttons.push({text: ' ', callback_data: id + '_' + 'null'})
        }

        const opts = {
            reply_markup: {
                inline_keyboard: [buttons]
            }
        }       

        const availible = Number(Table['Количество'][indx]) + addedRashodniki[id].reserved
        
        const overuse = addedRashodniki[id].over 
        const cntx = !endedEditMode? ' (в наличии ' + availible + ' ' + Table['Измерение'][indx] + ')' : ''
        const warning = overuse > 0 ? '\n☝️ нужна докупка: ' + overuse + ' ' + Table['Измерение'][indx] : '' 
        const count = '\n► *' + (addedRashodniki[id].count + addedRashodniki[id].over) + ' ' + Table['Измерение'][indx] + '* ' + cntx                            
        const name = '*' + addedRashodniki[id].name + '*' 

        const tx = name + count + warning

        if(update) { 

            await c.botUI.editMessage(msg, msgId, tx, opts)

        } else { //первый раз 

            const nmsg = await c.botUI.message(msg, tx, opts)
            addedRashodnikiMsgIds[msg.chat.id][id] = nmsg.message_id
        }

    }

    const showEndMessage = async ()=>{
        const opts2 = {
            reply_markup: {
                inline_keyboard: [[{ text: editMode? TX_BUTTON_EDIT_END : TX_BUTTON_END, callback_data: 'end'}]]
            },
            mark_to_remove: true
        };
        await c.botUI.message(msg, TX_END_MESSAGE, opts2)
    }

    const showBackMessage = async ()=>{
        const opts2 = {
            reply_markup: {
                inline_keyboard: [[{ text: TX_BUTTON_BACK, callback_data: 'back'}]]
            },
            mark_to_remove: true
        };
        await c.botUI.message(msg, TX_BACK_MESSAGE, opts2)
    }

    const endConfirmationRashodniki = async ()=>{
        const opts = {
            reply_markup: {
                inline_keyboard: [ [ { text: TX_BUTTON_CONFIRM, callback_data: 'end-confirmed'},
                                     { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'end-not-confirmed' }] ]
            },
            mark_to_remove: true
        }
        yesNoMsg = await c.botUI.message(msg, TX_END_CONFIRM_REQUEST, opts)
    }

    const endRashodniki = async ()=>{

        c.data[msg.chat.id].rashodniki = addedRashodniki
        c.botUI.deleteAllMarked(msg)

        // заменяем все добавленные на сообщения без кнопки
        for (const id in addedRashodnikiMsgIds[msg.chat.id]) {
            showRashodnikMessage(id, true, true)
        }
        addedRashodnikiMsgIds[msg.chat.id] = undefined //сбрасываем глобальную переменную
        await end()

    }

    const endRashodnikiConfirmed = async ()=>{ 
        await c.botUI.message(msg, TX_END_CONFIRMED)
        await endRashodniki()
    }

    const endRashodnikiNotConfirmed = async ()=>{
        // удалить сообщение и продолжить
        c.botUI.delete(msg, yesNoMsg.message_id)
        await c.botUI.message(msg, TX_END_NOT_CONFIRMED, {mark_to_remove: true})
    }

    const operationAdd = (id: string, v: number) => {
        
        const indx = Table['Auto #'].indexOf(id)

        // console.log(addedRashodniki[id])

        // при первичной заявке reserved = 0
        const availible = Number(Table['Количество'][indx]) + addedRashodniki[id].reserved

        // всего сейчас заказано пользователем
        const total =  addedRashodniki[id].over + addedRashodniki[id].count

        // console.log('total', total)
        // console.log('availible', availible)

        // если перерасход
        if (total + v >= availible) {
            addedRashodniki[id].count = availible
            addedRashodniki[id].over = (total + v) - availible
        // нет перерасхода
        } else {
            addedRashodniki[id].count = total + v
            addedRashodniki[id].over = 0
        }

        // console.log(addedRashodniki[id].count)
        // console.log(addedRashodniki[id].over
        // console.log('- - -')

    }

    // ### логика обработки расходника используется в двух местах
    const callbackRashodnikControls = async (data:string) => {

            let updateRashodnikiMsg = async (id: string)=>{
                await showRashodnikMessage(id, true)
            }

            const id = data.split('_')[0]
            const op = data.split('_')[1]

            // console.log(op)
            // console.log(id)

            if(op === '+1') {
                operationAdd(id, 1)
                updateRashodnikiMsg(id)
            } else if(op === '+5') {
                operationAdd(id, 5)
                updateRashodnikiMsg(id)
            } else if(op === '-1') {
                operationAdd(id, -1)
                updateRashodnikiMsg(id)
            } else if(op === '-5') {
                operationAdd(id, -5)
                updateRashodnikiMsg(id)
            } else if(op === 'del') {
                c.botUI.delete(msg, addedRashodnikiMsgIds[msg.chat.id][id])
                delete addedRashodniki[id]
                delete addedRashodnikiMsgIds[msg.chat.id][id]
            }

    }

    

    c.botUI.context(msg, async ()=>{
        
        const buttons:any = []
        const existCategories:any = {}
        Table['Категория'].forEach((el:any) => {
            if(!existCategories[el]) {
                buttons.push(
                    [{ text: el, callback_data: el}]
                )
                existCategories[el] = true
            }
        })

        const opts = {
            reply_markup: {
                inline_keyboard: buttons
            },
            mark_to_remove: true
        }

        // console.log(buttons)

        // Первичное добавление
        if(!editMode) { 
            if(showInitialMessage) {
                await c.botUI.message(msg, TX_INITIAL_MESSAGE)
            }
        // Редактирование списка 
        } else {
            if(showInitialMessage) {
                await c.botUI.message(msg, TX_INITIAL_MESSAGE_EDIT)

                // показываем кнопки заново при редактировании
                for(const id in addedRashodniki) {
                    showRashodnikMessage(id)
                }

            }            
        }

        await c.botUI.message(msg, TX_SELECT_CATEGORY, opts);
        await showEndMessage()

    },{ 
        callback_query: async (query:any) => { 

            // нажата кнопка закончить
            if (query.data === 'end') { // заканчиваем выбор материалов
                                
                // сообщшение о подтверждении
                if (Object.keys(addedRashodniki).length === 0) {
                    endConfirmationRashodniki()
                // заканчиваем
                } else {
                    endRashodniki()
                } 

            } else if(query.data === 'end-confirmed') {

                endRashodnikiConfirmed()

            } else if(query.data === 'end-not-confirmed') {

                
                endRashodnikiNotConfirmed()

            } else if(query.data.split('_').length === 2) {

                callbackRashodnikControls(query.data)

            // выбрана категория
            } else  { 

                c.botUI.context(msg, async ()=>{

                    const List:any = {} // оссоциативный массив с массивом вариантов
                    const Category:String = query.data
                    c.botUI.deleteAllMarked(msg)

                    await showBackMessage()
                    await c.botUI.message(msg, TX_CURRENT_CATEGORY + '*' + query.data + '*', {mark_to_remove: true});

                    // %%% тут
                    Table['Название'].forEach((el:any, i:number) => {
                        if(Table['Категория'][i] === Category) {
                            // if(Table['Количество'][i] !== '0') { //если не 0 //убрали для возможности overuse

                                let firstTime = false 

                                if(! List[el] ) {
                                    List[el] = []
                                    firstTime = true
                                }                                

                                if (Table['Вариант'][i] !== '' && Table['Вариант'][i] !== ' ' && Table['Вариант'][i] !== undefined) 
                                    List[el].push({
                                            name: Table['Вариант'][i], 
                                            id: Table['Auto #'][i], 
                                            count: Table['Количество'][i],
                                            items: Table['Измерение'][i],
                                        })
                                else if(firstTime) //нет вариантов у расходника
                                    List[el].push({
                                            name: Table['Название'][i], // пишем название а не вариант
                                            id: Table['Auto #'][i],
                                            count: Table['Количество'][i],
                                            items: Table['Измерение'][i],
                                        })

                            // }
                            
                        }
                    })

                    for (let el in List) {
                        
                        const buttons:any = []
                        List[el].forEach((variant:any) => {
                            buttons.push(
                                [{ text: variant.name + ' (' + variant.count + ' ' + variant.items + ')', 
                                   callback_data: variant.id}]
                            )
                        })
                        
                        const opts = { 
                            reply_markup: {
                                inline_keyboard: buttons
                            },
                            mark_to_remove: true
                        }
                
                        await c.botUI.message(msg, '*' + el + '*', opts);

                    }
                    showEndMessage()

                },{

                    callback_query: async (query:any) => {

                        
                        // заканчиваем выбор материалов
                        if (query.data === 'end') { 
                            // сообщшение о подтверждении
                            if (Object.keys(addedRashodniki).length === 0) {
                                endConfirmationRashodniki()
                            // заканчиваем
                            } else {
                                endRashodniki()
                            } 
                        } else if(query.data === 'end-confirmed') {

                            endRashodnikiConfirmed()
            
                        } else if(query.data === 'end-not-confirmed') {
            
                            endRashodnikiNotConfirmed()

                        // возвратт в категорию
                        } else if (query.data === 'back') {

                            c.botUI.deleteAllMarked(msg)
                            MRashodniki(msg, c, editMode, false, end) //рекурсивно вызываем функцию

                        // Пришел ID для редактирования расходника
                        } else if(query.data.split('_').length === 2) {

                                callbackRashodnikControls(query.data)
    
                        // пришел ID для добавления (первый раз)
                        } else { 

                            const id = query.data
                            const indx = Table['Auto #'].indexOf(id)

                            if(addedRashodniki[id] === undefined) {
                                let name = Table['Название'][indx]
                                if (Table['Вариант'][indx] !== '' && Table['Вариант'][indx] !== undefined)
                                name += ' (' + Table['Вариант'][indx] +  ')'
                                
                                addedRashodniki[id] = {
                                    name:name, 
                                    count: 0, 
                                    over: 0,
                                    reserved: 0,
                                    units: Table['Измерение'][indx]
                                }
                                operationAdd(id, 1)
                                showRashodnikMessage(id)
                            } else {
                                await c.botUI.message(msg, Table['Название'][indx] + TX_EXISTS, {mark_to_remove: true});
                            }

                        } 

                    }
                    
                })
            }
        }
    })

}
export default MRashodniki