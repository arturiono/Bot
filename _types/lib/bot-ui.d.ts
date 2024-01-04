export default class BotUI {
    bot: any;
    events: any;
    replyContext: any;
    replyContextMsg: any;
    messagesToRemove: any;
    constructor(token: any, opt: any, events: any);
    catch(msg: any, e: any): Promise<void>;
    commands(obj: any): void;
    context(msg: any, question: any, replyObj: any): Promise<void>;
    message(msg: any, text: any, opt?: any, customChatId?: any): Promise<any>;
    editMessage(msg: any, msgId: any, text: any, opt: any, customChatId?: any): Promise<void>;
    markToDelete(msg: any, messageId: any): Promise<void>;
    delete(msg: any, messageId: any): Promise<void>;
    deleteFromMarked(msg: any, messageId: any): Promise<void>;
    deleteAllMarked(msg: any): Promise<void>;
}
