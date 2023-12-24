import { MainContext } from '../../types/types';
declare const Manager: (msg: any, c: MainContext, end: () => any, updateData?: Boolean) => Promise<void>;
export default Manager;
