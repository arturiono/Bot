export type MainContext = {
    tableUI: any;
    botUI: any;
};
export type ABReqest = {
    objectId?: string | 'custom';
    type?: 'self' | 'delivery';
    time?: number;
    tools?: Array<number>;
    materials?: Array<number>;
    comment?: String;
};
export type FreeRequest = {};
