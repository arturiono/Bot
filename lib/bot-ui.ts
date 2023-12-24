import TelegramBot from 'node-telegram-bot-api'

// msg - used to get chatId to separate users reqests and conext between

export default class BotUI {

    bot:any                     // оригинальный бот
    // chatId:any               // --- берем из msg, chatId из последнего сообщения
    // lastMessage:any          // --- берем из msg, хранит последнее сообщение
    events:any                  // типы поддерживаемых callbacks
    
    // chatId specific arrays
    replyContext:any = {}
    messagesToRemove:any = {}   // сообщения которые накапливаем через opt.mark_to_remove = true
    
    constructor(token:any, opt:any, events:any) {  

        this.events = events
        this.bot = new TelegramBot(token, opt) 
        // console.log(this.bot)

        // обработчик для любого события message, callback_query, contact и пр.
        events.forEach((event:any)=>{
            this.bot.on(event, (obj:any)=>{
                
                let callbackChatId = ''
                if(event === 'message') callbackChatId = String(obj.chat.id)
                if(event === 'callback_query') callbackChatId = String(obj.message.chat.id)
                if(event === 'contact') callbackChatId = String(obj.chat.id)

                if(this.replyContext[callbackChatId] && 
                    this.replyContext[callbackChatId][event] && 
                    typeof this.replyContext[callbackChatId][event] == 'function') {
                    // console.log('CALLED EVENТ:')
                    // console.log(event)
                    this.replyContext[callbackChatId][event](obj)
                }  

                return
                
            })    
        })

    }

    commands (obj:any) { //user, 
        Object.keys(obj).forEach(key => {
                this.bot.onText(new RegExp(`\/${key}`), (msg:any)=>{
                    // this.lastMessage = msg
                    // this.chatId = msg.chat.id //сохраняем каждый раз
                    obj[key].call(null, msg)
                })
        })
        
    }

    // создаёт новый контекст для перехвата ответов
    async context(msg:any, question:any, replyObj:any) {
        await question.call() 
        // %%% - важно! не происходит перехват событий которые не были заменены в новом контексте
        // woraround - resetContext???
        // %%%%!!!! Clear Conntextex memory!
        this.replyContext[msg.chat.id] = replyObj
    }

    // обертка для telegram sendMessage
    async message(msg:any, text:any, opt:any = undefined, customChatId:any = undefined) {

        // добавялем markdown по умолчанию
        const nopt = (opt !== null && opt !==undefined )? opt : {}
        nopt.parse_mode = 'Markdown'
        
        const chatId = customChatId? customChatId : msg.chat.id
        const nmsg = await this.bot.sendMessage(chatId, text, nopt)

        // заводим сразу массив для удаления сообещений
        if(!this.messagesToRemove[msg.chat.id])
                this.messagesToRemove[msg.chat.id] = []

        if(opt && opt.mark_to_remove) {
            this.messagesToRemove[msg.chat.id].push(nmsg.message_id)
        }            

        return nmsg
    }

    // text possible null
    // customChatId? - optional
    // spport reply_markup in opt
    async editMessage(msg:any, msgId:any, text:any, opt:any, customChatId:any = undefined) {
        
        const nopt = (opt!== undefined && opt !==null )? opt : {}
        nopt.parse_mode = 'Markdown' // add markdown by default
 
        const chatId = customChatId? customChatId : msg.chat.id
        if(chatId) {

                if(text !== null) 
                try { //!!! Телеграм ругается если прихояд дубликат текста
                    await this.bot.editMessageText(text, {
                        chat_id: chatId, 
                        message_id: msgId,
                        ...nopt
                    })
                } catch (err) {
                    // %%% DEBUG MODE
                    // console.log("ERROR. editMessageText (possible duplicate)") //only for debug 
                }

                try { //!!! Телеграм ругается если прихояд дубликаты кнопок
                    if(opt !== undefined && opt !== null && nopt.reply_markup !== null)
                        await this.bot.editMessageReplyMarkup(nopt.reply_markup, {
                            chat_id: chatId,
                            message_id: msgId
                        })
                } catch (err) {
                    // %%% DEBUG MODE
                    // console.log("ERROR. editMessageReplyMarkup (possible duplicate)") //only for debug 
                }

        } else console.log('Chat ID was not defined before')

    }

    async markToDelete(msg:any, messageId:any) {
        this.messagesToRemove[msg.chat.id].push(messageId)
    }

    async delete(msg:any, messageId:any) {
        if(!this.messagesToRemove[msg.chat.id]) {
            console.log('messagesToRemove для ' + msg.chat.id + ' не был создан')
            return
        }
            
        const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId)
        // console.log(messageId)
        // console.log(this.messagesToRemove[msg.chat.id])
        // console.log('INDEX: ' + ind)
        if(ind !== -1) {
            // console.log(messageId)
            // console.log(msg.chat.id)
            this.messagesToRemove[msg.chat.id].splice(ind, 1)   
        } 
            
        await this.bot.deleteMessage(msg.chat.id, messageId)
        
    }

    async deleteFromMarked(msg:any, messageId:any) {
        const ind = this.messagesToRemove[msg.chat.id].indexOf(messageId)
        if(ind !== -1) {
            this.messagesToRemove[msg.chat.id].splice(ind, 1)
        }
    }

    async deleteAllMarked(msg:any) {
        // console.log(this.messagesToRemove)
        if(this.messagesToRemove[msg.chat.id] === undefined)
            return

        const copyMessagesToRemove = this.messagesToRemove[msg.chat.id].slice() //clone because of issue
        for (const mid of copyMessagesToRemove)
            this.delete(msg, mid)
    }

}

    /*
    // используется для сброса конттекста в самом конце
    async resetContext() {
        // сбрасываем все типы callback events context to zero
        let emptyCallBack = {}
        Object.keys(this.events).forEach(key => {
            emptyCallBack[key] = ()=>{}
        })
        this.context(msg, ()=>{}, emptyCallBack)
    }
    */
