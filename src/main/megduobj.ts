import {getLocalPhone, getUserName} from '../authorize'
import { MainContext} from '../../types/types'
import {dataToMessage} from '../common/requestConverter'

import Object from '../toObject'
import FromObjectTools from '../fromObjectTools'
import Dostavka from '../dostavka'
import Time from '../dateTime'
import Comment from '../comment'
import Confirm from '../confirm'

import Notify from '../common/notify'
import {saveRequest} from '../common/saveRequest'

const TX_NEW_ZAYAVKA_MNG = "✅ 🏢🔜🏢 Поступила заявка переноса между объектами:\n" 
const TX_REQEST_CONFIRMED = "✅ *Заявка переноса между объектами принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка переноса между объектами*"

export default async (msg:any, c: MainContext, end:()=>any) => {

    await c.botUI.message(msg, TX_INITIAL_MESSAGE)

    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Между объектами',
        from: '1', //заменим при выборе
        to: '1', //заменим при выборе
        status: 'Обработка', 
        delivery: 'Нет',
        dateTime: 'По готовности',
        tools: {},
        rashodniki: {}, //не используется при возврате
        comment: 'Null',
        user: getLocalPhone(getUserName(msg)),
        dateCreated: 'Null' 
    }


    let otherCall = ()=>{
        Comment(msg, c, false, ()=>{  
            Confirm(msg, c, async ()=>{ 
                
                await saveRequest(msg, c)
                await c.botUI.message(msg, TX_REQEST_CONFIRMED)
                
                // пишем менеджеру
                const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])

                await Notify(msg, c,
                    TX_NEW_ZAYAVKA_MNG + 
                    dataToMessage(c.data[msg.chat.id], true, usersTable), usersTable,
                    null) //пишем менджеру
                end()

            })
        })
    }


    FromObjectTools(msg, c, false, ()=>{
        Object(msg, c, false, ()=>{
            Dostavka(msg, c, false, ()=>{
                if(c.data[msg.chat.id].delivery === 'Да')
                    Time(msg, c, false, ()=>{ 
                        otherCall()
                    })
                else
                    otherCall()
            })
        })
    })

    

}