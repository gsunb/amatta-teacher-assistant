import {
  users,
  schedules,
  records,
  assessments,
  students,
  parentCommunications,
  notifications,
  backups,
  type User,
  type UpsertUser,
  type Schedule,
  type InsertSchedule,
  type Record,
  type InsertRecord,
  type Assessment,
  type InsertAssessment,
  type Student,
  type InsertStudent,
  type ParentCommunication,
  type InsertParentCommunication,
  type Notification,
  type InsertNotification,
  type Backup,
  type InsertBackup,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Schedule operations
  getSchedules(userId: string): Promise<Schedule[]>;
  createSchedule(userId: string, schedule: InsertSchedule): Promise<Schedule>;
  deleteSchedule(userId: string, id: number): Promise<void>;

  // Record operations
  getRecords(userId: string): Promise<Record[]>;
  createRecord(userId: string, record: InsertRecord): Promise<Record>;
  deleteRecord(userId: string, id: number): Promise<void>;

  // Assessment operations
  getAssessments(userId: string): Promise<Assessment[]>;
  createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment>;
  deleteAssessment(userId: string, id: number): Promise<void>;

  // Student operations
  getStudents(userId: string): Promise<Student[]>;
  createStudent(userId: string, student: InsertStudent): Promise<Student>;
  deleteStudent(userId: string, id: number): Promise<void>;
  createMultipleStudents(userId: string, students: InsertStudent[]): Promise<Student[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Schedule operations
  async getSchedules(userId: string): Promise<Schedule[]> {
    return await db
      .select()
      .from(schedules)
      .where(eq(schedules.userId, userId))
      .orderBy(desc(schedules.date), desc(schedules.time));
  }

  async createSchedule(userId: string, schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db
      .insert(schedules)
      .values({ ...schedule, userId })
      .returning();
    return newSchedule;
  }

  async deleteSchedule(userId: string, id: number): Promise<void> {
    await db
      .delete(schedules)
      .where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
  }

  // Record operations
  async getRecords(userId: string): Promise<Record[]> {
    return await db
      .select()
      .from(records)
      .where(eq(records.userId, userId))
      .orderBy(desc(records.date), desc(records.createdAt));
  }

  async createRecord(userId: string, record: InsertRecord): Promise<Record> {
    const [newRecord] = await db
      .insert(records)
      .values({ ...record, userId })
      .returning();
    return newRecord;
  }

  async deleteRecord(userId: string, id: number): Promise<void> {
    await db
      .delete(records)
      .where(and(eq(records.id, id), eq(records.userId, userId)));
  }

  // Assessment operations
  async getAssessments(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values({ ...assessment, userId })
      .returning();
    return newAssessment;
  }

  async deleteAssessment(userId: string, id: number): Promise<void> {
    await db
      .delete(assessments)
      .where(and(eq(assessments.id, id), eq(assessments.userId, userId)));
  }

  // Student operations
  async getStudents(userId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .orderBy(desc(students.createdAt));
  }

  async createStudent(userId: string, student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values({ ...student, userId })
      .returning();
    return newStudent;
  }

  async deleteStudent(userId: string, id: number): Promise<void> {
    await db
      .delete(students)
      .where(and(eq(students.id, id), eq(students.userId, userId)));
  }

  async createMultipleStudents(userId: string, students: InsertStudent[]): Promise<Student[]> {
    const studentsWithUserId = students.map(student => ({ ...student, userId }));
    return await db.insert(students).values(studentsWithUserId).returning();
  }
}

export const storage = new DatabaseStorage();
