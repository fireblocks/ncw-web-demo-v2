/**
 * Utility function for consistent console logging
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export const consoleLog = (message: string, ...optionalParams: any[]) => {
  console.log(message, ...optionalParams);
};

/**
 * Utility function for consistent error logging
 * @param message The error message to log
 * @param optionalParams Additional parameters to log
 */
export const consoleError = (message: string, ...optionalParams: any[]) => {
  console.error(message, ...optionalParams);
}; 