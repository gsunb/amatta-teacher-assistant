import {
  users,
  schedules,
  records,
  assessments,
  classes,
  students,
  parentCommunications,
  notifications,
  backups,
  userConsents,
  type User,
  type UpsertUser,
  type Schedule,
  type InsertSchedule,
  type Record,
  type InsertRecord,
  type Assessment,
  type InsertAssessment,
  type Class,
  type InsertClass,
  type Student,
  type InsertStudent,
  type ParentCommunication,
  type InsertParentCommunication,
  type Notification,
  type InsertNotification,
  type Backup,
  type InsertBackup,
  type UserConsent,
  type InsertUserConsent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createEmailUser(userData: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User>;

  // Schedule operations
  getSchedules(userId: string): Promise<Schedule[]>;
  createSchedule(userId: string, schedule: InsertSchedule): Promise<Schedule>;
  createRecurringSchedules(userId: string, schedule: InsertSchedule): Promise<Schedule[]>;
  updateSchedule(userId: string, id: number, updates: Partial<InsertSchedule>): Promise<Schedule>;
  deleteSchedule(userId: string, id: number): Promise<void>;
  completeSchedule(userId: string, id: number): Promise<void>;
  getUpcomingSchedules(userId: string, days: number): Promise<Schedule[]>;

  // Record operations
  getRecords(userId: string): Promise<Record[]>;
  createRecord(userId: string, record: InsertRecord): Promise<Record>;
  updateRecord(userId: string, id: number, updates: Partial<InsertRecord>): Promise<Record>;
  deleteRecord(userId: string, id: number): Promise<void>;

  // Assessment operations
  getAssessments(userId: string): Promise<Assessment[]>;
  createAssessment(userId: string, assessment: InsertAssessment): Promise<Assessment>;
  deleteAssessment(userId: string, id: number): Promise<void>;

  // Class operations
  getClasses(userId: string): Promise<Class[]>;
  createClass(userId: string, classData: InsertClass): Promise<Class>;
  updateClass(userId: string, id: number, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(userId: string, id: number): Promise<void>;

  // Student operations
  getStudents(userId: string): Promise<Student[]>;
  getStudentsByClass(userId: string, classId: number): Promise<Student[]>;
  createStudent(userId: string, student: InsertStudent): Promise<Student>;
  updateStudent(userId: string, id: number, updates: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(userId: string, id: number): Promise<void>;
  createMultipleStudents(userId: string, students: InsertStudent[]): Promise<Student[]>;
  updateStudentRiskLevel(userId: string, studentName: string, riskLevel: string): Promise<void>;

  // Parent communication operations
  getParentCommunications(userId: string): Promise<ParentCommunication[]>;
  createParentCommunication(userId: string, communication: InsertParentCommunication): Promise<ParentCommunication>;
  updateParentCommunication(userId: string, id: number, updates: Partial<InsertParentCommunication>): Promise<void>;
  deleteParentCommunication(userId: string, id: number): Promise<void>;



  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(userId: string, id: number): Promise<void>;
  markNotificationAsSent(userId: string, id: number): Promise<void>;
  deleteNotification(userId: string, id: number): Promise<void>;

  // Backup operations
  getBackups(userId: string): Promise<Backup[]>;
  createBackup(userId: string, backup: InsertBackup): Promise<Backup>;
  updateBackupStatus(userId: string, id: number, status: string): Promise<void>;

  // User consent operations
  getUserConsents(userId: string): Promise<UserConsent[]>;
  createUserConsent(userId: string, consent: InsertUserConsent): Promise<UserConsent>;
  updateUserConsent(userId: string, consentType: string, isConsented: boolean): Promise<void>;
  hasRequiredConsents(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async createEmailUser(userData: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        authProvider: "email",
        emailVerified: false,
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

  async createRecurringSchedules(userId: string, schedule: InsertSchedule): Promise<Schedule[]> {
    const startDate = new Date(schedule.date);
    const endDate = new Date(schedule.recurringEndDate!);
    const createdSchedules: Schedule[] = [];
    
    let currentDate = new Date(startDate);
    let count = 0;
    const maxSchedules = 90; // Limit to 90 schedules (3 months max)
    
    while (currentDate <= endDate && count < maxSchedules) {
      const scheduleData = {
        ...schedule,
        date: currentDate.toISOString().split('T')[0],
        userId,
        isRecurring: true,
      };
      
      const [newSchedule] = await db
        .insert(schedules)
        .values(scheduleData)
        .returning();
      
      createdSchedules.push(newSchedule);
      count++;
      
      // Calculate next date based on recurring type
      switch (schedule.recurringType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          return createdSchedules; // Exit if invalid type
      }
    }
    
    return createdSchedules;
  }

  async updateSchedule(userId: string, id: number, updates: Partial<InsertSchedule>): Promise<Schedule> {
    const [updatedSchedule] = await db
      .update(schedules)
      .set(updates)
      .where(and(eq(schedules.id, id), eq(schedules.userId, userId)))
      .returning();
    return updatedSchedule;
  }

  async deleteSchedule(userId: string, id: number): Promise<void> {
    await db
      .delete(schedules)
      .where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
  }

  async completeSchedule(userId: string, id: number): Promise<void> {
    await db
      .update(schedules)
      .set({ isCompleted: true })
      .where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
  }

  async getUpcomingSchedules(userId: string, days: number): Promise<Schedule[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.userId, userId),
          eq(schedules.isCompleted, false)
        )
      )
      .orderBy(desc(schedules.date));
  }

  // Record operations
  async getRecords(userId: string): Promise<Record[]> {
    const recordsList = await db
      .select()
      .from(records)
      .where(eq(records.userId, userId))
      .orderBy(desc(records.date), desc(records.createdAt));
    
    // Join with student data to get names
    const recordsWithStudents = await Promise.all(
      recordsList.map(async (record) => {
        if (record.studentIds && record.studentIds.length > 0) {
          const studentsList = await db
            .select()
            .from(students)
            .where(and(
              eq(students.userId, userId),
              inArray(students.id, record.studentIds)
            ));
          
          return {
            ...record,
            studentNames: studentsList.map(s => s.name),
          };
        }
        return {
          ...record,
          studentNames: [],
        };
      })
    );
    
    return recordsWithStudents;
  }

  async createRecord(userId: string, record: InsertRecord): Promise<Record> {
    const [newRecord] = await db
      .insert(records)
      .values({ ...record, userId })
      .returning();
    return newRecord;
  }

  async updateRecord(userId: string, id: number, updates: Partial<InsertRecord>): Promise<Record> {
    const [record] = await db
      .update(records)
      .set(updates)
      .where(and(eq(records.id, id), eq(records.userId, userId)))
      .returning();
    return record;
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
  // Class operations
  async getClasses(userId: string): Promise<Class[]> {
    return await db
      .select()
      .from(classes)
      .where(eq(classes.userId, userId))
      .orderBy(desc(classes.createdAt));
  }

  async createClass(userId: string, classData: InsertClass): Promise<Class> {
    const [newClass] = await db
      .insert(classes)
      .values({ ...classData, userId })
      .returning();
    return newClass;
  }

  async updateClass(userId: string, id: number, updates: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set(updates)
      .where(and(eq(classes.id, id), eq(classes.userId, userId)))
      .returning();
    return updatedClass;
  }

  async deleteClass(userId: string, id: number): Promise<void> {
    await db
      .delete(classes)
      .where(and(eq(classes.id, id), eq(classes.userId, userId)));
  }

  // Student operations
  async getStudents(userId: string): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .orderBy(desc(students.createdAt));
  }

  async getStudentsByClass(userId: string, classId: number): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(and(eq(students.userId, userId), eq(students.classId, classId)))
      .orderBy(asc(sql`CAST(${students.studentNumber} AS INTEGER)`));
  }

  async createStudent(userId: string, student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values({ ...student, userId })
      .returning();
    return newStudent;
  }

  async updateStudent(userId: string, id: number, updates: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set(updates)
      .where(and(eq(students.id, id), eq(students.userId, userId)))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(userId: string, id: number): Promise<void> {
    await db
      .delete(students)
      .where(and(eq(students.id, id), eq(students.userId, userId)));
  }

  async createMultipleStudents(userId: string, studentsData: InsertStudent[]): Promise<Student[]> {
    const studentsWithUserId = studentsData.map(student => ({ ...student, userId }));
    return await db.insert(students).values(studentsWithUserId).returning();
  }

  async updateStudentRiskLevel(userId: string, studentName: string, riskLevel: string): Promise<void> {
    await db
      .update(students)
      .set({ riskLevel, lastAlertDate: new Date() })
      .where(and(eq(students.userId, userId), eq(students.name, studentName)));
  }

  // Parent communication operations
  async getParentCommunications(userId: string): Promise<ParentCommunication[]> {
    return await db
      .select()
      .from(parentCommunications)
      .where(eq(parentCommunications.userId, userId))
      .orderBy(desc(parentCommunications.createdAt));
  }

  async createParentCommunication(userId: string, communication: InsertParentCommunication): Promise<ParentCommunication> {
    const [newCommunication] = await db
      .insert(parentCommunications)
      .values({ ...communication, userId })
      .returning();
    return newCommunication;
  }

  async updateParentCommunication(userId: string, id: number, updates: Partial<InsertParentCommunication>): Promise<void> {
    await db
      .update(parentCommunications)
      .set(updates)
      .where(and(eq(parentCommunications.id, id), eq(parentCommunications.userId, userId)));
  }

  async deleteParentCommunication(userId: string, id: number): Promise<void> {
    await db
      .delete(parentCommunications)
      .where(and(eq(parentCommunications.id, id), eq(parentCommunications.userId, userId)));
  }



  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({ ...notification, userId })
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(userId: string, id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markNotificationAsSent(userId: string, id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isSent: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async deleteNotification(userId: string, id: number): Promise<void> {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Backup operations
  async getBackups(userId: string): Promise<Backup[]> {
    return await db
      .select()
      .from(backups)
      .where(eq(backups.userId, userId))
      .orderBy(desc(backups.createdAt));
  }

  async createBackup(userId: string, backup: InsertBackup): Promise<Backup> {
    const [newBackup] = await db
      .insert(backups)
      .values({ ...backup, userId })
      .returning();
    return newBackup;
  }

  async updateBackupStatus(userId: string, id: number, status: string): Promise<void> {
    await db
      .update(backups)
      .set({ status })
      .where(and(eq(backups.id, id), eq(backups.userId, userId)));
  }

  // User consent operations
  async getUserConsents(userId: string): Promise<UserConsent[]> {
    return await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, userId));
  }

  async createUserConsent(userId: string, consent: InsertUserConsent): Promise<UserConsent> {
    try {
      console.log("Creating/updating consent for user:", userId, "type:", consent.consentType);
      
      // Use a simple insert approach with proper error handling
      const consentData = {
        userId,
        consentType: consent.consentType,
        consentVersion: consent.consentVersion || "1.0",
        isConsented: consent.isConsented,
        consentedAt: consent.consentedAt,
        withdrawnAt: consent.withdrawnAt,
      };

      // Try to insert first
      try {
        const [newConsent] = await db
          .insert(userConsents)
          .values(consentData)
          .returning();
        console.log("Created new consent:", newConsent.id);
        return newConsent;
      } catch (insertError) {
        // If insert fails due to duplicate, try update
        console.log("Insert failed, trying update for:", consent.consentType);
        
        const [updatedConsent] = await db
          .update(userConsents)
          .set({
            isConsented: consent.isConsented,
            consentVersion: consent.consentVersion || "1.0",
            consentedAt: consent.consentedAt,
            withdrawnAt: consent.withdrawnAt,
          })
          .where(and(eq(userConsents.userId, userId), eq(userConsents.consentType, consent.consentType)))
          .returning();
        
        if (!updatedConsent) {
          throw new Error(`Failed to update consent for ${consent.consentType}`);
        }
        
        console.log("Updated existing consent:", updatedConsent.id);
        return updatedConsent;
      }
    } catch (error) {
      console.error("Error in createUserConsent:", error);
      throw new Error(`Failed to process consent ${consent.consentType}: ${error}`);
    }
  }

  async updateUserConsent(userId: string, consentType: string, isConsented: boolean): Promise<void> {
    const now = new Date();
    const result = await db
      .update(userConsents)
      .set({
        isConsented,
        consentedAt: isConsented ? now : null,
        withdrawnAt: !isConsented ? now : null,
      })
      .where(and(eq(userConsents.userId, userId), eq(userConsents.consentType, consentType)));
    
    // If no rows were updated, throw an error to trigger creation
    if (result.rowCount === 0) {
      throw new Error(`No consent record found for user ${userId} and type ${consentType}`);
    }
  }

  async hasRequiredConsents(userId: string): Promise<boolean> {
    const requiredConsentTypes = ['service_terms', 'privacy_policy', 'oauth_services', 'data_responsibility'];
    
    const consents = await db
      .select()
      .from(userConsents)
      .where(
        and(
          eq(userConsents.userId, userId),
          eq(userConsents.isConsented, true),
          inArray(userConsents.consentType, requiredConsentTypes)
        )
      );
    
    return consents.length >= requiredConsentTypes.length;
  }
}

export const storage = new DatabaseStorage();
