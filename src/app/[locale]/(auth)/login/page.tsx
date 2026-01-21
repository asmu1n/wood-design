'use client';

import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { loginSchema } from '@/lib/validations';
import { LoginWithCredentials } from '@/db/services/auth';
import { useTranslations } from 'next-intl';

/**
 * Renders a localized sign-in form configured with validation and credential submission.
 *
 * @returns A JSX element containing an AuthForm configured for user login with translated labels/placeholders, `loginSchema` validation, and `LoginWithCredentials` as the submit handler.
 */
export default function SignIn() {
    const t = useTranslations();
    const loginFormConfig: FormItemConfig<Pick<AuthCredentials, 'email' | 'password'>>[] = [
        {
            key: 'email',
            label: t('form.email'),
            type: 'email',
            options: {
                placeholder: t('form.email_placeholder')
            }
        },
        {
            key: 'password',
            label: t('form.password'),
            type: 'password',
            options: {
                placeholder: t('form.password_placeholder')
            }
        }
    ];

    return (
        <div>
            <AuthForm type="LOGIN" schema={loginSchema} formConfig={loginFormConfig} onSubmit={LoginWithCredentials} />
        </div>
    );
}