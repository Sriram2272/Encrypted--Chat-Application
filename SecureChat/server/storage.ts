import { type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;
  getAllUsers(): User[];
  updateUserDisabled(id: number, disabled: boolean): void;
  
  // Message operations
  createMessage(message: InsertMessage): Message;
  getMessagesBetweenUsers(userId1: number, userId2: number): Message[];
  getAllMessages(): Message[];
  getMessage(id: number): Message | undefined;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private userIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
  }

  // User operations
  getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  createUser(insertUser: InsertUser): User {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      disabled: false 
    };
    this.users.set(id, user);
    return user;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUserDisabled(id: number, disabled: boolean): void {
    const user = this.users.get(id);
    if (user) {
      user.disabled = disabled;
      this.users.set(id, user);
    }
  }

  // Message operations
  createMessage(insertMessage: InsertMessage): Message {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: Date.now(),
    };
    this.messages.set(id, message);
    return message;
  }

  getMessagesBetweenUsers(userId1: number, userId2: number): Message[] {
    return Array.from(this.messages.values()).filter(
      (msg) =>
        (msg.sender === userId1 && msg.receiver === userId2) ||
        (msg.sender === userId2 && msg.receiver === userId1)
    ).sort((a, b) => a.createdAt - b.createdAt);
  }

  getAllMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  getMessage(id: number): Message | undefined {
    return this.messages.get(id);
  }
}

export const storage = new MemStorage();
