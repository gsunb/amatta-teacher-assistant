import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupGoogleAuth, isGoogleAuthAvailable } from "./googleAuth";
import bcrypt from "bcryptjs";
import {
  insertScheduleSchema,
  insertRecordSchema,
  insertAssessmentSchema,
  insertClassSchema,
  insertStudentSchema,
} from "@shared/schema";
import { z } from "zod";

// Enhanced date parsing function for natural language expressions
function parseNaturalLanguageDate(text: string): string {
  const today = new Date();
  const lowerText = text.toLowerCase();
  
  // Handle date ranges like "7/1~7/4" or "7/1-7/4"
  const dateRangeMatch = text.match(/(\d{1,2})\/(\d{1,2})\s*[~-]\s*(\d{1,2})\/(\d{1,2})/);
  if (dateRangeMatch) {
    const startMonth = parseInt(dateRangeMatch[1]);
    const startDay = parseInt(dateRangeMatch[2]);
    const year = today.getFullYear();
    const startDate = new Date(year, startMonth - 1, startDay);
    return startDate.toISOString().split('T')[0];
  }
  
  // Handle single date format like "7/1"
  const singleDateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (singleDateMatch) {
    const month = parseInt(singleDateMatch[1]);
    const day = parseInt(singleDateMatch[2]);
    const year = today.getFullYear();
    const targetDate = new Date(year, month - 1, day);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle relative day references
  if (lowerText.includes('오늘')) {
    return today.toISOString().split('T')[0];
  }
  
  if (lowerText.includes('어제')) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  
  if (lowerText.includes('내일')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Handle "지난 요일" patterns
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayNamesShort = ['일', '월', '화', '수', '목', '금', '토'];
  
  for (let i = 0; i < dayNames.length; i++) {
    if (lowerText.includes(`지난 ${dayNames[i]}`) || lowerText.includes(`지난${dayNames[i]}`) || 
        lowerText.includes(`지난 ${dayNamesShort[i]}요일`) || lowerText.includes(`지난${dayNamesShort[i]}요일`)) {
      
      const targetDay = new Date(today);
      const currentDay = today.getDay();
      let daysBack = currentDay - i;
      
      if (daysBack <= 0) {
        daysBack += 7; // Go to previous week
      }
      
      targetDay.setDate(today.getDate() - daysBack);
      return targetDay.toISOString().split('T')[0];
    }
  }
  
  // Handle "다음 요일" patterns
  for (let i = 0; i < dayNames.length; i++) {
    if (lowerText.includes(`다음 ${dayNames[i]}`) || lowerText.includes(`다음${dayNames[i]}`) || 
        lowerText.includes(`다음 ${dayNamesShort[i]}요일`) || lowerText.includes(`다음${dayNamesShort[i]}요일`)) {
      
      const targetDay = new Date(today);
      const currentDay = today.getDay();
      let daysForward = i - currentDay;
      
      if (daysForward <= 0) {
        daysForward += 7; // Go to next week
      }
      
      targetDay.setDate(today.getDate() + daysForward);
      return targetDay.toISOString().split('T')[0];
    }
  }
  
  // Handle specific date patterns like "6월 26일"
  const dateMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    const year = today.getFullYear();
    const targetDate = new Date(year, month - 1, day);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Default to today if no pattern matches
  return today.toISOString().split('T')[0];
}





// Basic command parsing function for fallback when no API key is provided
async function parseCommandBasic(command: string, userId: string) {
  const results: any[] = [];
  const lowerCommand = command.toLowerCase();
  
  // Improved consultation parsing - distinguish future vs past
  if (lowerCommand.includes('상담') || lowerCommand.includes('학부모')) {
    // Check for future indicators
    const futureIndicators = ['예정', '계획', '할 예정', '예약', '일정', '내일', '다음', '~일', '~요일'];
    const pastIndicators = ['했음', '완료', '진행했음', '이야기했음', '약속했음', '협조한다고', '진행', '가격하거나', '잡아당기는'];
    
    const hasFutureIndicator = futureIndicators.some(indicator => lowerCommand.includes(indicator));
    const hasPastIndicator = pastIndicators.some(indicator => lowerCommand.includes(indicator));
    
    if (hasFutureIndicator && !hasPastIndicator) {
      // Future consultation -> Schedule
      const parsedDate = parseNaturalLanguageDate(command);
      const schedule = await storage.createSchedule(userId, {
        title: command,
        date: parsedDate,
        description: `자동 생성됨: ${command}`
      });
      results.push({ type: 'schedule', data: schedule });
    } else if (hasPastIndicator || (!hasFutureIndicator && !hasPastIndicator)) {
      // Past consultation or unclear -> Parent Communication
      const studentName = extractStudentName(command);
      const parsedDate = parseNaturalLanguageDate(command);
      const communication = await storage.createParentCommunication(userId, {
        studentName: studentName || '미지정',
        communicationType: '상담',
        purpose: command,
        summary: command,
        date: parsedDate,
        followUpRequired: false,
        followUpCompleted: true
      });
      results.push({ type: 'parent_communication', data: communication });
    }
  }

  // Simple pattern matching for common commands
  else if (lowerCommand.includes('일정') || lowerCommand.includes('스케줄') || lowerCommand.includes('약속') || lowerCommand.includes('회의')) {
    // Extract basic schedule info
    const titleMatch = command.match(/(.+?)\s*(일정|스케줄|약속|회의)/);
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
  else if (lowerCommand.includes('기록') || lowerCommand.includes('사건') || lowerCommand.includes('문제') || lowerCommand.includes('생활지도')) {
    // Split command into multiple events if they contain separators
    const events = splitMultipleEvents(command);
    const today = new Date().toISOString().split('T')[0];
    const students = await storage.getStudents(userId);
    
    for (const event of events) {
      const title = event.length > 20 ? event.substring(0, 20) + '...' : event;
      
      // Extract student names for each individual event
      const studentNames = extractStudentNames(event);
      const studentIds = studentNames.map(name => {
        const student = students.find(s => s.name === name);
        return student ? student.id : null;
      }).filter(id => id !== null);
      
      const record = await storage.createRecord(userId, {
        title,
        description: event.trim(),
        date: today,
        severity: determineSeverity(event) as "low" | "medium" | "high",
        studentIds: studentIds.length > 0 ? studentIds : null
      });
      results.push({ type: 'record', data: record });
    }
  }
  
  return results;
}

function extractStudentName(text: string): string {
  // Extract Korean names (2-3 characters followed by common name endings)
  const namePattern = /([가-힣]{2,3})(?:\s|의|이|가|를|을|와|과|에게|한테|님|학생)/g;
  const matches = text.match(namePattern);
  if (matches && matches.length > 0) {
    return matches[0].replace(/\s|의|이|가|를|을|와|과|에게|한테|님|학생/g, '');
  }
  
  // Fallback: try to find standalone Korean names
  const standalonePattern = /([가-힣]{2,3})/g;
  const standaloneMatches = text.match(standalonePattern);
  return standaloneMatches ? standaloneMatches[0] : '';
}

function extractStudentNames(text: string): string[] {
  const names: string[] = [];
  
  // Pattern 1: Names with Korean particles (이/가, 을/를, 에게, 한테, etc.)
  const particlePattern = /([가-힣]{2,3})(?:이|가|를|을|와|과|에게|한테|님|학생)/g;
  let match;
  while ((match = particlePattern.exec(text)) !== null) {
    names.push(match[1]);
  }
  
  // Pattern 2: Names followed by possessive marker "의" or prepositions
  const possessivePattern = /([가-힣]{2,3})(?:의|에서|에|과|와)/g;
  particlePattern.lastIndex = 0; // Reset regex state
  while ((match = possessivePattern.exec(text)) !== null) {
    names.push(match[1]);
  }
  
  // Pattern 3: Names in context like "대해" or "대하여"
  const contextPattern = /([가-힣]{2,3})\s*(?:에\s*)?대해/g;
  while ((match = contextPattern.exec(text)) !== null) {
    names.push(match[1]);
  }
  
  // Pattern 4: Names followed by common verbs or actions
  const actionPattern = /([가-힣]{2,3})(?:가|이)\s*(?:했|했다|했고|했는데|했으며|있다|있고|말했|소리|화가|장난)/g;
  while ((match = actionPattern.exec(text)) !== null) {
    names.push(match[1]);
  }
  
  // Remove duplicates and filter out common non-name words
  const uniqueNames = Array.from(new Set(names));
  const filteredNames = uniqueNames.filter(name => {
    // Filter out common words that aren't names
    const commonWords = ['이야기', '문제', '상황', '경우', '때문', '관련', '발생', '처리'];
    return !commonWords.includes(name);
  });
  
  return filteredNames;
}

function splitMultipleEvents(text: string): string[] {
  // Split on common Korean separators and conjunctions
  const separators = [
    /\s*그리고\s*/g,
    /\s*또한\s*/g, 
    /\s*그리고나서\s*/g,
    /\s*,\s*또\s*/g,
    /\s*\.[\s]*[가-힣]/g, // Sentence endings followed by Korean text
    /\s*;\s*/g,
    /\s*\.\s*그리고\s*/g,
    /\s*\.\s*또\s*/g,
    /\s*하고\s*/g,
    /\s*그다음\s*/g
  ];
  
  let events = [text];
  
  // Apply each separator pattern
  for (const separator of separators) {
    const newEvents = [];
    for (const event of events) {
      if (separator.source.includes('[가-힣]')) {
        // Special handling for sentence endings
        const parts = event.split(/\.\s*(?=[가-힣])/);
        newEvents.push(...parts);
      } else {
        const parts = event.split(separator);
        newEvents.push(...parts);
      }
    }
    events = newEvents;
  }
  
  // Clean up and filter out empty events
  return events
    .map(event => event.trim())
    .filter(event => event.length > 3) // Filter out very short fragments
    .map(event => {
      // Add proper ending if it looks incomplete
      if (!event.match(/[.!?]$/)) {
        event += '.';
      }
      return event;
    });
}

function determineSeverity(text: string): "low" | "medium" | "high" {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('폭력') || lowerText.includes('위험') || lowerText.includes('심각') || lowerText.includes('가격') || lowerText.includes('잡아당기')) {
    return 'high';
  } else if (lowerText.includes('주의') || lowerText.includes('문제') || lowerText.includes('생활지도')) {
    return 'medium';
  }
  return 'low';
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupGoogleAuth(app);

  // Check if Google auth is available
  app.get('/api/auth/google/available', (req, res) => {
    res.json({ available: isGoogleAuthAvailable() });
  });

  // Email/Password Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, confirmPassword, firstName, lastName } = req.body;

      // Basic validation
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: "이메일, 비밀번호, 비밀번호 확인은 필수입니다." });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createEmailUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Create session-compatible user object
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        access_token: null,
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      };

      // Log user in
      req.login(sessionUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "회원가입은 완료되었지만 로그인에 실패했습니다." });
        }
        res.json({ message: "회원가입이 완료되었습니다.", user: { id: user.id, email: user.email } });
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  // Email/Password Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      // Create session-compatible user object
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        access_token: null,
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      };

      // Log user in
      req.login(sessionUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
        }
        res.json({ message: "로그인 성공", user: { id: user.id, email: user.email } });
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has required consents
      const hasConsents = await storage.hasRequiredConsents(userId);
      res.json({ ...user, hasRequiredConsents: hasConsents });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User consent routes
  app.get('/api/user/consents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consents = await storage.getUserConsents(userId);
      res.json(consents);
    } catch (error) {
      console.error("Error fetching consents:", error);
      res.status(500).json({ message: "Failed to fetch consents" });
    }
  });

  app.post('/api/user/consents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { consents } = req.body;

      if (!consents || !Array.isArray(consents)) {
        return res.status(400).json({ message: "Invalid consent data" });
      }

      console.log("Processing consents for user:", userId);
      console.log("Number of consents:", consents.length);

      const results = [];
      for (const consent of consents) {
        try {
          console.log("Processing:", consent.consentType, "->", consent.isConsented);
          
          const result = await storage.createUserConsent(userId, {
            consentType: consent.consentType,
            consentVersion: "1.0",
            isConsented: consent.isConsented,
            consentedAt: consent.isConsented ? new Date() : null,
            withdrawnAt: !consent.isConsented ? new Date() : null,
          });
          
          results.push(result);
          console.log("Success for:", consent.consentType);
        } catch (consentError) {
          console.error("Error processing consent:", consent.consentType, consentError);
          throw consentError;
        }
      }

      console.log("All consents processed successfully");
      res.json({ 
        message: "Consents updated successfully",
        processed: results.length
      });
    } catch (error) {
      console.error("Error in consent processing:", error);
      res.status(500).json({ 
        message: "Failed to update consents", 
        error: error instanceof Error ? error.message : String(error)
      });
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

  app.post("/api/schedules/recurring", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedules = await storage.createRecurringSchedules(userId, validatedData);
      res.json(schedules);
    } catch (error) {
      console.error("Error creating recurring schedules:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "반복 일정 생성에 실패했습니다." });
      }
    }
  });

  app.get("/api/schedules/upcoming", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const schedules = await storage.getUpcomingSchedules(userId, days);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching upcoming schedules:", error);
      res.status(500).json({ message: "다가오는 일정을 불러오는데 실패했습니다." });
    }
  });

  app.patch("/api/schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const schedule = await storage.updateSchedule(userId, id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ message: "일정 수정에 실패했습니다." });
    }
  });

  app.patch("/api/schedules/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.completeSchedule(userId, id);
      res.json({ message: "일정이 완료되었습니다." });
    } catch (error) {
      console.error("Error completing schedule:", error);
      res.status(500).json({ message: "일정 완료에 실패했습니다." });
    }
  });

  app.patch("/api/schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const schedule = await storage.updateSchedule(userId, id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(500).json({ message: "일정 수정에 실패했습니다." });
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

  app.patch("/api/records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const record = await storage.updateRecord(userId, id, req.body);
      res.json(record);
    } catch (error) {
      console.error("Error updating record:", error);
      res.status(500).json({ message: "기록 수정에 실패했습니다." });
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

  // Class routes
  app.get("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classes = await storage.getClasses(userId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "학급을 불러오는데 실패했습니다." });
    }
  });

  app.post("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertClassSchema.parse(req.body);
      const classData = await storage.createClass(userId, validatedData);
      res.json(classData);
    } catch (error) {
      console.error("Error creating class:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "잘못된 입력 데이터입니다." });
      } else {
        res.status(500).json({ message: "학급 추가에 실패했습니다." });
      }
    }
  });

  app.patch("/api/classes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const classData = await storage.updateClass(userId, id, req.body);
      res.json(classData);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ message: "학급 수정에 실패했습니다." });
    }
  });

  app.delete("/api/classes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteClass(userId, id);
      res.json({ message: "학급이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "학급 삭제에 실패했습니다." });
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

  app.post("/api/students/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { data, classId } = req.body;
      
      if (!data || !classId) {
        return res.status(400).json({ message: "데이터와 학급 ID가 필요합니다." });
      }

      // Parse the uploaded data
      const lines = data.trim().split('\n').filter((line: string) => line.trim());
      const students = [];

      for (const line of lines) {
        const parts = line.split(',').map((part: string) => part.trim());
        if (parts.length >= 2) {
          const name = parts[0];
          const studentNumber = parts[1];
          
          if (name && studentNumber) {
            students.push({
              studentNumber,
              name,
              classId: parseInt(classId),
            });
          }
        }
      }

      if (students.length === 0) {
        return res.status(400).json({ message: "유효한 학생 데이터가 없습니다." });
      }

      const createdStudents = await storage.createMultipleStudents(userId, students);
      res.json(createdStudents);
    } catch (error) {
      console.error("Error uploading students:", error);
      res.status(500).json({ message: "학생 목록 업로드에 실패했습니다." });
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
                date: action.data.date || new Date().toISOString().split('T')[0],
                time: action.data.time || undefined,
                endTime: action.data.endTime || undefined,
                description: action.data.description || undefined,
              });
              results.push({ type: 'schedule', data: schedule });
              break;

            case 'record':
              // Extract student names and find their IDs
              const students = await storage.getStudents(userId);
              const studentNames = extractStudentNames(action.data.description || action.data.title);
              const studentIds = studentNames.map(name => {
                const student = students.find(s => s.name === name);
                return student ? student.id : null;
              }).filter(id => id !== null);

              const record = await storage.createRecord(userId, {
                title: action.data.title,
                description: action.data.description,
                date: action.data.date,
                severity: action.data.severity || 'medium',
                studentIds: studentIds.length > 0 ? studentIds : null,
              });
              results.push({ type: 'record', data: record });
              break;

            case 'assessment':
              const assessment = await storage.createAssessment(userId, {
                subject: action.data.subject,
                examName: action.data.examName || `${action.data.unit || ''} ${action.data.task || ''}`.trim(),
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
                studentNumber: action.data.studentNumber || "",
                classId: action.data.classId || 1,
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

  // Parent Communication routes
  app.get('/api/parent-communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communications = await storage.getParentCommunications(userId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching parent communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post('/api/parent-communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communication = await storage.createParentCommunication(userId, req.body);
      res.json(communication);
    } catch (error) {
      console.error("Error creating parent communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.patch('/api/parent-communications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.updateParentCommunication(userId, id, req.body);
      res.json({ message: "Communication updated successfully" });
    } catch (error) {
      console.error("Error updating parent communication:", error);
      res.status(500).json({ message: "Failed to update communication" });
    }
  });

  app.delete('/api/parent-communications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.deleteParentCommunication(userId, id);
      res.json({ message: "Communication deleted successfully" });
    } catch (error) {
      console.error("Error deleting parent communication:", error);
      res.status(500).json({ message: "Failed to delete communication" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notification = await storage.createNotification(userId, req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(userId, id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Risk assessment endpoint
  app.post('/api/assess-risk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all data for risk assessment
      const students = await storage.getStudents(userId);
      const assessments = await storage.getAssessments(userId);
      const records = await storage.getRecords(userId);
      
      const riskAssessments = await assessStudentRisks(students, assessments, records, userId);
      
      res.json({ riskAssessments, message: "Risk assessment completed" });
    } catch (error) {
      console.error("Error assessing risks:", error);
      res.status(500).json({ message: "Failed to assess risks" });
    }
  });

  // Data backup routes
  app.get('/api/backups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const backups = await storage.getBackups(userId);
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backups:", error);
      res.status(500).json({ message: "Failed to fetch backups" });
    }
  });

  app.post('/api/backup/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Create comprehensive backup
      const backupData = await createDataBackup(userId);
      const fileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      
      const backup = await storage.createBackup(userId, {
        backupType: 'manual',
        fileName,
        fileSize: JSON.stringify(backupData).length,
        status: 'completed'
      });

      res.json({ 
        backup, 
        data: backupData,
        message: "Backup created successfully" 
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Risk assessment utility function
async function assessStudentRisks(students: any[], assessments: any[], records: any[], userId: string) {
  const riskAssessments = [];

  for (const student of students) {
    const studentAssessments = assessments.filter(a => a.studentName === student.name);
    const studentRecords = records.filter(r => 
      r.title.includes(student.name) || r.description?.includes(student.name)
    );

    // Calculate risk factors
    let riskScore = 0;
    let riskFactors = [];

    // Academic performance risk
    if (studentAssessments.length > 0) {
      const avgScore = studentAssessments
        .filter(a => a.score && a.maxScore)
        .reduce((sum, a) => sum + ((a.score / a.maxScore) * 100), 0) / 
        studentAssessments.filter(a => a.score && a.maxScore).length;
      
      if (avgScore < 60) {
        riskScore += 3;
        riskFactors.push('학업 성취도 저조');
      } else if (avgScore < 70) {
        riskScore += 2;
        riskFactors.push('학업 성취도 관심 필요');
      }
    }

    // Behavioral risk
    const highSeverityRecords = studentRecords.filter(r => r.severity === 'high');
    const recentRecords = studentRecords.filter(r => {
      const recordDate = new Date(r.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return recordDate > twoWeeksAgo;
    });

    if (highSeverityRecords.length >= 2) {
      riskScore += 3;
      riskFactors.push('심각한 행동 문제 반복');
    } else if (highSeverityRecords.length === 1) {
      riskScore += 2;
      riskFactors.push('심각한 행동 문제');
    }

    if (recentRecords.length >= 3) {
      riskScore += 2;
      riskFactors.push('최근 문제 행동 빈발');
    }

    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 5) {
      riskLevel = 'high';
    } else if (riskScore >= 3) {
      riskLevel = 'medium';
    }

    // Update student risk level if changed
    if (student.riskLevel !== riskLevel) {
      await storage.updateStudentRiskLevel(userId, student.name, riskLevel);
      
      // Create notification for high/medium risk students
      if (riskLevel !== 'low') {
        await storage.createNotification(userId, {
          type: 'alert',
          title: `${student.name} 위험도 변경`,
          message: `${student.name} 학생의 위험도가 ${riskLevel === 'high' ? '높음' : '보통'}으로 변경되었습니다. 즉시 관심이 필요합니다.`,
          relatedEntity: student.name,
          scheduledFor: new Date(),
        });
      }
    }

    riskAssessments.push({
      studentName: student.name,
      riskLevel,
      riskScore,
      riskFactors,
      recommendations: generateRecommendations(riskLevel, riskFactors)
    });
  }

  return riskAssessments;
}

// Generate recommendations based on risk factors
function generateRecommendations(riskLevel: string, riskFactors: string[]) {
  const recommendations = [];

  if (riskLevel === 'high') {
    recommendations.push('즉시 학부모 상담 실시');
    recommendations.push('개별 학습 계획 수립');
    recommendations.push('상담 교사와 연계');
  } else if (riskLevel === 'medium') {
    recommendations.push('주간 모니터링 실시');
    recommendations.push('학부모 통화 권장');
  }

  if (riskFactors.includes('학업 성취도 저조')) {
    recommendations.push('기초 학습 보충 프로그램 참여');
    recommendations.push('또래 학습 멘토링 연결');
  }

  if (riskFactors.includes('심각한 행동 문제 반복')) {
    recommendations.push('행동 수정 프로그램 참여');
    recommendations.push('전문 상담 의뢰');
  }

  return recommendations.length > 0 ? recommendations : ['지속적인 관찰 유지'];
}

// Data backup utility function
async function createDataBackup(userId: string) {
  const [
    schedules,
    records,
    assessments,
    students,
    parentCommunications,
    notifications,
  ] = await Promise.all([
    storage.getSchedules(userId),
    storage.getRecords(userId),
    storage.getAssessments(userId),
    storage.getStudents(userId),
    storage.getParentCommunications(userId),
    storage.getNotifications(userId),
  ]);

  return {
    backupDate: new Date().toISOString(),
    userId,
    data: {
      schedules,
      records,
      assessments,
      students,
      parentCommunications,
      notifications,
    },
    summary: {
      totalSchedules: schedules.length,
      totalRecords: records.length,
      totalAssessments: assessments.length,
      totalStudents: students.length,
      totalCommunications: parentCommunications.length,
      totalNotifications: notifications.length,
    }
  };
}
