import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import users from './users';

const rooms = pgTable('rooms', {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    lastUpdateAt: timestamp('last_update_at').defaultNow(),
    createUserId: uuid('create_user_id')
        .notNull()
        .references(() => users.id),
    createAt: timestamp('created_at', {
        withTimezone: true
    }).defaultNow()
});

export const roomInsertSchema = createInsertSchema(rooms);

export const roomUpdateSchema = createUpdateSchema(rooms);

export default rooms;
