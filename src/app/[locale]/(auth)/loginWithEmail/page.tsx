'use client';

import { loginWithEmailSchema } from '@/lib/validations';
import { LoginWithEmail } from '@/db/services/auth';
import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { useTranslations } from 'next-intl';

/**
 * Displays a translated email sign-in form.
 *
 * The component renders a login form configured with the email field, using the file's validation schema and the email submit handler. Field labels and placeholders are obtained from translations.
 *
 * @returns A JSX element containing the configured email login form
 */
export default function SignInWithEmail() {
    const t = useTranslations();
    const loginWithEmailConfig: FormItemConfig<Pick<AuthCredentials, 'email'>>[] = [
        {
            key: 'email',
            label: t('form.email'),
            type: 'email',
            options: {
                placeholder: t('form.email_placeholder')
            }
        }
    ];

    return (
        <div>
            <AuthForm type="LOGIN_EMAIL" schema={loginWithEmailSchema} formConfig={loginWithEmailConfig} onSubmit={LoginWithEmail} />
        </div>
    );
}