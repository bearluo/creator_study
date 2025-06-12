import { _decorator, Component, EventTarget, Node,assert, sys } from 'cc';
import { FWFile } from '../../common/FWFile';

type FWDataBaseCtor = ()=>FWDataBase;
export const dataRegister:Map<string,FWDataBaseCtor> = new Map();

export function register(key:string,ctor:FWDataBaseCtor) {
    assert(!dataRegister.has(key),`${key} is already registered`)
    dataRegister.set(key,ctor);
}

export function unregister(key:string) {
    dataRegister.delete(key);
}

export class FWDataBase {
    private _data_file_key_ = '_data_';
    constructor(key:string) {
        this._data_file_key_ = this._data_file_key_ + key + "_";
    }

    /**
     * 保存浮点数
     * @param key 
     * @param number 
     */
    setFloat(key: string, number: number) {
        this.setItem(key, number.toString());
    }

    /**
     * 读取浮点数
     * @param key 
     * @returns 
     */
    getFloat(key: string): number {
        let n = this.getItem(key);
        return Number.parseFloat(n);
    }

    setInt(key: string, number: number) {
        this.setItem(key, number.toString());
    }
    
    getInt(key: string) {
        let n = this.getItem(key);
        return Number.parseInt(n);
    }

    setString(key: string, value: string) {
        this.setItem(key, value);
    }

    getString(key: string) {
        return this.getItem(key);
    }

    private setItem(key: string, value: string) {
        sys.localStorage.setItem(this._data_file_key_ + key, value);
    }

    private getItem(key: string) {
        return sys.localStorage.getItem(this._data_file_key_ + key);
    }
} 