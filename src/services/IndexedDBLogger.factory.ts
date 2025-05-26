import { IIndexedDBLoggerOptions, IndexedDBLogger } from './IndexedDBLogger.service';

// Store logger instances by device ID to implement a singleton pattern
const loggerInstances: Record<string, Promise<IndexedDBLogger>> = {};

export function IndexedDBLoggerFactory(options: IIndexedDBLoggerOptions): Promise<IndexedDBLogger> {
  if (!IndexedDBLogger.isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available');
  }

  // Use device ID as the key for the singleton instance
  const key = options.deviceId;

  // Return existing instance if available
  if (Object.prototype.hasOwnProperty.call(loggerInstances, key)) {
    return loggerInstances[key];
  }

  // Create a new instance and store it
  const loggerPromise = IndexedDBLogger.initialize(options);
  loggerInstances[key] = loggerPromise;

  // Handle initialization errors
  loggerPromise.catch((error) => {
    console.error('Error initializing IndexedDBLogger:', error);
    // Remove failed instance from cache so it can be retried
    if (Object.prototype.hasOwnProperty.call(loggerInstances, key)) {
      loggerInstances[key] = null as unknown as Promise<IndexedDBLogger>;
    }
  });

  return loggerPromise;
}
