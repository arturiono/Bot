import { MainContext, RequestType } from '../types/types'
import Edit from './edit'
import {dataToMessage} from './common/requestConverter'

const TX_INITIAL_MESSAGE = 'Проверь пожалуйста выше, *все ли верно*?'
const TX_BUTTON_CONFIRM = "Подтвердить"
const TX_BUTTON_NOT_CONFIRM = "Редактировать"

//confirm включает в себя edit (наужна рекурсия)
const Confirm = async (msg:any, c: MainContext, end:()=>any) => {
    const editNow = async ()=>{
        // для Confirm сценариев не важно было редактирование или нет
        await Edit(msg, c, async (isEdited:Boolean)=>{
            if(isEdited)
                await end()
            else    
                await Confirm(msg, c, end)
        }, false)
    }

    c.botUI.deleteAllMarked(msg)
    
    const objectsTable = await c.tableUI.getList('Объекты', ['Auto #', 'Название'])
    const nmsg = await c.botUI.message(msg, dataToMessage(c.data[msg.chat.id], objectsTable), {mark_to_remove: true} );

    c.botUI.context(msg, async ()=>{

        // показываем заявку
        // console.log(c.data[msg.chat.id])
        // console.log(Zayavka([c.data[msg.chat.id]]))

        const opts = {
            reply_markup: {
                inline_keyboard: [[
                        { text: TX_BUTTON_NOT_CONFIRM, callback_data: 'not-confirmed' },
                        { text: TX_BUTTON_CONFIRM, callback_data: 'confirmed' }
                    ]]
            },
            mark_to_remove: true
        }
        
        await c.botUI.message(msg, TX_INITIAL_MESSAGE, opts);
    },{ 
        callback_query: async (query:any) => {
            if (query.data === 'confirmed') {

                c.botUI.deleteFromMarked(msg, nmsg.message_id) //оставляем последнее сообщение нв ленте
                c.botUI.deleteAllMarked(msg)
                await end()

            } else { 
                c.botUI.deleteAllMarked(msg);
                await editNow()
            }
        }
    })

}
export default Confirm