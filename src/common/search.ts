import { MainContext, Tools} from '../../types/types'

interface SearchItem {
    id: String
    name: String
    desc: String
    url:String
}
interface SearchArr extends Array<SearchItem>{}

const DECORATORS = /[^a-zA-Zа-яА-ЯёЁ0-9]/g

function split(str:String) {
    // if(str === undefined) return ['']
    const s = str.replace('ё','е').toLowerCase()
    return s.split(DECORATORS)
}

function escape(str:String) {
    if(str === undefined) return ''
    const s = str.replace('ё','е').toLowerCase()
    return s.replace(DECORATORS, "")
}

// поиск по строке
export async function SearchToolsByStr(c: MainContext, str:String) {

    let searchRes:SearchArr = []
    const rows = await c.tableUI.getList('Инструмент',['Auto #', 'Наименование', 'Описание', 'Фото', 'Статус', 'Доступность'])
    const strArr = split(str)

    // console.log(rows)

    rows['Auto #'].forEach((id:String, i:number) => {
        
        const name = rows['Наименование'][i]
        const desc = rows['Описание'][i]
        const nameEscaped = escape(name)
        const descEscaped = escape(desc)

        let foundAcc = strArr.length
        strArr.forEach((str)=>{
            if (nameEscaped.indexOf(str) != -1 || descEscaped.indexOf(str) != -1) {
                foundAcc --
            }
        })
        
        if (foundAcc === 0 && rows['Доступность'][i] === "Исправен" && rows['Статус'][i] === 'Склад') {
            // console.log(`${id} : ${row[nameRow]} : ${row[descRow]}`)
            searchRes.push({
                id: id,
                name: name,
                desc: desc,
                url: rows['Фото'][i]
            })
        } 
        
    })
    
    return searchRes
}

// посик по массиву id-шникоы
export async function GetToolsByIds(c: MainContext, ids:Tools|undefined) {

    let searchRes:SearchArr = []
    const rows = await c.tableUI.getList('Инструмент',['Auto #', 'Наименование', 'Описание', 'Фото'])

    for(const reqId in ids) {
        let i = 0
        for(const id of rows['Auto #']) {    
            if (reqId === id) {
                searchRes.push({
                    id: id,
                    name: rows['Наименование'][i],
                    desc: rows['Описание'][i],
                    url: rows['Фото'][i]
                })
                continue
            }
            i++
        }
    } 

    return searchRes
}