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
    const arr = s.split(DECORATORS)
    const filtered = arr.filter(function (el) {
        return el !== '';
    })
    return filtered
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

    // console.log(strArr)
    // console.log(rows)

    let makeFound = (i:number)=>{

        if (rows['Доступность'][i] === "Исправен" && rows['Статус'][i] === 'Склад') {
            // console.log(`PUSH: ${rows['Auto #'][i]} : ${rows['Наименование'][i]} : ${rows['Описание'][i]}`)
            searchRes.push({
                id: rows['Auto #'][i],
                name: rows['Наименование'][i],
                desc: rows['Описание'][i],
                url: rows['Фото'][i]
            })
        } 

    }

    // поиск по ID, 100% - ое совпадение, приоритетный 

    strArr.forEach((str)=>{

        // console.log(str)
        // console.log(rows['Auto #'])
        const i = rows['Auto #'].indexOf(str)
        // console.log(i)
        // console.log(rows['Auto #'][i])
        if (i !== -1) {
            // console.log('HAPPEN')
            makeFound(i)
        }
    })

    // посик по name & desk
    rows['Auto #'].forEach((id:String, i:number) => {
        
        const name = rows['Наименование'][i]
        const desc = rows['Описание'][i]
        // const tid = rows['Auto #'][i]
        const nameEscaped = escape(name)
        const descEscaped = escape(desc)

        let found = false
        strArr.forEach((str)=>{
            if (nameEscaped.indexOf(str) != -1  || descEscaped.indexOf(str) != -1
                ) {
                found = true
            }
        })
        
        if (found) {
            makeFound(i)
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