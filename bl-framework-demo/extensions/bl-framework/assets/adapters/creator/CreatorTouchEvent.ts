/**
 * Creator 触摸事件适配器
 * 将 Creator 的 EventTouch 适配到 ITouchEvent 接口
 */

import { EventTouch } from 'cc';
import { ITouchEvent } from '../../events/FWEvents';

/**
 * Creator 触摸事件适配器
 */
export class CreatorTouchEvent implements ITouchEvent {
    private event: EventTouch;
    
    constructor(event: EventTouch) {
        this.event = event;
    }
    
    getLocationX(): number {
        return this.event.getLocationX();
    }
    
    getLocationY(): number {
        return this.event.getLocationY();
    }
    
    getLocation(): [number, number] {
        return [this.event.getLocationX(), this.event.getLocationY()];
    }
    
    getID(): number {
        return this.event.getID();
    }
    
    getType(): string {
        return this.event.type;
    }
    
    /**
     * 获取 Creator 原生事件（用于需要直接访问 Creator API 的场景）
     */
    get nativeEvent(): EventTouch {
        return this.event;
    }
}

