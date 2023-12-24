import { MainContext} from '../../types/types'
import {getLocalPhone, getUserName} from '../authorize'

const TX_INITIAL_MESSAGE_NO_TOOLS = 'У вас нет инструмента на объектах.'

export default async (msg:any, c: MainContext, end:()=>any) => {

    const user = getLocalPhone(getUserName(msg))  
    const toolsOrderedByRequests:any = {}
    const objectsById:any = {}
    
    const toolsData = await c.tableUI.getList('Инструмент', 
        ['Auto #', 'Статус' , 'Наименование', 'Описание', 'Объект', 'Местонахождение', 'Сотрудник', 'Заявка'])

    let found = false    
    for (const [i, dataUser] of toolsData['Сотрудник'].entries()) {
        if(dataUser === user && toolsData['Статус'][i] !== 'Заявка') {
            const objectID = toolsData['Объект'][i]
            if(toolsOrderedByRequests[objectID] === undefined) {
                toolsOrderedByRequests[objectID] = []
                objectsById[objectID] = toolsData['Местонахождение'][i]
            }
            toolsOrderedByRequests[objectID].push(i)
            found = true
        }
    } 

    if(found === false) {
        await c.botUI.message(msg, TX_INITIAL_MESSAGE_NO_TOOLS, {mark_to_remove: true})
        return
    }

    // console.log(toolsOrderedByRequests)

    for (const objectID in toolsOrderedByRequests) {
        await c.botUI.message(msg, "- - - *" + objectsById[objectID] + "* - - -", {mark_to_remove: true})
        let msgStr = ""
        for(const ind of toolsOrderedByRequests[objectID]) {
            msgStr += "*"+ toolsData['Наименование'][ind] + "* | "
            msgStr += toolsData['Описание'][ind] + "\n"
            msgStr += "Статус: *"+ toolsData['Статус'][ind] + "*\n"
            msgStr += "\n"
        }
        await c.botUI.message(msg, msgStr, {mark_to_remove: true})
    }

    // console.log(toolsOrderedByRequests)


}