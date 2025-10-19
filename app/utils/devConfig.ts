/**
 * Development Tools Configuration
 * Controls who can access dev tools in production builds
 */

// Array of Firebase user IDs allowed to access dev tools in production
// Add your production user IDs here
export const ALLOWED_DEV_USER_IDS: string[] = [
  // Example: 'firebase-user-id-1',
  // Example: 'firebase-user-id-2',
];

/**
 * Check if the current user should have access to dev tools
 * @param userId - Firebase user ID (null if not authenticated)
 * @returns true if dev tools should be visible
 */
export function shouldShowDevTools(userId: string | null): boolean {
  // Always show in development mode
  if (__DEV__) {
    return true;
  }

  // In production, only show for allowed users
  if (userId && ALLOWED_DEV_USER_IDS.includes(userId)) {
    return true;
  }

  return false;
}

export default {
  ALLOWED_DEV_USER_IDS,
  shouldShowDevTools,
};
