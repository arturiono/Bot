import { MainContext} from '../types/types'

const TX_INITIAL_MESSAGE = '⌨️ Введите *комментарий для менджера*:'
const TX_INITIAL_EDIT_MESSAGE = '⌨️ Введите *новый комментарий для менджера*:'
// const TX_PREV_MESSAGE = 'Ваше предыдущее сообщение было:\n'
const TX_NO_SUCCESS_MESSAGE = 'Понял, обязательно *передам менджеру*'
const TX_NO_SKIP_MESSAGE = 'Ок, *без комментариев*'
const TX_BUTTON_SKIP = 'Пропустить'

export default async (msg:any, c: MainContext, editMode:Boolean, end:()=>any) => { 

    let msdDelID:Number

    c.botUI.context(msg, async ()=>{
        
        const opts = {
            reply_markup: {
                inline_keyboard: [ [ { text: TX_BUTTON_SKIP, callback_data: 'skip'}] ]
            }
        }
        const nmsg = await c.botUI.message(msg, editMode? TX_INITIAL_EDIT_MESSAGE:TX_INITIAL_MESSAGE, opts)
        msdDelID = nmsg.message_id
    },{ 
        message:
        async (msg:any)=>{
            // console.log('HAPPEN')
            // c.botUI.delete(msg, msdDelID)
            c.data[msg.chat.id].comment = msg.text
            c.botUI.delete(msg, msdDelID)
            await c.botUI.message(msg, TX_NO_SUCCESS_MESSAGE)
            await end()
        },
        callback_query:
        async (query:any)=>{
            if(query.data === 'skip'){ //Skip
                c.data[msg.chat.id].comment = 'Null'
                c.botUI.delete(msg, msdDelID)
                await c.botUI.message(msg, TX_NO_SKIP_MESSAGE)
                await end()
            }
        }
    })

}