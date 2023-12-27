import {MainContext, ABReqest} from '../../types/types'

// usersTable - данные о имени сотрудника
export function dataToMessage (data:ABReqest, showName?:boolean, usersTable?:any) {

    // %%% Получить 'Обьекты' для вывода названия Обьектов

    let str = ''

    if(showName && usersTable) {

        const ind = usersTable['#'].indexOf(data.user)

        let name = 'Пользователь был удален'
        if(ind !== -1) {
            name = usersTable['ФИО'][ind]
        }
    
        str += name + ' (' + data.user + ')' + '\n'
        str += ' - - - ' + '\n'
    }

    // специальная иконка для статуса Отмена    
    const sticon = data.status === 'Отмена'? '⛔️' : 
                   data.status === 'Склад'? '✅' : 
                   data.status === 'Объект' ? '✅' : 
                   data.status === 'Собран' ? '✅' :
                   data.status === 'Доставка' ? '🚙' : '⏱️'
    

    if(data.id !== 'Null') 
    str += '# ' + data.id + '\n'
    str += 'Статус: '+ sticon +' *' + data.status + '*\n'
    str += 'Тип: *' + data.type + '*\n'
    str += 'Доставка: *' + data.delivery + '*\n'
    str += 'Дата и время: *' + data.dateTime + '*\n'

    if(data.type !== 'Свободная') {

        // %%% получить назание объекта
        const from:String = data.from === '0' ? 'Склад' : data.from 
        const to:String = data.to === '0' ? 'Склад' : data.to 
        str += 'Точка А: *' + from + '*\n'
        str += 'Точка B: *' + to + '*\n'

        if(Object.values(data.tools).length !==0)
            str += 'Инструмент: *' + Object.values(data.tools).map(function(item:any, index:any) {
                const space = index === 0? '' : ' ' 
                return space + item
            }) + '*\n'
        else    
            str += 'Инструмент: *нет инструмента*\n'

        if(Object.values(data.rashodniki).length !==0)    
            str += 'Расходники: *' + Object.values(data.rashodniki).map(function(item:any, index:any) {
                const space = index === 0? '' : ' ' 
                return space + item.name + ': ' + item.count
            }) + '*\n'
    }

    if (data.comment !== 'Null')
        str += 'Комментарий: *' + data.comment + '*\n'
    
    if (data.dateCreated !== 'Null')
        str += 'Создана: ' + data.dateCreated + '\n'
    
    // console.log(str)

    return str

}

export function zayavkaToData(i: number, allZayavkiObj: any) {
    
    let data:ABReqest = {
        id: allZayavkiObj['#'][i],
        dateCreated: allZayavkiObj['Дата созд.'][i],
        type: allZayavkiObj['Тип'][i],
        delivery: allZayavkiObj['Доставка'][i],
        dateTime: allZayavkiObj['Ожидаемая дата/время'][i],
        status: allZayavkiObj['Статус'][i],
        user: allZayavkiObj['Cотрудник'][i],
        from: allZayavkiObj['Объект A'][i],
        to: allZayavkiObj['Объект B'][i],
        tools: JSON.parse(allZayavkiObj['Инструмент'][i]),
        rashodniki: JSON.parse(allZayavkiObj['Расходники'][i]),
        comment: allZayavkiObj['Комментарий'][i]
    }

    // ['#', 'Тип', 'Доставка', 'Ожидаемая дата/время', 'Статус', 'Cотрудник', 'Объект A', 'Объект B', 'Инструмент', 'Расходники', 'Комментарий', 'Дата созд.', 'Дата изм.'],
    // %% записать сюда данные обратно с заявки

    return data
}