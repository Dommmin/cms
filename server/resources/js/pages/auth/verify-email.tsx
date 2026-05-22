import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="space-y-6 text-center">
                <Form action={send.url()} method="post">
                    {({ processing }) => (
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>
                    )}
                </Form>

                <Form action={logout.url()} method="post">
                    <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                        Log out
                    </button>
                </Form>
            </div>
        </AuthLayout>
    );
}
