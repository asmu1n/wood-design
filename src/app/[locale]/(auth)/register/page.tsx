'use client';

import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { registerSchema } from '@/lib/validations';
import { Register } from '@/db/services/auth';
import { useTranslations } from 'next-intl';

export default function Registry() {
    const t = useTranslations();
    const registerFormConfig: FormItemConfig<AuthCredentials>[] = [
        {
            key: 'name',
            label: t('form.name'),
            options: {
                placeholder: t('form.name_placeholder')
            }
        },
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
            <AuthForm type="REGISTER" schema={registerSchema} formConfig={registerFormConfig} onSubmit={Register} />
        </div>
    );
}
