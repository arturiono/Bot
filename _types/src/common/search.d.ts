import { MainContext, Tools } from '../../types/types';
interface SearchItem {
    id: String;
    name: String;
    desc: String;
    url: String;
}
interface SearchArr extends Array<SearchItem> {
}
export declare function SearchToolsByIds(c: MainContext, idsStr: String): Promise<SearchArr>;
export declare function SearchToolsByStr(c: MainContext, str: String): Promise<SearchArr>;
export declare function GetToolsByIds(c: MainContext, ids: Tools | undefined): Promise<SearchArr>;
export {};
