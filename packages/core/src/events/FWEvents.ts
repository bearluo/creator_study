/**
 * Event system types
 * 
 * This file provides type definitions for the event system.
 * Framework-specific event definitions should be in the extension package.
 */

/**
 * Event map type
 * 
 * Defines the mapping of event names to their parameter types.
 * 
 * @example
 * ```typescript
 * interface MyEvents extends EventMap {
 *     'user:login': [userId: string, timestamp: number];
 *     'user:logout': [];
 * }
 * 
 * const dispatcher = new FWEventDispatcher<MyEvents>();
 * dispatcher.on('user:login', (userId, timestamp) => {
 *     // TypeScript automatically infers userId as string, timestamp as number
 * });
 * ```
 */
export type EventMap = Record<string, any[]>;

/**
 * Event name type
 * 
 * Extracts event names from an event map type.
 */
export type EventName<T extends EventMap> = keyof T;
