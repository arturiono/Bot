import { MainContext } from '../../types/types';
interface cashedData {
    zayavkiTable: any;
    usersTable: any;
    objectsTable: any;
}
declare const Manager: (msg: any, c: MainContext, end: () => any, cashedData?: cashedData | undefined) => Promise<void>;
export default Manager;
