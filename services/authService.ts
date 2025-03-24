import { updatePassword, confirmResetPassword, resetPassword } from 'aws-amplify/auth';

/**
 * Change user password
 * @param oldPassword Current password
 * @param newPassword New password
 * @returns Promise that resolves when password is changed
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  try {
    await updatePassword({
      oldPassword,
      newPassword
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

/**
 * Request password reset
 * @param username Username or email
 * @returns Promise that resolves when reset is requested
 */
export async function requestPasswordReset(username: string): Promise<void> {
  try {
    await resetPassword({ username });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}

/**
 * Confirm password reset
 * @param username Username or email
 * @param confirmationCode Code sent to user's email
 * @param newPassword New password
 * @returns Promise that resolves when password is reset
 */
export async function confirmPasswordReset(
  username: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> {
  try {
    await confirmResetPassword({
      username,
      confirmationCode,
      newPassword
    });
  } catch (error) {
    console.error('Error confirming password reset:', error);
    throw error;
  }
}