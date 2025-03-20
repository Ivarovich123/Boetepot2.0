import { fines, type Fine, type InsertFine, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fine related methods
  getTotalFines(): Promise<number>;
  getRecentFines(limit: number): Promise<Fine[]>;
  getPlayerTotals(): Promise<{ speler: string; totaal: number }[]>;
  getPlayerHistory(playerName: string): Promise<Fine[]>;
  getAllFines(): Promise<Fine[]>;
  addFine(fine: InsertFine): Promise<Fine>;
  deleteFine(id: number): Promise<void>;
  getUniquePlayers(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fines: Map<number, Fine>;
  private currentUserId: number;
  private currentFineId: number;

  constructor() {
    this.users = new Map();
    this.fines = new Map();
    this.currentUserId = 1;
    this.currentFineId = 1;

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin" // In production, this would be hashed
    });

    // Add some initial fines for demo purposes
    this.addFine({
      speler: "Jan Jansen",
      bedrag: 5.00,
      reden: "Te laat op training"
    });
    this.addFine({
      speler: "Pieter Post",
      bedrag: 7.50,
      reden: "Telefoon tijdens teambespreking"
    });
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Fine related methods
  async getTotalFines(): Promise<number> {
    return Array.from(this.fines.values()).reduce(
      (total, fine) => total + Number(fine.bedrag),
      0
    );
  }

  async getRecentFines(limit: number): Promise<Fine[]> {
    return Array.from(this.fines.values())
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
      .slice(0, limit);
  }

  async getPlayerTotals(): Promise<{ speler: string; totaal: number }[]> {
    const playerTotals = new Map<string, number>();
    
    for (const fine of this.fines.values()) {
      const currentTotal = playerTotals.get(fine.speler) || 0;
      playerTotals.set(fine.speler, currentTotal + Number(fine.bedrag));
    }
    
    return Array.from(playerTotals.entries()).map(([speler, totaal]) => ({
      speler,
      totaal
    }));
  }

  async getPlayerHistory(playerName: string): Promise<Fine[]> {
    return Array.from(this.fines.values())
      .filter(fine => fine.speler === playerName)
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
  }

  async getAllFines(): Promise<Fine[]> {
    return Array.from(this.fines.values())
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
  }

  async addFine(insertFine: InsertFine): Promise<Fine> {
    const id = this.currentFineId++;
    const fine: Fine = {
      ...insertFine,
      id,
      datum: new Date(),
    };
    
    this.fines.set(id, fine);
    return fine;
  }

  async deleteFine(id: number): Promise<void> {
    this.fines.delete(id);
  }

  async getUniquePlayers(): Promise<string[]> {
    const players = new Set<string>();
    
    for (const fine of this.fines.values()) {
      players.add(fine.speler);
    }
    
    return Array.from(players);
  }
}

export const storage = new MemStorage();
