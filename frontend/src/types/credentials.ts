/**
 * @interface LoginCredentials
 * Defines the structure for the data required for a user to log in.
 * A user can log in with either an email or a username, along with a password.
 */
export interface LoginCredentials {
  emailOrUsername: string;
  password?: string;
}

/**
 * @interface RegisterCredentials
 * Defines the structure for the data required to register a new user.
 */
export interface RegisterCredentials {
  email: string;
  username: string;
  password?: string;
}
