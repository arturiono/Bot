
// botui.context(msg, ()=>{
//     botui.message(msg, "Стартуем! Как тебя зовут?")
// },{
//     message: (text)=>{

//     },
//     callback_query: (data)=>{

//     },
//     contact: (ctx) => {
//         // ctx.update.message.contact
//     }
// })


// // -- 


// const TelegramBot = require('node-telegram-bot-api')
// const BotUI = require('./bot-ui')
// const botui = new BotUI(TGTOKEN, bot, {
//     polling: {
//         interval: 300,
//         autoStart: true,
//         params: {
//             timeout: 10
//         }
//     }
// })

// botui.onFirstLaunch(()=>{ //получе chatId после первого входа
//     botui.message(msg, 'Добро пожаловать! Этот бот умеет многое')
// })

// let continueFlow = ()=>{
//     botui.message(msg, 'Для продолжения выберите одну из основнфх клмманд в меню "/"',()={
//         //ничего не делаем, блокируем все предыдущие котексты
//     })
// }

// botui.onCommand([ 
//     {'Новая заявка': ()=>{ //режим работы с новой заявкой
//         botui.buttonsMessage('Выберите тип заявки', 
//         [
//             {'Доставка на объект':'toObj'},
//             {'Возврат товара на склад':'toSklad'},
//             {'Перкинуть на другой объект':'objToObj'},
//             {'В свободной форме':'free'},
//         ], 
//         (reply)=>{ //reply can be value from button or message

//             switch (reply) {
//                 case "toObj":
                    
//                     let objects = []

//                     botui.message(msg, 'Режим заказа доставки на объект') 
//                     botui.buttonsMessage('Выберите объект', objects, (reply)={

//                         if (objects[{reply}] !== undefined) { //если в списке

//                         } else if (reply=='Выйти') {
//                             continueFlow()
//                         }    
                            
//                         } else {
//                             // как выйти из режима?
//                             botui.buttonsMessage('Выберите из списка, для выхода наберите сообщение "Выйти"')
//                         }                     

//                     } ) 

//                     break;
//                 default: //any other message


//                     break;
//             }

//         })
//     }},
//     {'Мои заявки': ()=>{

//     }},
//     {'&': ()=>{ // any other commands
//         continueFlow()
//     }},
// ])
