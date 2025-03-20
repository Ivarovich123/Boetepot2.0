import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFineSchema, insertReasonSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Get total amount of fines
  router.get("/total", async (req: Request, res: Response) => {
    try {
      const total = await storage.getTotalFines();
      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: "Failed to get total fines" });
    }
  });

  // Get recent fines (limited to 10)
  router.get("/recent", async (req: Request, res: Response) => {
    try {
      const recentFines = await storage.getRecentFines(10);
      res.json(recentFines);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent fines" });
    }
  });

  // Get player totals for leaderboard
  router.get("/player-totals", async (req: Request, res: Response) => {
    try {
      const playerTotals = await storage.getPlayerTotals();
      res.json(playerTotals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player totals" });
    }
  });

  // Get history for a specific player
  router.get("/player-history/:player", async (req: Request, res: Response) => {
    try {
      const player = decodeURIComponent(req.params.player);
      const history = await storage.getPlayerHistory(player);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to get player history" });
    }
  });

  // Get all fines
  router.get("/all", async (req: Request, res: Response) => {
    try {
      const allFines = await storage.getAllFines();
      res.json(allFines);
    } catch (error) {
      res.status(500).json({ message: "Failed to get all fines" });
    }
  });

  // Add a new fine
  router.post("/add", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFineSchema.parse(req.body);
      
      const newFine = await storage.addFine({
        speler: validatedData.speler,
        bedrag: Number(validatedData.bedrag),
        reden: validatedData.reden
      });
      
      res.status(201).json({ 
        message: "Boete succesvol toegevoegd!",
        fine: newFine 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to add fine" });
      }
    }
  });

  // Delete a fine
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      await storage.deleteFine(id);
      res.json({ message: "Fine successfully deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fine" });
    }
  });

  // Get unique player names for dropdowns
  router.get("/players", async (req: Request, res: Response) => {
    try {
      const players = await storage.getUniquePlayers();
      res.json({ spelers: players });
    } catch (error) {
      res.status(500).json({ message: "Failed to get player list" });
    }
  });
  
  // Add a new player
  router.post("/players/add", async (req: Request, res: Response) => {
    try {
      const { playerName } = req.body;
      
      if (!playerName) {
        return res.status(400).json({ message: "Speler naam is verplicht" });
      }
      
      const newPlayer = await storage.addPlayer(playerName);
      res.status(201).json({ 
        message: "Speler succesvol toegevoegd!",
        player: newPlayer 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add player" });
    }
  });
  
  // Delete a player
  router.delete("/players/:name", async (req: Request, res: Response) => {
    try {
      const playerName = decodeURIComponent(req.params.name);
      
      if (!playerName) {
        return res.status(400).json({ message: "Speler naam is verplicht" });
      }
      
      await storage.deletePlayer(playerName);
      res.json({ message: "Speler succesvol verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // Admin login
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      // Simple password check (would use proper auth in production)
      if (password === "Mandje123") {
        return res.status(200).json({ message: "Login successful" });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Reset all fines (start a new season)
  router.post("/reset", async (req: Request, res: Response) => {
    try {
      await storage.resetAllFines();
      res.json({ message: "Alle boetes zijn gereset voor het nieuwe seizoen" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset fines" });
    }
  });
  
  // Get all reasons
  router.get("/reasons", async (req: Request, res: Response) => {
    try {
      const reasons = await storage.getAllReasons();
      res.json(reasons);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reasons" });
    }
  });
  
  // Add a new reason
  router.post("/reasons/add", async (req: Request, res: Response) => {
    try {
      const validatedData = insertReasonSchema.parse(req.body);
      
      const newReason = await storage.addReason({
        naam: validatedData.naam,
        bedrag: Number(validatedData.bedrag)
      });
      
      res.status(201).json({ 
        message: "Reden succesvol toegevoegd!",
        reason: newReason 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(400).json({ message: error.message || "Failed to add reason" });
      }
    }
  });
  
  // Delete a reason
  router.delete("/reasons/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      await storage.deleteReason(id);
      res.json({ message: "Reden succesvol verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reason" });
    }
  });

  app.use("/api/fines", router);

  const httpServer = createServer(app);
  return httpServer;
}
