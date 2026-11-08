// Simple in-memory user store for demonstration purposes
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

const users = new Map<string, User>(); // key by email

export const userStore = {
  add(user: User) {
    users.set(user.email, user);
  },
  getByEmail(email: string) {
    return users.get(email);
  },
  update(email: string, updates: Partial<User>) {
    const existing = users.get(email);
    if (existing) {
      users.set(email, { ...existing, ...updates });
    }
  },
  delete(email: string) {
    users.delete(email);
  },
};
