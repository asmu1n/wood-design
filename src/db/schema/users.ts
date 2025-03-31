import { text, pgTable, uuid, varchar, pgEnum, date, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const STATUS_ENUM = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED']);

export const ROLE_ENUM = pgEnum('user_role', ['USER', 'ADMIN']);

const users = pgTable('users', {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    image: text('avatarUrl'),
    status: STATUS_ENUM('status').default('PENDING'),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    roles: ROLE_ENUM('roles').array().default(['USER']),
    lastActivityDate: date('last_activity_date').defaultNow(),
    createAt: timestamp('created_at', {
        withTimezone: true
    }).defaultNow()
});

export const userInsertSchema = createInsertSchema(users);

export const userUpdateSchema = createUpdateSchema(users);

export default users;
