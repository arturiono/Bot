const fs = require('fs')
import { MainContext} from '../types/types'

const TX_CONT_REQUEST = 'Для продолжения работы нажмите "отправить телефон"'
const TX_CONT_SUCCES = "Все отлично! Можно продолжать работу"
const TX_CONT_ERROR = "Похоже вас забыли добавить в базу. Свяжитесь с менеджером"
const TX_CONT_FILE_ERROR = "Что-то пошло не так"
const TX_NO_ADMIN_ACCES = "У вас нед доступа к функциям менджера"

const TOKENS_FOLDER = 'auth-users'

// username can be empty!
export function getUserName(msg: any) {
    let name: String
    // console.log(msg.chat.username)
    if(msg.chat.username !== undefined) 
        name = msg.chat.username 
    else {
        const last = msg.chat.last_name !== undefined? msg.chat.last_name : ''
        name = msg.chat.first_name + last
    }
    return name
}

export function getLocalPhone(username:String) {
    try {
        let data = fs.readFileSync(TOKENS_FOLDER + '/' + username, 'utf8')
        const o = JSON.parse(data)
        return o.number
    } catch (error) {
        return null
    }
}

export default (msg:any, c: MainContext, checkManager?:Boolean) => {

    let username:String = getUserName(msg)

    // console.log(name)
    let res = null
    let manager = null

    try {
        let data = fs.readFileSync(TOKENS_FOLDER + '/' + username, 'utf8')
        const o = JSON.parse(data)
        res = o.number
        if (checkManager) {
            if(o.manager === undefined) {
                c.botUI.message(msg, TX_NO_ADMIN_ACCES)
                manager = null
            } else {
                manager = true
            }
        }
    } catch (error) {

        c.botUI.context(msg, ()=>{
            const opts = {
                reply_markup: { 
                    keyboard: [ //inline_keyboard not works!
                        [ { 
                            text: 'Отправить телефон', 
                            request_contact: true 
                        } ],
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            }
            c.botUI.message(msg, TX_CONT_REQUEST, opts)
        },{
            contact: async (msg:any)=>{     
                const PHN = msg.contact.phone_number    
                const tableSotrudniki = await c.tableUI.getList('Сотрудники',['#','Роль'])
                const ind = tableSotrudniki['#'].indexOf(String(PHN)) 
                if(ind !== -1){

                    // Сохранить chat.username & chat.id в базу
                    await c.tableUI.updateRow('Сотрудники', ind + 2, {'Username': username, 'ChatId': msg.chat.id}) // %%% проверять ошибки!
                    const isManager = tableSotrudniki['Роль'][ind] === 'Менеджер'? true:false

                    c.botUI.message(msg, TX_CONT_SUCCES)
                    let data:any = {number: PHN}
                    if(isManager) data.manager = true

                    fs.writeFile(TOKENS_FOLDER + '/' + username, JSON.stringify(data), (err:any)=>{
                        if(err) c.botUI.message(msg, TX_CONT_FILE_ERROR)
                    })

                } else {
                    c.botUI.message(msg, TX_CONT_ERROR)
                }  
            }
        })
    }

    if(checkManager) {
        return manager
    } else {
        return res
    }

}