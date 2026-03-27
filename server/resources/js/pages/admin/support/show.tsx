import { Head, Link, router, useForm, usePoll } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    SendIcon,
    LockIcon,
    UserIcon,
    ShoppingBagIcon,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as CustomerController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerController';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import * as SupportConversationController from '@/actions/App/Http/Controllers/Admin/SupportConversationController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ShowProps } from './show.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: SupportConversationController.index.url() },
    { title: 'Conversation', href: '#' },
];

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-700',
};

export default function SupportShow({
    conversation,
    agents,
    canned_responses,
    statuses,
}: ShowProps) {
    const [isInternal, setIsInternal] = useState(false);

    // Refresh conversation every 5 seconds to pick up new customer messages
    usePoll(5000, { only: ['conversation'] });

    const replyForm = useForm({ body: '', is_internal: false });

    function submitReply(e: React.FormEvent) {
        e.preventDefault();
        replyForm.transform((data) => ({ ...data, is_internal: isInternal }));
        replyForm.post(
            SupportConversationController.reply.url(conversation.id),
            {
                onSuccess: () => {
                    replyForm.reset();
                    toast.success(
                        isInternal ? 'Internal note added.' : 'Reply sent.',
                    );
                },
            },
        );
    }

    function handleStatusChange(status: string) {
        router.post(
            SupportConversationController.changeStatus.url(conversation.id),
            { status },
            {
                onSuccess: () => toast.success('Status updated.'),
            },
        );
    }

    function handleAssign(userId: string) {
        router.post(
            SupportConversationController.assign.url(conversation.id),
            { assigned_to: userId || null },
            {
                onSuccess: () => toast.success('Assigned.'),
            },
        );
    }

    function insertCannedResponse(body: string) {
        replyForm.setData('body', body);
    }

    const customerName = conversation.customer
        ? `${conversation.customer.first_name} ${conversation.customer.last_name}`
        : (conversation.name ?? conversation.email ?? 'Guest');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Support — ${conversation.subject}`} />
            <Wrapper>
                <PageHeader
                    title={conversation.subject}
                    description={`Channel: ${conversation.channel}`}
                >
                    <PageHeaderActions>
                        <Badge className={statusColors[conversation.status]}>
                            {statuses.find(
                                (s) => s.value === conversation.status,
                            )?.label ?? conversation.status}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={SupportConversationController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left: Chat ─────────────────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Messages */}
                        <div className="max-h-[500px] space-y-4 overflow-y-auto rounded-lg border bg-card p-4">
                            {conversation.messages.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No messages yet.
                                </p>
                            )}
                            {conversation.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg px-4 py-2.5 shadow-sm ${
                                            msg.is_internal
                                                ? 'border border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200'
                                                : msg.sender_type === 'customer'
                                                  ? 'bg-muted text-foreground'
                                                  : 'bg-primary text-primary-foreground'
                                        }`}
                                    >
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-xs font-semibold opacity-70">
                                                {msg.sender_name}
                                            </span>
                                            {msg.is_internal && (
                                                <span className="flex items-center gap-1 text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                                                    <LockIcon className="h-2.5 w-2.5" />
                                                    Internal note
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.body}
                                        </p>
                                        <p className="mt-1 text-[10px] opacity-50">
                                            {new Date(
                                                msg.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply form */}
                        {conversation.status !== 'closed' && (
                            <form
                                onSubmit={submitReply}
                                className="space-y-3 rounded-lg border bg-card p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium">
                                        Reply type:
                                    </Label>
                                    <div className="flex overflow-hidden rounded-md border text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setIsInternal(false)}
                                            className={`px-3 py-1.5 transition-colors ${!isInternal ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        >
                                            Reply
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsInternal(true)}
                                            className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${isInternal ? 'bg-yellow-500 text-white' : 'hover:bg-muted'}`}
                                        >
                                            <LockIcon className="h-3 w-3" />
                                            Internal note
                                        </button>
                                    </div>

                                    {canned_responses.length > 0 && (
                                        <select
                                            className="ml-auto rounded-md border bg-background px-2 py-1.5 text-sm"
                                            defaultValue=""
                                            onChange={(e) => {
                                                const cr =
                                                    canned_responses.find(
                                                        (c) =>
                                                            String(c.id) ===
                                                            e.target.value,
                                                    );
                                                if (cr) {
                                                    insertCannedResponse(
                                                        cr.body,
                                                    );
                                                }
                                                e.target.value = '';
                                            }}
                                        >
                                            <option value="" disabled>
                                                Quick reply...
                                            </option>
                                            {canned_responses.map((cr) => (
                                                <option
                                                    key={cr.id}
                                                    value={cr.id}
                                                >
                                                    #{cr.shortcut} — {cr.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <Textarea
                                    value={replyForm.data.body}
                                    onChange={(e) =>
                                        replyForm.setData(
                                            'body',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        isInternal
                                            ? 'Internal note (visible to agents only)...'
                                            : 'Type your reply...'
                                    }
                                    rows={4}
                                    className={
                                        isInternal
                                            ? 'border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10'
                                            : ''
                                    }
                                />
                                <InputError message={replyForm.errors.body} />

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={
                                            replyForm.processing ||
                                            !replyForm.data.body.trim()
                                        }
                                    >
                                        <SendIcon className="mr-2 h-4 w-4" />
                                        {isInternal ? 'Add Note' : 'Send Reply'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {conversation.status === 'closed' && (
                            <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                This conversation is closed.{' '}
                                <button
                                    type="button"
                                    className="font-medium text-primary underline underline-offset-2"
                                    onClick={() => handleStatusChange('open')}
                                >
                                    Reopen
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Customer panel ───────────────────────────────── */}
                    <div className="space-y-4">
                        {/* Customer info */}
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">
                                    Customer
                                </h3>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">{customerName}</p>
                                {conversation.email && (
                                    <p className="text-sm text-muted-foreground">
                                        {conversation.email}
                                    </p>
                                )}
                                {conversation.customer && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full"
                                    >
                                        <Link
                                            href={CustomerController.show.url(
                                                conversation.customer!.id,
                                            )}
                                            prefetch
                                            cacheFor={60}
                                        >
                                            View Profile
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Recent orders */}
                        {conversation.customer?.orders &&
                            conversation.customer.orders.length > 0 && (
                                <div className="space-y-3 rounded-lg border bg-card p-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold">
                                            Recent Orders
                                        </h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {conversation.customer.orders.map(
                                            (order) => (
                                                <li key={order.id}>
                                                    <Link
                                                        href={OrderController.show.url(
                                                            order.id,
                                                        )}
                                                        prefetch
                                                        cacheFor={60}
                                                        className="block w-full rounded-md border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">
                                                                #
                                                                {
                                                                    order.reference_number
                                                                }
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-muted-foreground">
                                                            {Number(
                                                                order.total,
                                                            ).toFixed(2)}{' '}
                                                            zł
                                                        </p>
                                                    </Link>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {/* Manage */}
                        <div className="space-y-4 rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-semibold">Manage</h3>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Status
                                </Label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={conversation.status}
                                    onChange={(e) =>
                                        handleStatusChange(e.target.value)
                                    }
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    Assign to
                                </Label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={conversation.assigned_to?.id ?? ''}
                                    onChange={(e) =>
                                        handleAssign(e.target.value)
                                    }
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-t pt-3">
                                <p className="text-xs text-muted-foreground">
                                    Created:{' '}
                                    {new Date(
                                        conversation.created_at,
                                    ).toLocaleString()}
                                </p>
                                {conversation.last_reply_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Last reply:{' '}
                                        {new Date(
                                            conversation.last_reply_at,
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
