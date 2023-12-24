
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

// 🏠🔙 
// 🔜🏢
// 🏩🔜🏢

const TX_NEW_ZAYAVKA_MNG = "✅ 🔜🏢 Поступила заявка получения со склада:\n" 
const TX_REQEST_CONFIRMED = "✅ *Заявка получения со склада принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка получения со склада*"

export default async (msg:any, c: MainContext, end:()=>any) => {

    await c.botUI.message(msg, TX_INITIAL_MESSAGE)

    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Со склада',
        from: '0',
        to: '1',
        status: 'Обработка',
        delivery: 'Нет',
        dateTime: 'По готовности',
        tools: {},
        rashodniki: {},
        comment: 'Null',
        user: getLocalPhone(getUserName(msg)),
        dateCreated: 'Null' 
    }

    Object(msg, c, false, ()=>{
        Dostavka(msg, c, false,  ()=>{
            Time(msg, c, false, ()=>{ 
                Tools(msg, c, false, ()=>{  // расходники за инструментом
                    Rashodniki(msg, c, false, true, ()=>{
                        Comment(msg, c, false, ()=>{  
                            Confirm(msg, c, async ()=>{ 

                                await saveRequest(msg, c)
                                await c.botUI.message(msg, TX_REQEST_CONFIRMED)

                                //пишем менеджеру
                                const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])
                                
                                await Notify(msg, c,
                                    TX_NEW_ZAYAVKA_MNG + dataToMessage(c.data[msg.chat.id], true, usersTable), usersTable, 
                                    null) //пишем менджеру
                                end()
                            }) 
                        })
                    })
                })
            })
        })
    })

}