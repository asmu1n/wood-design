import { relations } from 'drizzle-orm';
import rooms from '@/db/schema/rooms';
import users from './schema/users';
import roomInvite from './schema/roomInvite';

export const usersRelations = relations(users, ({ many }) => ({
    createdRooms: many(rooms),
    invitedUser: many(roomInvite),
    actionUser: many(roomInvite)
}));

export const roomsRelations = relations(rooms, ({ one }) => ({
    createUser: one(users, { fields: [rooms.createUserId], references: [users.id] })
}));

export const roomInviteRelations = relations(roomInvite, ({ one }) => ({
    room: one(rooms, {
        fields: [roomInvite.roomId],
        references: [rooms.id]
    }),
    invitedUser: one(users, {
        fields: [roomInvite.invitedUserId],
        references: [users.id]
    }),
    actionUser: one(users, {
        fields: [roomInvite.actionUserId],
        references: [users.id]
    })
}));
