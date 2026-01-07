import { Logger, LogLevel, LogCategory } from '../../src/debug/Logger';

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
};

describe('Logger', () => {
    beforeEach(() => {
        Logger.disable();
        Logger.setLevel(LogLevel.WARN);
        Logger.setCategoryEnabled(LogCategory.REACTIVE, true);
        Logger.setCategoryEnabled(LogCategory.BINDING, true);
        Logger.setCategoryEnabled(LogCategory.VIEWMODEL, true);
        Logger.setCategoryEnabled(LogCategory.PERFORMANCE, true);
        
        // Mock console
        global.console = mockConsole as any;
        jest.clearAllMocks();
    });

    afterEach(() => {
        Logger.disable();
        global.console = originalConsole;
    });

    describe('enable/disable', () => {
        it('should enable and disable logger', () => {
            expect(Logger.isEnabled()).toBe(false);
            
            Logger.enable();
            expect(Logger.isEnabled()).toBe(true);
            
            Logger.disable();
            expect(Logger.isEnabled()).toBe(false);
        });
    });

    describe('setLevel', () => {
        it('should set and get log level', () => {
            Logger.setLevel(LogLevel.DEBUG);
            expect(Logger.getLevel()).toBe(LogLevel.DEBUG);
            
            Logger.setLevel(LogLevel.ERROR);
            expect(Logger.getLevel()).toBe(LogLevel.ERROR);
        });
    });

    describe('setCategoryEnabled', () => {
        it('should enable and disable categories', () => {
            Logger.setCategoryEnabled(LogCategory.REACTIVE, false);
            expect(Logger.isCategoryEnabled(LogCategory.REACTIVE)).toBe(false);
            
            Logger.setCategoryEnabled(LogCategory.REACTIVE, true);
            expect(Logger.isCategoryEnabled(LogCategory.REACTIVE)).toBe(true);
        });
    });

    describe('debug', () => {
        it('should not log when disabled', () => {
            Logger.debug(LogCategory.REACTIVE, 'Test message');
            expect(mockConsole.log).not.toHaveBeenCalled();
        });

        it('should not log when level is too high', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.INFO);
            
            Logger.debug(LogCategory.REACTIVE, 'Test message');
            expect(mockConsole.log).not.toHaveBeenCalled();
        });

        it('should log when enabled and level is correct', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.DEBUG);
            
            Logger.debug(LogCategory.REACTIVE, 'Test message', { data: 'test' });
            expect(mockConsole.log).toHaveBeenCalled();
        });

        it('should not log when category is disabled', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.DEBUG);
            Logger.setCategoryEnabled(LogCategory.REACTIVE, false);
            
            Logger.debug(LogCategory.REACTIVE, 'Test message');
            expect(mockConsole.log).not.toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('should log when enabled and level is correct', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.INFO);
            
            Logger.info(LogCategory.BINDING, 'Info message');
            expect(mockConsole.log).toHaveBeenCalled();
        });

        it('should not log when level is too high', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.WARN);
            
            Logger.info(LogCategory.BINDING, 'Info message');
            expect(mockConsole.log).not.toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        it('should log using console.warn', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.WARN);
            
            Logger.warn(LogCategory.VIEWMODEL, 'Warning message');
            expect(mockConsole.warn).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('should log using console.error', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.ERROR);
            
            Logger.error(LogCategory.BINDING, 'Error message');
            expect(mockConsole.error).toHaveBeenCalled();
        });
    });

    describe('log format', () => {
        it('should include timestamp, level, and category in log', () => {
            Logger.enable();
            Logger.setLevel(LogLevel.DEBUG);
            
            Logger.debug(LogCategory.REACTIVE, 'Test message');
            
            const callArgs = mockConsole.log.mock.calls[0];
            expect(callArgs[0]).toContain('DEBUG');
            expect(callArgs[0]).toContain('REACTIVE');
            expect(callArgs[1]).toBe('Test message');
        });
    });
});


