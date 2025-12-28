import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import users from './users';

const rooms = pgTable(
    'rooms',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        lastUpdateAt: timestamp('last_update_at').defaultNow(),
        createUserId: uuid('create_user_id')
            .notNull()
            .references(() => users.id),
        allowedUserIds: uuid('allowed_user_ids').array().notNull(),
        createdAt: timestamp('created_at', {
            withTimezone: true
        }).defaultNow()
    },
    table => [index('allowed_user_ids_idx').using('gin', table.allowedUserIds)]
);

export const roomInsertSchema = createInsertSchema(rooms);

export const roomUpdateSchema = createUpdateSchema(rooms);

export default rooms;
