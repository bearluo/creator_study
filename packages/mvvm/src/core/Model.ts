import type { IModel } from './types';

/**
 * 数据模型
 * 
 * 管理应用数据和业务逻辑
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     level: number;
 *     health: number;
 * }
 * 
 * class PlayerModel extends Model<PlayerData> {
 *     constructor(data: PlayerData) {
 *         super(data);
 *     }
 *     
 *     validate(): boolean {
 *         return this.data.health >= 0 && this.data.health <= 100;
 *     }
 * }
 * ```
 */
export class Model<T = any> implements IModel<T> {
    protected _data: T;
    
    constructor(data: T) {
        this._data = data;
    }
    
    /**
     * 获取数据
     */
    get data(): T {
        return this._data;
    }
    
    /**
     * 验证数据
     * 子类可以重写此方法实现自定义验证逻辑
     */
    validate(): boolean {
        return true;
    }
    
    /**
     * 序列化为 JSON
     */
    toJSON(): any {
        return JSON.parse(JSON.stringify(this._data));
    }
    
    /**
     * 从 JSON 反序列化
     */
    fromJSON(json: any): void {
        this._data = json;
    }
}
