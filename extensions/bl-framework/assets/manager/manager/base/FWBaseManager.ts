import { _decorator, Component, EventTarget, Node,assert, Eventify } from 'cc';
import { manager } from 'db://bl-framework/common/FWConstant';
const { ccclass, property } = _decorator;


type FWBaseManagerCtor = ()=>FWBaseManager;
export const managerRegister:Map<string,FWBaseManagerCtor> = new Map();

export function register(key:string,ctor:FWBaseManagerCtor) {
    assert(!managerRegister.has(key),`${key} is already registered`)
    managerRegister.set(key,ctor);
}

export function unregister(key:string) {
    managerRegister.delete(key);
}

@ccclass('FWBaseManager')
export class FWBaseManager extends Eventify(EventTarget) {

    public constructor() {
        super();
        manager.push(this);
    }

    __preload():void {

    }

    start(): void {
    }

    update(deltaTime: number): void {
    }

    dectroy(): void {
        let index = manager.indexOf(this);
        if (index != -1) {
            manager.splice(index, 1);
        }
        this.onDestroy();
    }

    onDestroy() {
        
    }
}
