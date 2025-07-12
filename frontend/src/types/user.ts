/**
 * @interface User
 * Defines the structure for a user object.
 * This represents the authenticated user's data.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user"; // Role can be either admin or user
}
