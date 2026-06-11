import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { dashboard } from '@/routes/admin';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';
import type { TwoFactorProps } from './two-factor.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    adminMode = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    const controls = (
        <>
            {twoFactorEnabled ? (
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-start space-y-4">
                        <Badge variant="default">Enabled</Badge>
                        <p className="text-muted-foreground">
                            With two-factor authentication enabled, you will be
                            prompted for a secure, random pin during login,
                            which you can retrieve from the TOTP-supported
                            application on your phone.
                        </p>

                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />

                        <div className="relative inline">
                            <Form action={disable.url()} method="delete">
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        type="submit"
                                        disabled={processing}
                                    >
                                        <ShieldBan /> Disable 2FA
                                    </Button>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <Badge variant="destructive">Disabled</Badge>
                    <p className="text-muted-foreground">
                        When you enable two-factor authentication, you will be
                        prompted for a secure pin during login. This pin can be
                        retrieved from a TOTP-supported application on your
                        phone.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button onClick={() => setShowSetupModal(true)}>
                                <ShieldCheck />
                                Continue Setup
                            </Button>
                        ) : (
                            <Form
                                action={enable.url()}
                                method="post"
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <Button type="submit" disabled={processing}>
                                        <ShieldCheck />
                                        Enable 2FA
                                    </Button>
                                )}
                            </Form>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </>
    );

    return (
        <>
            <Head title="Two-Factor Authentication" />

            {adminMode ? (
                <AuthLayout
                    title="Two-Factor Authentication"
                    description="Enable or manage two-factor authentication before continuing."
                >
                    <div className="space-y-6">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="px-0"
                        >
                            <Link href={dashboard.url()}>
                                <ArrowLeft />
                                Back to panel
                            </Link>
                        </Button>
                        {controls}
                    </div>
                </AuthLayout>
            ) : (
                <AppLayout breadcrumbs={breadcrumbs}>
                    <h1 className="sr-only">
                        Two-Factor Authentication Settings
                    </h1>

                    <SettingsLayout>
                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Two-Factor Authentication"
                                description="Manage your two-factor authentication settings"
                            />
                            {controls}
                        </div>
                    </SettingsLayout>
                </AppLayout>
            )}
        </>
    );
}
