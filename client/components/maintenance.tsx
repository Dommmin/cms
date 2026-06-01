'use client';

import { Calendar, Mail, Phone, Settings, ShieldAlert } from 'lucide-react';

interface MaintenanceProps {
    siteName: string;
    contactEmail?: string;
    contactPhone?: string;
    maintenanceUntil?: string | null;
    locale?: string;
}

export function Maintenance({
    siteName,
    contactEmail,
    contactPhone,
    maintenanceUntil,
    locale = 'pl',
}: MaintenanceProps) {
    const isPl = locale === 'pl';

    const t = {
        title: isPl ? 'Prace konserwacyjne' : 'Under Maintenance',
        subtitle: isPl
            ? 'Trwają prace techniczne nad ulepszeniem naszego sklepu. Wrócimy do Państwa niebawem.'
            : 'We are currently performing scheduled maintenance to improve our store. We will be back shortly.',
        expectedReturn: isPl ? 'Przewidywany powrót:' : 'Expected return:',
        contactUs: isPl ? 'Skontaktuj się z nami' : 'Contact Us',
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-100">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-violet-600/10 blur-[100px] duration-[8000ms]" />
            <div className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] animate-pulse rounded-full bg-indigo-600/10 blur-[120px] duration-[6000ms]" />

            {/* Main Premium Card */}
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-xl">
                {/* Gear Icon with rotation animation */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 ring-4 ring-violet-500/5">
                    <Settings className="h-8 w-8 animate-[spin_20s_linear_infinite]" />
                </div>

                <h1 className="mb-2 bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                    {siteName}
                </h1>

                <h2 className="mb-4 text-xl font-semibold text-slate-200">
                    {t.title}
                </h2>

                <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
                    {t.subtitle}
                </p>

                {/* Maintenance Until Section */}
                {maintenanceUntil && (
                    <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-violet-300">
                        <Calendar className="h-4 w-4 shrink-0 text-violet-400" />
                        <span className="font-medium">
                            {t.expectedReturn}{' '}
                            <strong className="ml-1 text-white">
                                {maintenanceUntil}
                            </strong>
                        </span>
                    </div>
                )}

                {/* Contact Information */}
                {(contactEmail || contactPhone) && (
                    <div className="border-t border-white/5 pt-6 text-left">
                        <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            {t.contactUs}
                        </h3>
                        <div className="space-y-2.5">
                            {contactEmail && (
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                                >
                                    <Mail className="h-4 w-4 text-violet-400" />
                                    <span>{contactEmail}</span>
                                </a>
                            )}
                            {contactPhone && (
                                <a
                                    href={`tel:${contactPhone}`}
                                    className="flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                                >
                                    <Phone className="h-4 w-4 text-violet-400" />
                                    <span>{contactPhone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer indicator */}
            <div className="absolute bottom-6 flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Tryb administracyjny aktywny dla personelu</span>
            </div>
        </div>
    );
}
