import BotUI from '../lib/bot-ui'

type IdNamePair = {
    id: Number
    name: String
}

export type IdNamePairArray = Array<IdNamePair>

export interface Data {
    [key: string]: ABReqest //key - chatId
} 

export type MainContext = {
    tableUI: any
    botUI: BotUI
    data: Data
}

export interface Rashodniki {
    [key: string]: {
        name:string, 
        count: number
    }
} 

export interface Tools {
    [key: string]: string //ключ - ID, значение - 'Наименование'
} 

export type Status = 'Обработка' | 'Собран' | 'Доставка' | 'Объект' | 'Склад' | 'Отмена' //Отмена не доступен в журнале инструмента
export type JournalToolStatus = 'Заявка' | 'Объект' | 'Склад'
export type RequestType = 'Со склада' | 'Возврат' | 'Между объектами' | 'Свободная'

export type ABReqest = {
    id: string | 'Null' // Null - при создании новой заявки (когда еще не сохранил)
    type: RequestType
    status: Status
    from: string 
    to: string
    delivery: 'Да' | 'Нет'
    dateTime: string | 'По готовности' // unix time, одиночная time zone (+3)
    tools: Tools
    rashodniki: Rashodniki
    comment: string | 'Null'
    user: string // #телефон пользователя
    dateCreated: string | 'Null' // Null - при создании новой заявки (когда еще не сохранил)
}