import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertScheduleSchema,
  insertRecordSchema,
  insertAssessmentSchema,
  insertStudentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schedules = await storage.getSchedules(userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "일정을 불러오는데 실패했습니다." });
    }
  });

  app.post("/api/schedules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(userId, validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "일정 생성에 실패했습니다." });
      }
    }
  });

  app.delete("/api/schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteSchedule(userId, id);
      res.json({ message: "일정이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "일정 삭제에 실패했습니다." });
    }
  });

  // Record routes
  app.get("/api/records", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const records = await storage.getRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ message: "기록을 불러오는데 실패했습니다." });
    }
  });

  app.post("/api/records", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertRecordSchema.parse(req.body);
      const record = await storage.createRecord(userId, validatedData);
      res.json(record);
    } catch (error) {
      console.error("Error creating record:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "기록 생성에 실패했습니다." });
      }
    }
  });

  app.delete("/api/records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteRecord(userId, id);
      res.json({ message: "기록이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).json({ message: "기록 삭제에 실패했습니다." });
    }
  });

  // Assessment routes
  app.get("/api/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "평가를 불러오는데 실패했습니다." });
    }
  });

  app.post("/api/assessments/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "잘못된 데이터 형식입니다." });
      }

      const assessments = [];
      for (const item of items) {
        const validatedData = insertAssessmentSchema.parse(item);
        const assessment = await storage.createAssessment(userId, validatedData);
        assessments.push(assessment);
      }

      res.json(assessments);
    } catch (error) {
      console.error("Error uploading assessments:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "평가 업로드에 실패했습니다." });
      }
    }
  });

  app.delete("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteAssessment(userId, id);
      res.json({ message: "평가가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "평가 삭제에 실패했습니다." });
    }
  });

  // Student routes
  app.get("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const students = await storage.getStudents(userId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "학생 명단을 불러오는데 실패했습니다." });
    }
  });

  app.post("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { students: studentList } = req.body;
      
      if (Array.isArray(studentList)) {
        // Multiple students
        const validatedStudents = studentList.map(student => 
          insertStudentSchema.parse(student)
        );
        const students = await storage.createMultipleStudents(userId, validatedStudents);
        res.json(students);
      } else {
        // Single student
        const validatedData = insertStudentSchema.parse(req.body);
        const student = await storage.createStudent(userId, validatedData);
        res.json(student);
      }
    } catch (error) {
      console.error("Error creating students:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "학생 추가에 실패했습니다." });
      }
    }
  });

  app.delete("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteStudent(userId, id);
      res.json({ message: "학생이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "학생 삭제에 실패했습니다." });
    }
  });

  // Natural language processing route
  app.post("/api/process-command", isAuthenticated, async (req: any, res) => {
    try {
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ message: "명령어를 입력해주세요." });
      }

      // This endpoint would integrate with Google Gemini API
      // For now, return a simple response
      res.json({ 
        message: "명령이 처리되었습니다.",
        processed: true,
        command: command 
      });
    } catch (error) {
      console.error("Error processing command:", error);
      res.status(500).json({ message: "명령 처리에 실패했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
