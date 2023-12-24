import { MainContext } from '../../types/types';
declare const Notify: (msg: any, c: MainContext, text: String, usersTable: any, phone: String | null) => Promise<void>;
export default Notify;
