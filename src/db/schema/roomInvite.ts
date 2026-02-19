import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import rooms from './rooms';
import users from './users';

export const accessType = pgEnum('access_type', ['ALL', 'ONLY_READ']);

const roomInvite = pgTable('roomInvite', {
    id: uuid('id').notNull().primaryKey(),
    roomId: uuid('room_id')
        .notNull()
        .references(() => rooms.id),
    actionUserId: uuid('action_user_id')
        .notNull()
        .references(() => users.id),
    invitedUserId: uuid('invited_user_id')
        .notNull()
        .references(() => users.id),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    accessType: accessType().notNull()
});

export default roomInvite;
