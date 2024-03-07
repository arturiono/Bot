
import {getLocalPhone, getUserName} from '../authorize'
import {MainContext, IdNamePairArray} from '../../types/types'
import {dataToMessage} from '../common/requestConverter'

import Object from '../toObject'
import Dostavka from '../dostavka'
import Time from '../dateTime'
import Tools from '../tools'
import Comment from '../comment'
import Confirm from '../confirm'
import Rashodniki from '../rashodniki'

import Notify from '../common/notify'
import {saveRequest} from '../common/saveRequest'

const TX_NEW_ZAYAVKA_MNG = "✅ 🔜🏢 Поступила заявка получения со склада:\n" 
const TX_REQEST_CONFIRMED = "✅ *Заявка получения со склада принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка получения со склада*"

const TX_CONFLICT_TOOLS = "*❗️Произошел конфликт инмтрумента*. Другой сотрудник уже заказал выбранный вами инструемент. \n" + 
                    "Посмотртите на изменения в инструменте."
const TX_CONFLICT_RASHODNIKI = "*❗️Произошел конфликт расходников*. Кто-то уже заказал часть расходников \n" + 
                    "Посмотртите на изменения в расходниках."


export default async (msg:any, c: MainContext, end:()=>any) => {

    const objectsTable = await c.tableUI.getList('Объекты', ['Auto #', 'Название'])
    await c.botUI.message(msg, TX_INITIAL_MESSAGE)

    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Со склада',
        from: '0',
        to: '1',
        status: 'Обработка',
        delivery: 'Нет',
        dateTime: 'По готовности',
        tools: {}, //{"2":"СПЕЦ-3447","3":"BORT BNG-2000X"}
        rashodniki: {}, //{"1":{"name":"Лезвия | Прямы е","count":100}, "2":{"name":"Лезвия | Лезвия Крючок","count":100}}
        comment: 'Null',
        user: getLocalPhone(getUserName(msg)),
        dateCreated: 'Null' 
    }

    // Конечная функция с рекурсией выделена в компонент
    let  ConfirmedByUser = async ()=> {

        // 1. проверяем tools, чтобы их не забронировал кто-то другой
        const toolsData = await c.tableUI.getList('Инструмент', 
        ['Auto #', 'Статус' , 'Наименование', 'Описание', 'Объект', 'Местонахождение', 'Ответсвенный', 'Сотрудник', 'Заявка'])
        
        let conflictTool = false
        let conflictRash = false 

        for (const toolId in c.data[msg.chat.id].tools) {

            const ind = toolsData['Auto #'].indexOf(toolId)
            if(toolsData['Статус'][ind] !== 'Склад') {
                let tx = '⛔️' + toolsData['Наименование'][ind] + ' | ' + toolsData['Описание'][ind] + '\n' +
                'Уже заброниравал: ' + toolsData['Ответсвенный'][ind]

                await c.botUI.message(msg, tx)
                conflictTool = true

                // удаляем из списка
                delete c.data[msg.chat.id].tools[toolId]
            }

        }

        // 2. проверяем rashodniki, чтобы их не забронировал кто-то другой
        const rashodniki = await c.tableUI.getList('Расходники', 
        ['Auto #', 'Количество', 'Измерение', 'Категория' ,'Название', 'Вариант', 'Фото', 'Место'])

        for (const toolId in c.data[msg.chat.id].rashodniki) {
            const ind = rashodniki['Auto #'].indexOf(toolId)

            if(ind!== -1 && rashodniki['Количество'][ind]){
                const a = Number(rashodniki['Количество'][ind])
                const b = c.data[msg.chat.id].rashodniki[toolId].count
                const dif = a - b
                if( dif < 0 ) {
                    let tx = '⛔️' + rashodniki['Название'][ind] + ' | ' + rashodniki['Вариант'][ind] + '\n' +
                    'Максимаольно доступно: ' + a + rashodniki['Измерение'][ind]
                    await c.botUI.message(msg, tx)

                    const newCount = c.data[msg.chat.id].rashodniki[toolId].count + dif
                    c.data[msg.chat.id].rashodniki[toolId].count = newCount //минимальное значение - 0

                    // Записываем в перерасход конфликтный инструмент
                    c.data[msg.chat.id].rashodniki[toolId].over += -dif

                    // if(newCount === 0 && c.data[msg.chat.id].rashodniki[toolId].over) {
                    //     delete c.data[msg.chat.id].rashodniki[toolId]
                    // }

                    conflictRash = true
                }
            }
            
        }

        if(conflictTool) await c.botUI.message(msg, TX_CONFLICT_TOOLS) 
        if(conflictRash) await c.botUI.message(msg, TX_CONFLICT_RASHODNIKI) 

        if (conflictTool || conflictRash) {
            // await c.botUI.message(msg, TX_CONFLICT) 

            // снова показываем confirmed и рекурсивно вызывает эту функцию
            await Confirm(msg, c, async ()=>{ 
                ConfirmedByUser()
            }) 

            return
        } 

        // - - - - - - - - - - - - - - -
        // Есоли все отлично

        await saveRequest(msg, c)
        await c.botUI.message(msg, TX_REQEST_CONFIRMED)

        // пишем менеджеру
        const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])
        
        await Notify(msg, c,
            TX_NEW_ZAYAVKA_MNG + dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), usersTable, 
            null) //пишем менджеру
        await end()
    }

    await Object(msg, c, false, async ()=>{
        await Dostavka(msg, c, false, async ()=>{
            await Time(msg, c, false, async ()=>{ 
                await Tools(msg, c, false, async ()=>{  // расходники за инструментом
                    await Rashodniki(msg, c, false, true, async ()=>{
                        await Comment(msg, c, false, async ()=>{  
                            await Confirm(msg, c, async ()=>{ 
                                await ConfirmedByUser()
                            }) 
                        })
                    })
                })
            })
        })
    })

}