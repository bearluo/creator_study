/**
 * Mock Cocos Creator module for Jest tests
 */

// Mock Component
export class Component {
    node: any;
    onLoadCalled = false;
    onEnableCalled = false;
    onDisableCalled = false;
    onDestroyCalled = false;

    constructor() {
        this.node = {
            name: 'MockNode',
            addComponent: jest.fn(),
            getChildByName: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            destroy: jest.fn()
        };
    }

    onLoad(): void {
        this.onLoadCalled = true;
    }

    onEnable(): void {
        this.onEnableCalled = true;
    }

    onDisable(): void {
        this.onDisableCalled = true;
    }

    onDestroy(): void {
        this.onDestroyCalled = true;
    }

    schedule(callback: Function, interval: number): void {
        // Mock implementation
    }

    unschedule(callback: Function): void {
        // Mock implementation
    }
}

// Mock _decorator
export const _decorator = {
    ccclass: (name: string) => (target: any) => target,
    property: (type?: any) => (target: any, key: string) => {}
};

// Mock Label
export class Label extends Component {
    text: string = '';
    string: string = '';
}

// Mock EditBox
export class EditBox extends Component {
    string: string = '';
}

// Mock ProgressBar
export class ProgressBar extends Component {
    progress: number = 0;
}

// Mock Node
export class Node {
    name: string;
    private components: Component[] = [];

    constructor(name: string = 'MockNode') {
        this.name = name;
    }

    addComponent<T extends Component>(component: new () => T): T {
        const instance = new component();
        instance.node = this;
        this.components.push(instance);
        return instance as T;
    }

    getComponent<T extends Component>(component: new () => T): T | null {
        return this.components.find(c => c instanceof component) as T | null;
    }

    getChildByName(name: string): Node | null {
        return null;
    }

    on(event: string, callback: Function): void {
        // Mock implementation
    }

    off(event: string, callback: Function): void {
        // Mock implementation
    }

    destroy(): void {
        // Mock implementation
    }
}

// Mock EventType
export const EventType = {
    TOUCH_END: 'touch-end'
};

