import { MainContext} from '../types/types'

const TX_INITIAL_QUESTION_ZABERU = 'Нужна доставка или сам заберешь?'
const TX_INITIAL_QUESTION_PRIVEZU = 'Нужна доставка или сам привезешь?'
const TX_BTN_SELF_ZABERU = 'Заберу сам'
const TX_BTN_SELF_PRIVESU = 'Без доставки'
const TX_BTN_DELIVERY = 'Нужна доставка'
const TX_SUCESS_DELIVERY = 'Понял, *привезем*'
const TX_SUCESS_SELF = 'Понял, *заберешь сам*'

// Сценарий выбора точки назначения
export default async (msg:any, c: MainContext, editMode:Boolean, end:()=>any) => {
    let delMsg:any
    c.botUI.context(msg, async ()=>{
        const opts = { 
            reply_markup: { inline_keyboard: [ 
                [ { 
                    text: c.data[msg.chat.id].type === 'Со склада'?  TX_BTN_SELF_ZABERU : TX_BTN_SELF_PRIVESU, 
                    callback_data: 'self',
                }, { 
                    text: TX_BTN_DELIVERY, 
                    callback_data: 'delivery',
                }  ]
            ]},
            mark_to_remove: true    
        }
        delMsg = await c.botUI.message(msg, 
            c.data[msg.chat.id].type === 'Со склада'? TX_INITIAL_QUESTION_ZABERU : TX_INITIAL_QUESTION_PRIVEZU, opts)

    },{ 
        callback_query:
        async (query:any)=>{

            // console.log('EHUUUEHUUU')
            // console.log(msg.chat.id)
            // console.log(delMsg.message_id)
            // console.log('- - -')
            await c.botUI.delete(msg, delMsg.message_id)

            c.data[msg.chat.id].delivery = query.data === 'delivery'? 'Да' : 'Нет'
            const SMSG = (query.data === 'self') ? TX_SUCESS_SELF : TX_SUCESS_DELIVERY
            await c.botUI.message(msg, SMSG)
            
            end() 
        }
    })
}