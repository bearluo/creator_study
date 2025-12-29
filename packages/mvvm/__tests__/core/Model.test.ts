import { Model } from '../../src/core/Model';

describe('Model', () => {
    describe('基础功能', () => {
        it('应该创建模型', () => {
            const data = { name: 'John', age: 30 };
            const model = new Model(data);
            
            expect(model.data).toEqual(data);
            expect(model.data.name).toBe('John');
            expect(model.data.age).toBe(30);
        });
        
        it('应该支持泛型类型', () => {
            interface UserData {
                name: string;
                age: number;
            }
            
            const data: UserData = { name: 'John', age: 30 };
            const model = new Model<UserData>(data);
            
            expect(model.data.name).toBe('John');
            expect(model.data.age).toBe(30);
        });
    });
    
    describe('验证', () => {
        it('应该默认通过验证', () => {
            const model = new Model({ name: 'John' });
            expect(model.validate()).toBe(true);
        });
        
        it('应该允许子类重写验证逻辑', () => {
            class ValidatedModel extends Model<{ age: number }> {
                validate(): boolean {
                    return this.data.age >= 0 && this.data.age <= 120;
                }
            }
            
            const validModel = new ValidatedModel({ age: 30 });
            expect(validModel.validate()).toBe(true);
            
            const invalidModel = new ValidatedModel({ age: 150 });
            expect(invalidModel.validate()).toBe(false);
        });
    });
    
    describe('序列化', () => {
        it('应该可以序列化为 JSON', () => {
            const data = { name: 'John', age: 30 };
            const model = new Model(data);
            
            const json = model.toJSON();
            expect(json).toEqual(data);
            expect(json.name).toBe('John');
            expect(json.age).toBe(30);
        });
        
        it('应该可以反序列化', () => {
            const model = new Model({ name: 'John' });
            
            const newData = { name: 'Jane', age: 25 };
            model.fromJSON(newData);
            
            expect(model.data).toEqual(newData);
            expect(model.data.name).toBe('Jane');
        });
    });
});

