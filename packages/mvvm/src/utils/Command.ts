/**
 * 命令接口
 */
export interface ICommand {
    /** 执行命令 */
    execute(...args: any[]): void;
    /** 撤销命令（可选） */
    undo?(): void;
    /** 是否可以撤销 */
    canUndo?(): boolean;
}

/**
 * 命令
 * 
 * 实现命令模式，用于封装操作
 * 
 * @example
 * ```typescript
 * const command = new Command(
 *     () => { console.log('Execute'); },
 *     () => { console.log('Undo'); }
 * );
 * 
 * command.execute(); // 输出: Execute
 * command.undo();    // 输出: Undo
 * ```
 */
export class Command implements ICommand {
    private executeFn: (...args: any[]) => void;
    private undoFn?: () => void;
    
    constructor(
        executeFn: (...args: any[]) => void,
        undoFn?: () => void
    ) {
        this.executeFn = executeFn;
        this.undoFn = undoFn;
    }
    
    /**
     * 执行命令
     */
    execute(...args: any[]): void {
        this.executeFn(...args);
    }
    
    /**
     * 撤销命令
     */
    undo(): void {
        if (this.undoFn) {
            this.undoFn();
        }
    }
    
    /**
     * 是否可以撤销
     */
    canUndo(): boolean {
        return this.undoFn !== undefined;
    }
}
