import { DataBinding } from './DataBinding';
import type { DataBinding as IDataBinding } from '../core/types';

/**
 * 绑定管理器
 * 
 * 管理多个数据绑定
 */
export class BindingManager {
    private bindings: Set<DataBinding<any, any, any>> = new Set();
    
    /**
     * 添加绑定
     * @param binding 数据绑定
     */
    add(binding: DataBinding<any, any, any>): void {
        this.bindings.add(binding);
    }
    
    /**
     * 移除绑定
     * @param binding 数据绑定
     */
    remove(binding: DataBinding<any, any, any>): void {
        this.bindings.delete(binding);
        binding.destroy();
    }
    
    /**
     * 清除所有绑定
     */
    clear(): void {
        this.bindings.forEach(binding => binding.destroy());
        this.bindings.clear();
    }
    
    /**
     * 获取所有绑定
     */
    getAll(): ReadonlySet<DataBinding<any, any, any>> {
        return this.bindings;
    }
    
    /**
     * 获取绑定数量
     */
    get size(): number {
        return this.bindings.size;
    }
}
