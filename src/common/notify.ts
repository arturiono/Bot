import { MainContext } from '../../types/types'

// 1) Уведомить админимстратора (из боты мастера)
// 2) Уведомить пользователя, зная его телефон (из бота менджера)

// if phone not defined Notify Manager
const Notify =  async (msg:any, c: MainContext, text:String, usersTable:any,  phone:String | null) => {

    // let usersTable = await c.tableUI.getList('Сотрудники', ['#', 'Роль', 'ChatId'])
    // console.log(usersTable)
    // console.log('- - -')

    if(phone === null) { //уведмление менджера
        const ind = usersTable['Роль'].indexOf('Менеджер')
        if(ind !== -1) {
            const chatId = usersTable['ChatId'][ind]
            if(chatId !== '') { // все хорошо!
                await c.botUI.message(msg, text, undefined, chatId)
            } else {
                await c.botUI.message(msg, 'Ошибка. Менеджер не зарегистрирован в системе. Свяжитесь пожалуйста с руководителем.')
            }
        } else {
            // %%% уведомлять разработчика/владельца бизнеса, что не добавлен менеджер
            await c.botUI.message(msg, 'Ошибка. Роль менджера не указана в списке сотрудников. Свяжитесь пожалуйста с руководителем.')
        }
    } else { //уведомление мастера

        const ind = usersTable['#'].indexOf(phone)
        if(ind !== -1) {

            const chatId = usersTable['ChatId'][ind]
            if(chatId !== '') { // все хорошо!
                await c.botUI.message(msg, text, undefined, chatId)
            } else {
                await c.botUI.message(msg, 'Ошибка. Мастер не зарегистрирован в системе. Свяжитесь пожалуйста с руководителем.')
            }

        } else {
            console.log('ошибка, пользователь для Notify не найден')
        }
    }
    
}

export default Notify