const GAuthorize = require('./gauth');
const {google} = require('googleapis');
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V']

module.exports = class Table {

    sheetId                 // id Google таблицы
    model                   // названия вкладок и колонок в таблице (1-ая строк)
    // {
    //     'Объекты': ['#', 'Название', 'Статус']
    // }

    constructor(sheetId, model) {
        this.sheetId = sheetId
        this.model = model
    }
    
    // getList вернет
    // props - список колонок, который нужен
    // {prop1: [values ..], 
    //  prop2: [values ..]},
    // sheet - String
    // props - [String...]

    _getCombinedRaneges (sheet, props) {

        // console.log(props)
        // console.log(sheet)

        let ranges = []
        props.forEach(async (prop) => {
            this.model[sheet].forEach(async (row,i)=>{
                if(row === prop) { 
                    // находим свойство по имени, узнаем его номер и узнаем букву
                    ranges.push(sheet + '!' + LETTERS[i] + '2:' + LETTERS[i])
                }   
            })
        })
        return ranges

    }

    async getList (sheet, props) {
        let result = null
        const auth = await GAuthorize()
        if(auth) { 
            const sheets = google.sheets({version: 'v4', auth})
            let ranges = this._getCombinedRaneges (sheet, props)
            // console.log(ranges)

            let obj = {} 

            // let randomError = ''
            // function randomIntFromInterval(min, max) { // min and max included 
            //     return Math.floor(Math.random() * (max - min + 1) + min)
            // }
            // if(randomIntFromInterval(1, 3) === 1) 
            //     randomError = "Error"

            // try {
                const res = await sheets.spreadsheets.values.batchGet({
                    spreadsheetId: this.sheetId,
                    ranges: ranges, 
                    majorDimension: 'COLUMNS' //+ randomError
                })

                // console.log(res.data.valueRanges)

                res.data.valueRanges.forEach((column, i)=>{
                    // column.values - может вообще не прийти если в range ячейки пустые
                    obj[props[i]] = column.values? column.values[0] : []
                })

                // console.log(res.data.valueRanges.values)
                // console.log(res.data.valueRanges[1])

            // } catch (error) {
                
            //     for(const val of props) {
            //         obj[val] = [] //генерим пустые массивы для props
            //     }

            // }         
            
            result = obj
        }
        return result     
    }

    // sheet - String
    // rows - [{prop:value...}, ...] //array
    // inserting data at the bottom of last data
    
    async insertRows (sheet, rows) {

        let result = null
        const auth = await GAuthorize()
        if(auth) {

            const sheets = google.sheets({version: 'v4', auth})
            // let ranges = _getCombinedRaneges (sheet, props)

            // this.model
            let modelRows = []
            for (const row of rows) {
                let orderedValues = [] //push values in the right order
                for(const colName of this.model[sheet]) {
                    if(row[colName] !== undefined) orderedValues.push(row[colName])
                    else orderedValues.push(null)
                }
                modelRows.push(orderedValues)
            }

            const res = await sheets.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: sheet + "!A2:" + LETTERS[this.model[sheet].length], //по длине с table model
                resource: {
                    values: modelRows
                },                
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS"
            })

            result = res

        } 
        return result   
    }

    // sheet - String
    // values - {prop:value...} //object
    // update data at the {rowNumber}

    async updateRow (sheet, rowNumber, values) {

        // console.log(rowNumber)
        let result = null
        const auth = await GAuthorize()
        if(auth) { 
            const sheets = google.sheets({version: 'v4', auth})

            let modelRows = []
            let orderedValues = [] //push values in the right order
            for(const colName of this.model[sheet]) {
                if(values[colName] !== undefined) orderedValues.push(values[colName])
                else orderedValues.push(null)
            }
            modelRows.push(orderedValues)

            const res = await sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                // Sheet1!1:2 refers to all the cells in the first two rows of Sheet1
                range: sheet + "!" + rowNumber + ":" + (rowNumber + 1),
                resource: {
                    values: modelRows
                },                
                valueInputOption: "USER_ENTERED",
                // insertDataOption: "INSERT_ROWS"
            })

            result = res
        }
        return result 
    }

    // находит строку в столбце propName, где выполняется условие = propValue и возвращает props столбцы
    // async getItem (sheet, propName, propValue, props) {
    //     let result = null
    //     let auth = await GAuthorize()
    //     if(auth) {
    //         const sheets = google.sheets({version: 'v4', auth})
    //         let ranges = []

    //         props.forEach(async (prop) => {
    //             this.model[sheet].forEach(async (row,i)=>{
    //                 if(row === prop) { 
    //                     // находим свойство по имени, узнаем его номер и узнаем букву
    //                     ranges.push(sheet + '!' + LETTERS[i] + '2:' + LETTERS[i])
    //                 }   
    //             })
    //         })
    //         // ... %%%% WORK MORE HERE!!!

    //     }
    //     return result  
    // }

    // props - список колонок, который нужен
    // async getElement (sheet, idKey, id, props = null) {

        
    // }
    

}