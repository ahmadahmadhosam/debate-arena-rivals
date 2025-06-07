
interface User {
  username: string;
  password: string;
  religion: 'سني' | 'شيعي';
}

interface AuthenticatedUser {
  username: string;
  religion: 'سني' | 'شيعي';
  isAuthenticated: boolean;
}

class UserDatabase {
  private storageKey = 'registeredUsers';

  getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  registerUser(username: string, password: string, religion: 'سني' | 'شيعي'): boolean {
    const users = this.getUsers();
    
    // التحقق من عدم وجود المستخدم
    if (users.find(user => user.username === username)) {
      return false; // المستخدم موجود بالفعل
    }

    users.push({ username, password, religion });
    this.saveUsers(users);
    return true;
  }

  authenticateUser(username: string, password: string): AuthenticatedUser | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      return {
        username: user.username,
        religion: user.religion,
        isAuthenticated: true
      };
    }
    
    return null;
  }

  userExists(username: string): boolean {
    const users = this.getUsers();
    return users.some(user => user.username === username);
  }
}

export const userDB = new UserDatabase();
