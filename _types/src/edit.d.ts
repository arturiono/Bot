import { MainContext } from '../types/types';
declare const Edit: (msg: any, c: MainContext, end: (wasEdited: Boolean) => any, editingHappen: Boolean, usersTable?: any) => Promise<void>;
export default Edit;
