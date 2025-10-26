import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const memorials = pgTable('memorials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  profileImage: text('profile_image'),
  birthDate: text('birth_date'),
  deathDate: text('death_date'),
  location: text('location'),
  
  // Section data stored as JSON for flexibility
  obituary: text('obituary'),
  timeline: jsonb('timeline').default([]),
  favorites: jsonb('favorites').default([]),
  familyTree: jsonb('family_tree').default([]),
  gallery: jsonb('gallery').default([]),
  serviceInfo: jsonb('service_info'),
  memoryWall: jsonb('memory_wall').default([]), 
  isPublished: boolean('is_published').default(false),
  customUrl: text('custom_url').unique(),
  theme: text('theme').default('default'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  memorialId: uuid('memorial_id').references(() => memorials.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  author: text('author').notNull(),
  images: text('images').array(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  memorialId: uuid('memorial_id').references(() => memorials.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  attending: text('attending').notNull(), // 'in_person' | 'virtual'
  guests: jsonb('guests').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  memorials: many(memorials),
  memories: many(memories),
}));

export const memorialRelations = relations(memorials, ({ one, many }) => ({
  user: one(users, {
    fields: [memorials.userId],
    references: [users.id],
  }),
  memories: many(memories),
  rsvps: many(rsvps),
}));

export const memoryRelations = relations(memories, ({ one }) => ({
  memorial: one(memorials, {
    fields: [memories.memorialId],
    references: [memorials.id],
  }),
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
}));