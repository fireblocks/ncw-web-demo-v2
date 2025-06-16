/**
 * Utility functions for handling common errors in the application
 */

/**
 * Handles common decryption errors and provides a standardized error message
 * @param error The error to check
 * @param preserveOriginalMessage If true, wraps the original error message in a new Error; otherwise, just throws the standardized message
 * @throws Standardized error message for decryption-related errors
 */
export function handleDecryptionError(error: any, preserveOriginalMessage: boolean = false): never {
  if (error.message.includes('decrypt') || error.message.includes('integrity') || 
      error.message.includes('authentication failed') || error.message.includes('bad decrypt')) {
    throw new Error('Incorrect password. Please try again with the correct password.');
  }
  
  if (preserveOriginalMessage) {
    throw new Error(error.message);
  } else {
    throw error;
  }
}