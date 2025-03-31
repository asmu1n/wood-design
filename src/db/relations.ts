import { relations } from 'drizzle-orm';
import rooms from '@/db/schema/rooms';
import users from './schema/users';

export const usersRelations = relations(users, ({ many }) => ({
    rooms: many(rooms)
}));

export const roomsRelations = relations(rooms, ({ one }) => ({
    users: one(users, { fields: [rooms.createUserId], references: [users.id] })
}));
