import { MainContext } from '../types/types';
interface SearchItem {
    id: String;
    name: String;
    desc: String;
}
interface SearchArr extends Array<SearchItem> {
}
declare const _default: (c: MainContext, str: String) => Promise<SearchArr>;
export default _default;
