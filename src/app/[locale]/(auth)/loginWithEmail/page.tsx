'use client';

import { loginWithEmailSchema } from '@/lib/validations';
import { LoginWithEmail } from '@/db/services/auth';
import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { useTranslations } from 'next-intl';

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
