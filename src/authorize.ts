const fs = require('fs')
import { MainContext} from '../types/types'

const TX_CONT_REQUEST = 'Для продолжения работы нажмите "отправить телефон"'
const TX_CONT_SUCCES = "Все отлично! Можно продолжать работу"
const TX_CONT_ERROR = "Похоже вас забыли добавить в базу. Свяжитесь с менеджером"
const TX_CONT_FILE_ERROR = "Что-то пошло не так"
const TX_NO_ADMIN_ACCES = "У вас нед доступа к функциям менджера"

const TOKENS_FOLDER = 'auth-users'

//1000 * 60 * 60 * 24 * 1 //1 день
const CASHED_AUTH_TIMOUT = 1000 * 60 * 5 // Кэш 5 минут     
// const CASHED_AUTH_TIMOUT = 0 // Кэша нет

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

export default async (msg:any, c: MainContext, checkManager?:Boolean) => {

    let username:String = getUserName(msg)

    let auth = false
    try {
        let data = fs.readFileSync(TOKENS_FOLDER + '/' + username, 'utf8')
        const o = JSON.parse(data)

        let number = o.number
        let manager = o.manager
        let lastUse = o.lastTime 

        if(lastUse === undefined) lastUse = 0 // обратная совместимость
        
        //Если истек срок действия кэширования, то проверяем по таблице пользователя
        if(Date.now() - lastUse > CASHED_AUTH_TIMOUT) {
            // проверяем пользователя по таблице 
            // console.log('CASHED TIMEOUT')

            const userData = await c.tableUI.getList('Сотрудники', 
            ['#', 'Роль'],)

            // заполняем number и manager на основе данных из таблицы
            const numInd = userData['#'].indexOf(number)
            // console.log("numInd: " + numInd) 

            if(numInd === -1) {
                // Пользователь не найден, будет запрос
                // console.log("Пользователь не найден")
                number = undefined
                
            } else {
                // обновляем timestamp
                // console.log("Пользователь найден")

                // Уволен
                if(userData['Роль'][numInd] === 'Уволен') {
                    // console.log('УВОЛЕН')
                    number = undefined
                    o.number = undefined
                }
                
                if (checkManager) {
                    if(userData['Роль'][numInd] === 'Менеджер') {
                        // console.log('ПОЛЬЗОВАТЕЛЬ = МЕНЕДЖЕР')
                        manager = true
                        o.manager = true
                    } else {
                        manager = undefined
                        o.manager = undefined
                    }
                } 

                o.lastTime = Date.now()
                fs.writeFile(TOKENS_FOLDER + '/' + username, JSON.stringify(o), (err:any)=>{
                    if(err) c.botUI.message(msg, TX_CONT_FILE_ERROR)
                })
            }

        }

        if(!number) {

            // catch error. просим авторизоваться
            let err:any
            err.catchError

        } else {

            if (checkManager) {
                if(manager === undefined) {
                    // console.log('NOT MANAGER')
                    c.botUI.message(msg, TX_NO_ADMIN_ACCES)
                    auth = false
                } else {
                    // console.log('IS MANAGER')
                    auth = true
                }
            } else {
                auth = true
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
                if(ind !== -1 && tableSotrudniki['Роль'][ind] !== 'Уволен'){

                    // Сохранить chat.username & chat.id в базу
                    await c.tableUI.updateRow('Сотрудники', ind + 2, {'Username': username, 'ChatId': msg.chat.id}) // %%% проверять ошибки!
                    const isManager = tableSotrudniki['Роль'][ind] === 'Менеджер'? true:false

                    c.botUI.message(msg, TX_CONT_SUCCES)
                    let data:any = {number: PHN, lastTime: Date.now()}
                    if(isManager) data.manager = true

                    fs.writeFile(TOKENS_FOLDER + '/' + username, JSON.stringify(data), (err:any)=>{
                        if(err) c.botUI.message(msg, TX_CONT_FILE_ERROR)
                    })

                } else {
                    c.botUI.message(msg, TX_CONT_ERROR)
                }  
            }
        })

        return false
    }

    return auth

}