import { MainContext, Status } from '../../types/types';
export declare function saveRequestSatus(msg: any, c: MainContext, status: Status, zayavkaId: String): Promise<void>;
export declare function saveRequest(msg: any, c: MainContext, zayavkaId?: string): Promise<void>;
