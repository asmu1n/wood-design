'use server';
import db from '@/lib/config/database';
import responseBody from '../../lib/response';
import { hash } from 'bcryptjs';
import users from '@/db/schema/users';
import { signIn, signOut as onSignOut } from '@/lib/config/auth';
import { selectUserByEmail } from '@/db/services/users';
import { getTranslations } from 'next-intl/server';

//注册
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

//登录验证
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

//邮箱授权链接登录
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
