const TelegramBot = require('node-telegram-bot-api')
const TGTOKEN = "6287688949:AAFalubhPUjnzkiSBb3ESxnogmlOpqpQXgc"
const GAuthorize = require('./lib/gauth');
const {google} = require('googleapis');

let decorators = /[^a-zA-Zа-яА-ЯёЁ0-9]/g

function split(str) {
    const s = str.replace('ё','е').toLowerCase()
    return s.split(decorators)
}

function escape(str) {
    const s = str.replace('ё','е').toLowerCase()
    return s.replace(decorators, "")
}

const bot = new TelegramBot(TGTOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
})

// bot.on('')

async function search(auth, str) {

    // console.log(str);
    // console.log("- - -");
    let searchRes = []

    const sheets = google.sheets({version: 'v4', auth});
    const res = await sheets.spreadsheets.values.get({
    //   spreadsheetId: '16Z6opmCk2VnXFHraYIqdGhOTT_MJtQwIRHe3KPhNys0', // новый
    //   range: 'Инструмент!A2:E',
      spreadsheetId: '1CUkzkYhyUemZT5epEnx-SvTFHSDo6pbAHlscWNszezI', // новый
      range: 'Каталог ТМЦ!C2:G',
    });

    const strArr = split(str)
    // console.log(strArr)

    const rows = res.data.values;
    // console.log(rows)

    const idRow = 0 // 2
    const nameRow = 2 // 3
    const descRow = 4
    rows.forEach((row) => {
        
        // console.log(row)
        // console.log(row[nameRow])
        // console.log(row[descRow])

        const name = row[nameRow] ? row[nameRow] : '' //может быть undefined
        const desc = row[descRow] ? row[descRow] : '' //может быть undefined
        const id = row[idRow] //обязательное поле
        const nameEscaped = escape(name)
        const descEscaped = escape(desc)

        let foundAcc = strArr.length
        strArr.forEach((str)=>{

            if (nameEscaped.indexOf(str) != -1 || descEscaped.indexOf(str) != -1) {
                foundAcc --
            }
        })

        // console.log(foundAcc)
        
        if (foundAcc === 0) {
            // console.log(`${id} : ${row[nameRow]} : ${row[descRow]}`)
            searchRes.push({
                id: id,
                name: name,
                desc: desc
            })
        } 
        
        // str.includes(searchString[, position])
    });
    
    return searchRes
}

bot.on("message", (msg)=>{
    
    GAuthorize().then(async(auth)=>{
        
        const searchLimit = 5
        let searchRes = await search(auth, msg.text)
        // console.log(searchRes)

        if (searchRes.length) {

            await bot.sendMessage(msg.chat.id, 'Найдено ' + searchRes.length + ' (лимит ' + searchLimit +')')
            searchRes.forEach((o, i, a)=>{

                if (i >= searchLimit) return //ограничить вывод поиска до 5
                const opts = {
                    reply_markup: {
                        inline_keyboard: [ [ { text: 'Добавить', callback_data: o.id }] ]
                    }
                }
                bot.sendMessage(msg.chat.id, 
                    `${o.name}\n${o.desc}`, opts)
            })
        } else {
            bot.sendMessage(msg.chat.id, "По вашему запросу ничего не найдено")
        }

    }).catch(console.error);
})

bot.onText(/\/search (.+)/, (msg, [, match] )=> {
    const {id} = msg.chat
    // bot.sendMessage(id,'search: ' + match)

})

bot.on('callback_query', query => {
    console.log(query)
    // bot.answerCallbackQuery(query.id, )
    bot.sendMessage(query.message.chat.id, 'Добавлено. Id: ' + query.data)
})


// Authorize().then((auth)=>search(auth, "дрель Makita")).catch(console.error);
