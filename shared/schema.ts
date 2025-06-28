import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  date,
  time,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schedules table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 5 }), // HH:MM format
  endTime: varchar("end_time", { length: 5 }), // HH:MM format
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  category: varchar("category", { length: 50 }).default("일반"),
  categoryColor: varchar("category_color", { length: 7 }).default("#3B82F6"), // hex color
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type", { enum: ["daily", "weekly", "monthly"] }),
  recurringDays: varchar("recurring_days"), // for weekly: "1,3,5" (Mon, Wed, Fri)
  recurringEndDate: date("recurring_end_date"),
  recurringParentId: integer("recurring_parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student incident records table
export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  studentIds: integer("student_ids").array(),
  date: date("date").notNull(),
  severity: varchar("severity", { enum: ["low", "medium", "high"] }).default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance assessments table
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  unit: text("unit").notNull(),
  task: text("task").notNull(),
  studentName: text("student_name"),
  score: integer("score"),
  maxScore: integer("max_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  grade: varchar("grade").notNull(),
  className: varchar("class_name").notNull(),
  year: varchar("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  studentNumber: varchar("student_number").notNull(),
  name: text("name").notNull(),
  riskLevel: text("risk_level").default("low"), // low, medium, high
  lastAlertDate: timestamp("last_alert_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent communication logs
export const parentCommunications = pgTable("parent_communications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  studentName: text("student_name").notNull(),
  communicationType: text("communication_type").notNull(), // phone, meeting, email, message
  purpose: text("purpose").notNull(),
  summary: text("summary").notNull(),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpCompleted: boolean("follow_up_completed").default(false),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



// Smart notifications (keeping for compatibility)
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // reminder, alert, warning, info
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedEntity: text("related_entity"), // student_name, schedule_id, etc
  scheduledFor: timestamp("scheduled_for").notNull(),
  isRead: boolean("is_read").default(false),
  isSent: boolean("is_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data backups
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  backupType: text("backup_type").notNull(), // auto, manual
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  status: text("status").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  userId: true,
  createdAt: true,
  recurringParentId: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  userId: true,
  createdAt: true,
  riskLevel: true,
  lastAlertDate: true,
});

export const insertParentCommunicationSchema = createInsertSchema(parentCommunications).omit({
  id: true,
  userId: true,
  createdAt: true,
});



export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertBackupSchema = createInsertSchema(backups).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Record = typeof records.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type ParentCommunication = typeof parentCommunications.$inferSelect;
export type InsertParentCommunication = z.infer<typeof insertParentCommunicationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Backup = typeof backups.$inferSelect;
export type InsertBackup = z.infer<typeof insertBackupSchema>;
