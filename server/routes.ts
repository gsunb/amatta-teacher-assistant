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

// Basic command parsing function for fallback when no API key is provided
async function parseCommandBasic(command: string, userId: string) {
  const results = [];
  const lowerCommand = command.toLowerCase();
  
  // Simple pattern matching for common commands
  if (lowerCommand.includes('일정') || lowerCommand.includes('스케줄') || lowerCommand.includes('약속')) {
    // Extract basic schedule info
    const titleMatch = command.match(/(.+?)\s*(일정|스케줄|약속)/);
    const title = titleMatch ? titleMatch[1].trim() : '새로운 일정';
    
    // Default to today if no date specified
    const today = new Date().toISOString().split('T')[0];
    
    const schedule = await storage.createSchedule(userId, {
      title,
      date: today,
      time: undefined,
      endTime: undefined,
      description: `자동 생성됨: ${command}`
    });
    results.push({ type: 'schedule', data: schedule });
  }
  
  if (lowerCommand.includes('기록') || lowerCommand.includes('사건') || lowerCommand.includes('문제')) {
    const title = command.length > 20 ? command.substring(0, 20) + '...' : command;
    const today = new Date().toISOString().split('T')[0];
    
    const record = await storage.createRecord(userId, {
      title,
      description: command,
      date: today,
      severity: 'medium'
    });
    results.push({ type: 'record', data: record });
  }
  
  return results;
}

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
      const userId = req.user.claims.sub;
      
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ message: "명령어를 입력해주세요." });
      }

      // Get API key from request headers (sent from frontend)
      const apiKey = req.headers['x-gemini-api-key'];
      if (!apiKey) {
        // Fallback: basic command parsing without AI
        const results = await parseCommandBasic(command, userId);
        return res.json({
          message: `기본 명령 파싱으로 ${results.length}개의 작업이 처리되었습니다. 더 정확한 AI 처리를 위해 설정에서 Gemini API 키를 입력해주세요.`,
          processed: true,
          results,
          fallback: true
        });
      }

      // Call Google Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `다음 한국어 명령을 분석하여 JSON 형태로 응답해주세요. 여러 개의 명령이 있다면 모두 처리해주세요.

명령어: "${command}"

응답 형식:
{
  "actions": [
    {
      "type": "schedule" | "record" | "assessment" | "student" | "unknown",
      "data": {
        // 스케줄인 경우: title, date, time(선택), endTime(선택), description(선택)
        // 기록인 경우: title, description, date, severity("low"|"medium"|"high")
        // 평가인 경우: subject, unit, task, studentName(선택), score(선택), maxScore(선택), notes(선택)
        // 학생인 경우: name, studentNumber(선택), grade(선택), class(선택)
      }
    }
  ]
}

날짜는 YYYY-MM-DD 형식으로, 시간은 HH:MM 형식으로 변환해주세요.
오늘 날짜는 ${new Date().toISOString().split('T')[0]}입니다.
시간이 명시되지 않은 일정은 time을 null로 설정해주세요.`
            }]
          }]
        })
      });

      console.log('Gemini API response status:', geminiResponse.status);
      
      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} - ${errorText}`);
      }

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Gemini API 응답이 비어있습니다');
      }

      // Parse the JSON response from Gemini
      let parsedResponse;
      try {
        // Extract JSON from the response (sometimes it comes with markdown formatting)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON 형식을 찾을 수 없습니다');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', responseText);
        throw new Error('AI 응답을 파싱할 수 없습니다');
      }

      const results = [];
      const errors = [];

      // Process each action
      for (const action of parsedResponse.actions || []) {
        try {
          switch (action.type) {
            case 'schedule':
              const schedule = await storage.createSchedule(userId, {
                title: action.data.title,
                date: action.data.date,
                time: action.data.time || undefined,
                endTime: action.data.endTime || undefined,
                description: action.data.description || undefined,
              });
              results.push({ type: 'schedule', data: schedule });
              break;

            case 'record':
              const record = await storage.createRecord(userId, {
                title: action.data.title,
                description: action.data.description,
                date: action.data.date,
                severity: action.data.severity || 'medium',
              });
              results.push({ type: 'record', data: record });
              break;

            case 'assessment':
              const assessment = await storage.createAssessment(userId, {
                subject: action.data.subject,
                unit: action.data.unit,
                task: action.data.task,
                studentName: action.data.studentName || undefined,
                score: action.data.score || undefined,
                maxScore: action.data.maxScore || undefined,
                notes: action.data.notes || undefined,
              });
              results.push({ type: 'assessment', data: assessment });
              break;

            case 'student':
              const student = await storage.createStudent(userId, {
                name: action.data.name,
                studentNumber: action.data.studentNumber || undefined,
                grade: action.data.grade || undefined,
                class: action.data.class || undefined,
              });
              results.push({ type: 'student', data: student });
              break;

            default:
              errors.push(`알 수 없는 명령 유형: ${action.type}`);
          }
        } catch (actionError) {
          console.error('Action 처리 오류:', actionError);
          errors.push(`${action.type} 처리 중 오류가 발생했습니다.`);
        }
      }

      const successCount = results.length;
      const errorCount = errors.length;
      
      let message = '';
      if (successCount > 0 && errorCount === 0) {
        message = `${successCount}개의 명령이 성공적으로 처리되었습니다.`;
      } else if (successCount > 0 && errorCount > 0) {
        message = `${successCount}개 성공, ${errorCount}개 실패했습니다.`;
      } else if (errorCount > 0) {
        message = `모든 명령 처리에 실패했습니다: ${errors.join(', ')}`;
      } else {
        message = '처리할 수 있는 명령을 찾지 못했습니다.';
      }

      res.json({ 
        message,
        processed: true,
        results,
        errors,
        originalCommand: command
      });
    } catch (error) {
      console.error("Error processing command:", error);
      res.status(500).json({ 
        message: (error as Error).message || "명령 처리에 실패했습니다.",
        processed: false 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
