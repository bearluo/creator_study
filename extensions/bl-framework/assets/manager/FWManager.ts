import { assert, instantiate, sys } from "cc";
import { managerRegister } from "./manager/base/FWBaseManager";
import { manager } from "../common/FWConstant";

export class FWManager extends EventTarget {

    constructor() {
        super();
        globalThis.manager = this as any;
    }

    initManager() {
        managerRegister.forEach((element,key) => {
            this[key] = element();
        });
    }
    
    __preload() {
        manager.forEach(element => {
            element.__preload();
        });
    }

    start() {
        manager.forEach(element => {
            element.start();
        });
    }

    update(deltaTime: number): void {
        manager.forEach(element => {
            element.update(deltaTime);
        });
    }

    dectroy() {
        let old = Array.from(manager);
        manager.length = 0;
        old.forEach(element => {
            element.dectroy();
        });
    }
}

