import { fines, type Fine, type InsertFine, users, type User, type InsertUser, 
  reasons, type Reason, type InsertReason } from "@shared/schema";

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
  resetAllFines(): Promise<void>;
  getUniquePlayers(): Promise<string[]>;
  
  // Player management
  addPlayer(playerName: string): Promise<string>;
  deletePlayer(playerName: string): Promise<void>;
  
  // Reason management
  getAllReasons(): Promise<Reason[]>;
  addReason(reason: InsertReason): Promise<Reason>;
  deleteReason(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fines: Map<number, Fine>;
  private reasons: Map<number, Reason>;
  private currentUserId: number;
  private currentFineId: number;
  private currentReasonId: number;

  constructor() {
    this.users = new Map();
    this.fines = new Map();
    this.reasons = new Map();
    this.currentUserId = 1;
    this.currentFineId = 1;
    this.currentReasonId = 1;

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "Mandje123" // In production, this would be hashed
    });

    // Add some initial reasons manually (not using addReason to avoid method call before definition)
    const reasonTraining: Reason = {
      id: this.currentReasonId++,
      naam: "Te laat op training",
      bedrag: 5.00
    };
    this.reasons.set(reasonTraining.id, reasonTraining);
    
    const reasonPhone: Reason = {
      id: this.currentReasonId++,
      naam: "Telefoon tijdens teambespreking",
      bedrag: 7.50
    };
    this.reasons.set(reasonPhone.id, reasonPhone);

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
    
    // Convert to array and then iterate to avoid MapIterator issues
    const finesArray = Array.from(this.fines.values());
    for (const fine of finesArray) {
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
    
    // Convert to array and then iterate to avoid MapIterator issues
    const finesArray = Array.from(this.fines.values());
    for (const fine of finesArray) {
      players.add(fine.speler);
    }
    
    return Array.from(players);
  }
  
  // Player management methods
  async addPlayer(playerName: string): Promise<string> {
    if (!playerName.trim()) {
      throw new Error("Speler naam mag niet leeg zijn");
    }
    
    const existingPlayers = await this.getUniquePlayers();
    if (existingPlayers.includes(playerName)) {
      throw new Error("Speler bestaat al");
    }
    
    // Add an empty fine for this player to register them
    // Amount of 0 won't impact totals but establishes the player
    await this.addFine({
      speler: playerName,
      bedrag: 0,
      reden: "Nieuwe speler toegevoegd"
    });
    
    return playerName;
  }
  
  async deletePlayer(playerName: string): Promise<void> {
    // Get all fines for this player
    const playerFines = Array.from(this.fines.values())
      .filter(fine => fine.speler === playerName);
    
    // Delete all fines for this player
    for (const fine of playerFines) {
      await this.deleteFine(fine.id);
    }
  }
  
  // Reset all fines (start new season)
  async resetAllFines(): Promise<void> {
    // Clear all fines
    this.fines.clear();
    this.currentFineId = 1;
  }
  
  // Reason management methods
  async getAllReasons(): Promise<Reason[]> {
    return Array.from(this.reasons.values());
  }
  
  async addReason(insertReason: InsertReason): Promise<Reason> {
    if (!insertReason.naam.trim()) {
      throw new Error("Reden mag niet leeg zijn");
    }
    
    // Check if reason already exists
    const existingReason = Array.from(this.reasons.values()).find(
      (reason) => reason.naam === insertReason.naam
    );
    
    if (existingReason) {
      throw new Error("Deze reden bestaat al");
    }
    
    const id = this.currentReasonId++;
    const reason: Reason = { ...insertReason, id };
    this.reasons.set(id, reason);
    return reason;
  }
  
  async deleteReason(id: number): Promise<void> {
    this.reasons.delete(id);
  }
}

export const storage = new MemStorage();
