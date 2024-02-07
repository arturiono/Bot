import { MainContext } from '../../types/types';
interface cashedData {
    zayavkiTable: any;
    usersTable: any;
    objectsTable: any;
}
declare const Manager: (msg: any, c: MainContext, end: () => any, cashedData?: cashedData) => Promise<void>;
export default Manager;
