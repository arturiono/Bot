import {getLocalPhone, getUserName} from '../authorize'
import {MainContext} from '../../types/types'
import {dataToMessage} from '../common/requestConverter'

import Dostavka from '../dostavka'
import Time from '../dateTime'
import Comment from '../comment'
import Confirm from '../confirm'

import Notify from '../common/notify'
import {saveRequest} from '../common/saveRequest'

const TX_NEW_ZAYAVKA_MNG = "✅ 🆓 Поступила заявка в свобоной форме:\n" 
const TX_REQEST_CONFIRMED = "✅ *Заявка в свобоной форме принята*. Информация о готовности будет поступать в этот чат.\nдля управления зявками используйте раздел меню /moizayavki";
const TX_INITIAL_MESSAGE = "*Заявка в свободной форме*"

export default async (msg:any, c: MainContext, end:()=>any) => {

    const objectsTable = await c.tableUI.getList('Объекты', ['Auto #', 'Название'])
    await c.botUI.message(msg, TX_INITIAL_MESSAGE)

    c.data[msg.chat.id] = {
        id: 'Null',
        type: 'Свободная',
        from: '0', 
        to: '0',
        status: 'Обработка', // применимо
        delivery: 'Нет', // применимо
        dateTime: 'По готовности', // применимо
        tools: {}, //не используется
        rashodniki: {}, //не используется
        comment: 'Null',
        user: getLocalPhone(getUserName(msg)),
        dateCreated: 'Null' 
    }

    let otherCall = async ()=>{
        await Comment(msg, c, false, async ()=>{  
            await Confirm(msg, c, async ()=>{ 
                await saveRequest(msg, c)
                await c.botUI.message(msg, TX_REQEST_CONFIRMED)
                
                // пишем менеджеру
                const usersTable = await c.tableUI.getList('Сотрудники', ['#', 'ФИО', 'Роль', 'ChatId'])

                await Notify(msg, c,
                    TX_NEW_ZAYAVKA_MNG + 
                    dataToMessage(c.data[msg.chat.id], objectsTable, true, usersTable), usersTable,
                    null) //пишем менджеру
                await end()
            })
        })
    }

    await Dostavka(msg, c, false, async ()=>{
        if(c.data[msg.chat.id].delivery === 'Да')
            await Time(msg, c, false, async ()=>{ 
                await otherCall()
            })
        else 
            await otherCall()
    })

}