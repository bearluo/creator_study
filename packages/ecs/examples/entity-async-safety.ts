/**
 * Entity 异步安全使用示例
 * 
 * 演示如何在异步操作中安全地使用实体
 */

import { World, Entity, Handle } from '../src/index';

// ==================== 示例 1: 使用 Entity.handle getter ====================

async function example1_EntityHandleGetter(world: World) {
    console.log('=== 示例 1: Entity.handle getter ===');
    
    // 创建实体
    const entity = world.createEntity('async-entity');
    
    // ✅ 正确：保存 Handle 而不是 Entity 对象
    const handle = entity.handle;
    if (!handle) {
        console.error('无法创建 Handle');
        return;
    }
    
    console.log('创建实体 Handle:', handle);
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 通过 Handle 验证并获取实体
    const currentEntity = world.getEntityByHandle(handle);
    if (currentEntity) {
        console.log('✅ 实体仍然有效:', currentEntity.id);
    } else {
        console.log('❌ 实体已被销毁或复用');
    }
}

// ==================== 示例 2: 使用辅助函数（函数式风格） ====================

async function example2_HelperFunctions(world: World) {
    console.log('\n=== 示例 2: 辅助函数 ===');
    
    import { createEntityHandle, getEntityByHandle, isValidHandle } from '../src/utils/entityHandle';
    
    const entity = world.createEntity('functional-entity');
    
    // ✅ 使用辅助函数
    const handle = createEntityHandle(entity);
    if (!handle) {
        console.error('无法创建 Handle');
        return;
    }
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证 Handle 有效性
    if (isValidHandle(world, handle)) {
        const currentEntity = getEntityByHandle(world, handle);
        if (currentEntity) {
            console.log('✅ 实体有效:', currentEntity.id);
        }
    } else {
        console.log('❌ Handle 已失效');
    }
}

// ==================== 示例 3: Promise 链中使用 Handle ====================

async function example3_PromiseChain(world: World) {
    console.log('\n=== 示例 3: Promise 链 ===');
    
    const entity = world.createEntity('promise-entity');
    const handle = entity.handle;
    if (!handle) return;
    
    // 模拟 API 调用
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            const currentEntity = world.getEntityByHandle(handle);
            if (currentEntity) {
                console.log('✅ 数据已设置到实体:', currentEntity.id);
                // currentEntity.addComponent(DataComponent).data = data;
            } else {
                console.log('❌ 实体已失效，无法设置数据');
            }
        })
        .catch(error => {
            console.error('API 调用失败:', error);
        });
}

// ==================== 示例 4: 实体在异步期间被销毁 ====================

async function example4_EntityDestroyedDuringAsync(world: World) {
    console.log('\n=== 示例 4: 实体在异步期间被销毁 ===');
    
    const entity = world.createEntity('temp-entity');
    const handle = entity.handle;
    if (!handle) return;
    
    console.log('创建实体 Handle:', handle);
    
    // 启动异步操作
    const asyncOp = new Promise(resolve => {
        setTimeout(() => resolve('async completed'), 200);
    });
    
    // 在异步操作进行中销毁实体
    setTimeout(() => {
        console.log('销毁实体...');
        world.destroyEntity(entity.id);
    }, 100);
    
    // 等待异步操作完成
    await asyncOp;
    
    // 尝试获取实体
    const currentEntity = world.getEntityByHandle(handle);
    if (currentEntity) {
        console.log('✅ 实体仍然有效（不应该发生）');
    } else {
        console.log('✅ 正确检测到实体已被销毁');
    }
}

// ==================== 示例 5: 批量异步操作 ====================

async function example5_BatchAsyncOperations(world: World) {
    console.log('\n=== 示例 5: 批量异步操作 ===');
    
    // 创建多个实体
    const entities = [
        world.createEntity('entity-1'),
        world.createEntity('entity-2'),
        world.createEntity('entity-3'),
    ];
    
    // 创建所有 Handle
    const handles = entities
        .map(e => e.handle)
        .filter((h): h is Handle => h !== undefined);
    
    console.log('创建了', handles.length, '个 Handle');
    
    // 批量异步操作
    await Promise.all(
        handles.map(async (handle, index) => {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const entity = world.getEntityByHandle(handle);
            if (entity) {
                console.log(`✅ 实体 ${index + 1} 有效:`, entity.id);
            } else {
                console.log(`❌ 实体 ${index + 1} 已失效`);
            }
        })
    );
}

// ==================== 示例 6: 错误用法对比 ====================

async function example6_WrongUsage(world: World) {
    console.log('\n=== 示例 6: 错误用法对比 ===');
    
    // ❌ 错误：直接持有 Entity 对象
    const entityWrong = world.createEntity('wrong-entity');
    
    // ✅ 正确：保存 Handle
    const entityCorrect = world.createEntity('correct-entity');
    const handle = entityCorrect.handle;
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ❌ 错误：直接使用 Entity 对象（可能已被复用）
    console.log('❌ 错误用法: entityWrong.id =', entityWrong.id);
    // 此时 entityWrong 可能已经代表另一个实体了！
    
    // ✅ 正确：通过 Handle 验证
    if (handle) {
        const currentEntity = world.getEntityByHandle(handle);
        if (currentEntity) {
            console.log('✅ 正确用法: 通过 Handle 获取实体:', currentEntity.id);
        }
    }
}

// ==================== 主函数 ====================

async function main() {
    const world = new World({ debug: true });
    
    try {
        await example1_EntityHandleGetter(world);
        await example2_HelperFunctions(world);
        // example3_PromiseChain(world); // 需要实际的 API 端点
        await example4_EntityDestroyedDuringAsync(world);
        await example5_BatchAsyncOperations(world);
        await example6_WrongUsage(world);
    } catch (error) {
        console.error('示例执行失败:', error);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

export {
    example1_EntityHandleGetter,
    example2_HelperFunctions,
    example3_PromiseChain,
    example4_EntityDestroyedDuringAsync,
    example5_BatchAsyncOperations,
    example6_WrongUsage,
};
