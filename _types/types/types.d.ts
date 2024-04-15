import BotUI from '../lib/bot-ui';
declare type IdNamePair = {
    id: Number;
    name: String;
};
export declare type IdNamePairArray = Array<IdNamePair>;
export interface Data {
    [key: string]: ABReqest;
}
export declare type MainContext = {
    tableUI: any;
    botUI: BotUI;
    data: Data;
};
export interface Rashodniki {
    [key: string]: {
        name: string;
        count: number;
        over: number;
        units: string;
        reserved?: number;
    };
}
export interface Tools {
    [key: string]: string;
}
export declare type Status = 'Обработка' | 'Собран' | 'Доставка' | 'Объект' | 'Склад' | 'Отмена';
export declare type JournalToolStatus = 'Заявка' | 'Объект' | 'Склад';
export declare type RequestType = 'Со склада' | 'Возврат' | 'Между объектами' | 'Свободная';
export declare type ABReqest = {
    id: string | 'Null';
    type: RequestType;
    status: Status;
    from: string;
    to: string;
    delivery: 'Да' | 'Нет';
    dateTime: string | 'По готовности';
    tools: Tools;
    rashodniki: Rashodniki;
    comment: string | 'Null';
    user: string;
    dateCreated: string | 'Null';
};
export {};
