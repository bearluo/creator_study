import { _decorator, Component, Node } from 'cc';
import { FWUserDataExample } from './FWUserDataExample';

const { ccclass, property } = _decorator;

/**
 * 用户数据测试场景
 * 用于测试FWUserData的各种功能
 */
@ccclass('SceneUserDataTest')
export class SceneUserDataTest extends Component {
    @property(Node)
    testNode: Node = null;

    start() {
        console.log('=== 开始用户数据加密类测试 ===');
        
        // 创建测试节点并添加示例组件
        if (this.testNode) {
            const example = this.testNode.addComponent(FWUserDataExample);
            console.log('用户数据测试组件已添加');
        } else {
            console.warn('测试节点未设置，无法运行测试');
        }
    }
} 