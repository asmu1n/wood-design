import { and, desc, SQL, arrayOverlaps, inArray } from 'drizzle-orm';
import db from '@/lib/config/database';
import users from '@/db/schema/users';
import { queryFilter } from '@/utils/common';

type UserState = 'non-active' | 'active';
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = ONE_DAY_IN_MS * 3;
const ONE_MONTH_IN_MS = ONE_DAY_IN_MS * 30;

//获取当前用户的状态
async function getUserState(email: string): Promise<UserState> {
    const user = await selectUserByEmail(email);

    if (!user) {
        return 'non-active';
    }

    const lastActivityDate = new Date(user.lastActivityDate || user.createAt!);

    const now = new Date();
    const timeDifference = now.getTime() - lastActivityDate.getTime();

    if (timeDifference > THREE_DAYS_IN_MS && timeDifference <= ONE_MONTH_IN_MS) {
        return 'non-active';
    }

    return 'active';
}

//id查询用户
function selectUserById(userId: string) {
    return db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, userId)
    });
}

/**
 * Fetches the first user record that matches the given email.
 *
 * @param email - The email address to look up
 * @returns The matching user record, or `undefined` if no user exists with that email
 */
function selectUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, email)
    });
}

/**
 * Fetches users whose IDs match any value in the provided list.
 *
 * @returns An array of user records matching the provided `userIds`.
 */
function selectUsersByIds(userIds: string[]) {
    return db.query.users.findMany({
        where: (table, { inArray }) => inArray(table.id, userIds)
    });
}

/**
 * Query users with pagination and optional filters.
 *
 * Supports filtering by role and by a list of user IDs, returns results ordered by newest creation date.
 *
 * @param params - Query parameters including pagination and filter fields:
 *   - `limit` (default 10) — maximum number of users to return
 *   - `pageIndex` (default 0) — zero-based page index
 *   - `role` — filter users by role (`'USER'` or `'ADMIN'`)
 *   - `ids` — filter users whose `id` is in the provided string array
 * @returns An array where the first element is an array of matching user records and the second element is the total count of matching users
 */
function queryUser({ limit = 10, pageIndex = 0, ...filterParams }: QueryParams) {
    const filterConfigMap = {
        role: (value: 'USER' | 'ADMIN') => arrayOverlaps(users.roles, [value]),
        ids: (value: string[]) => inArray(users.id, value)
    };

    const filters: SQL[] = queryFilter(filterConfigMap, filterParams);

    return Promise.all([
        db.query.users.findMany({
            limit,
            offset: pageIndex * limit,
            orderBy: desc(users.createAt),
            where: (table, { and }) => and(...filters)
        }),
        db.$count(users, and(...filters))
    ]);
}

/**
 * Checks whether a user exists for the given `userId` or `email`.
 *
 * @param userId - The user ID to validate; when provided, existence is checked by ID.
 * @param email - The email to validate; when provided and `userId` is omitted, existence is checked by email.
 * @returns `true` if a user matching the provided `userId` or `email` exists, `false` otherwise.
 */
async function validUser({ userId, email }: { userId?: string; email?: string }) {
    if (!userId && !email) {
        return false;
    }

    if (userId) {
        const user = await selectUserById(userId);

        return user?.id === userId;
    }

    if (email) {
        const user = await selectUserByEmail(email);

        return user?.email === email;
    }

    return false;
}

export { selectUserById, selectUserByEmail, selectUsersByIds, queryUser, getUserState, validUser };