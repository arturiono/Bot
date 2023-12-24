import { MainContext} from '../types/types'

const TX_BTN_YES = "Да"
const TX_BTN_NO = "Нет"

export default async (msg:any, c: MainContext, initialMsg:string, yes:()=>any, no:()=>any) => {


    c.botUI.context(msg, async ()=>{   

        const opts = {
            reply_markup: { inline_keyboard: [ 
                [ { 
                    text: TX_BTN_YES, 
                    callback_data: 'yes', 
                } ,
                { 
                    text: TX_BTN_NO, 
                    callback_data: 'no', 
                } ] 
            ]},
            mark_to_remove: true
        }

        await c.botUI.message(msg, initialMsg, opts)

    },{ 
        callback_query:
        async (query:any)=>{    
        
            
            if(query.data === 'yes') {
                
                await yes()

                // c.botUI.deleteAllMarked(msg)

                // c.data[msg.chat.id].status = 'Отмена'
                // await saveRequest(msg, c, id, true) //save only status
                
                // zayavkiTable['Статус'][ind] = 'Отмена'
                // await c.botUI.message(msg, dataToMessage(zayavkaToData(ind, zayavkiTable), true, usersTable))
                // await c.botUI.message(msg, TX_EDIT_CANCELED)
                
                // //пишем мастеру
                // await Notify(msg, c, TX_EDIT_CANCELED_IMFO + '\n' + 
                //     dataToMessage(c.data[msg.chat.id]), c.data[msg.chat.id].user) 
                

            } else {
                // c.botUI.deleteAllMarked(msg)
                // thisIs(msg, c, end)
                await no()
            }                     
        }
    })
}