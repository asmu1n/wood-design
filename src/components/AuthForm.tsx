import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from '@/lib/hooks/useToast';
import { useRouter } from 'next/navigation';
import FlexForm from './FlexForm';
import { ControllerRenderProps, Path } from 'react-hook-form';
import { useTranslations } from 'next-intl';

type formItemConfigOptions<T extends FieldValues = FieldValues> = Partial<
    ControllerRenderProps<T> & {
        placeholder?: string;
        step: number;
        min: number;
        max: number;
    }
>;
export interface FormItemConfig<T extends FieldValues = FieldValues> {
    key: keyof T;
    label: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'image';
    value?: any;
    description?: string;
    slot?: (filed: ControllerRenderProps<T, Path<T>>, options?: formItemConfigOptions<T>) => React.ReactNode;
    options?: formItemConfigOptions<T>;
}

interface AuthFormProps<T extends FieldValues> {
    type: 'LOGIN' | 'REGISTER' | 'LOGIN_EMAIL';
    schema: z.Schema<T>;
    formConfig: FormItemConfig<T>[];
    onSubmit: (data: T) => Promise<IResponse> | IResponse;
}

export default function AuthForm<T extends FieldValues>({ type, schema, formConfig, onSubmit }: AuthFormProps<T>) {
    const isLogin = type === 'LOGIN' || type === 'LOGIN_EMAIL';
    const router = useRouter();
    const t = useTranslations('auth');

    async function handleSubmit(data: T) {
        try {
            const result = await onSubmit(data);

            if (result?.success === false) {
                throw new Error(result.message);
            } else if (result?.success === true) {
                toast({
                    title: t('common.success'),
                    description: result.message
                });

                if (type !== 'LOGIN_EMAIL') {
                    router.push('/');
                }
            }
        } catch (error) {
            toast({
                title: t('common.fail'),
                description: error instanceof Error ? error.message : isLogin ? t('login_error') : t('register_error'),
                variant: 'destructive'
            });
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-primary text-2xl font-semibold">{isLogin ? t('login_welcome') : t('register_welcome')}</h1>
            <p className="text-light-100">{isLogin ? t('login_description') : t('register_description')}</p>
            <FlexForm
                formInputClass=""
                schema={schema}
                formConfig={formConfig}
                onSubmit={handleSubmit}
                button={{ children: isLogin ? t('login') : t('register') }}
                parentClass="space-y-6 border border-gray-300 rounded-md p-4 dark:border-gray-700"
            />
            <p className="m-1 text-center text-base font-medium">
                <span className="mr-1">{isLogin ? t('login_ask') : t('register_ask')}</span>
                <Link className="font-bold text-blue-400 duration-300 hover:text-blue-600" href={isLogin ? '/register' : '/login'}>
                    {isLogin ? t('register') : t('login')}
                </Link>
            </p>
            {isLogin && (
                <p className="text-center text-base font-medium">
                    <Link className="font-bold text-blue-400 duration-300 hover:text-blue-600" href={type === 'LOGIN' ? '/loginWithEmail' : '/login'}>
                        {type === 'LOGIN' ? t('login_with_email') : t('login_with_password')}
                    </Link>
                </p>
            )}
        </div>
    );
}
