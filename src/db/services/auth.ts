'use server';
import db from '@/lib/config/database';
import responseBody from '../../lib/response';
import { hash } from 'bcryptjs';
import users from '@/db/schema/users';
import { signIn, signOut as onSignOut } from '@/lib/config/auth';
import { selectUserByEmail } from '@/db/services/users';
import { getTranslations } from 'next-intl/server';

/**
 * Register a new user, sign them in, and return a localized success or failure response.
 *
 * @param params - Object containing `name`, `email`, and `password` for the new user.
 * @returns An object indicating operation success and a localized message describing the result.
 */
async function Register(params: AuthCredentials) {
    const t = await getTranslations('auth');

    try {
        const { name, email, password } = params;

        const existingUser = await selectUserByEmail(email);

        if (existingUser) {
            throw new Error(t('user_exists'));
        }

        const hashedPassword = await hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword
        });

        await LoginWithCredentials({ email, password });

        return responseBody(true, t('register_success'));
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : t('register_error'));
    }
}

/**
 * Authenticate a user using email and password and produce a localized success or failure response.
 *
 * @param credentials - Object containing `email` and `password` for credential-based sign-in
 * @returns A response body indicating success with the localized `'login_success'` message on successful authentication, or a failure response containing the error message returned by the sign-in attempt or the localized `'login_error'` message
 */
async function LoginWithCredentials(credentials: Pick<AuthCredentials, 'email' | 'password'>) {
    const t = await getTranslations('auth');

    try {
        const { email, password } = credentials;
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        if (result?.error) {
            throw new Error(result.error);
        }

        return responseBody(true, t('login_success'));
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : t('login_error'));
    }
}

/**
 * Initiates an email-based sign-in flow by sending a login link to the specified email address.
 *
 * @param credentials - Object with the `email` that will receive the login link
 * @returns On success, the sign-in initiation result (e.g., provider response or redirect information); on failure, a failure response object containing the error message
 */
async function LoginWithEmail(credentials: Pick<AuthCredentials, 'email'>) {
    const t = await getTranslations('auth');

    try {
        const isExist = await selectUserByEmail(credentials.email);

        if (!isExist) {
            throw new Error(t('user_not_found'));
        }

        return signIn('resend', credentials);
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : t('send_fail'));
    }
}

//登出
async function signOut() {
    await onSignOut();
}

export { Register, LoginWithCredentials, signOut, LoginWithEmail };