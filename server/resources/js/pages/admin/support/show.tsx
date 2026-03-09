import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, SendIcon, LockIcon, UserIcon, ShoppingBagIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Agent = { id: number; name: string };
type StatusOption = { value: string; label: string; color: string };

type Message = {
    id: number;
    sender_type: 'customer' | 'agent';
    sender_name: string;
    body: string;
    is_internal: boolean;
    read_at: string | null;
    created_at: string;
};

type Order = {
    id: number;
    reference_number: string;
    status: string;
    total: number;
};

type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    orders?: Order[];
};

type Conversation = {
    id: number;
    subject: string;
    status: string;
    channel: string;
    email: string | null;
    name: string | null;
    created_at: string;
    last_reply_at: string | null;
    messages: Message[];
    assigned_to: Agent | null;
    customer: Customer | null;
};

type CannedResponse = { id: number; title: string; shortcut: string; body: string };

type Props = {
    conversation: Conversation;
    agents: Agent[];
    canned_responses: CannedResponse[];
    statuses: StatusOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: '/admin/support' },
    { title: 'Conversation', href: '#' },
];

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-700',
};

export default function SupportShow({ conversation, agents, canned_responses, statuses }: Props) {
    const [isInternal, setIsInternal] = useState(false);

    const replyForm = useForm({ body: '', is_internal: false });

    function submitReply(e: React.FormEvent) {
        e.preventDefault();
        replyForm.transform((data) => ({ ...data, is_internal: isInternal }));
        replyForm.post(`/admin/support/${conversation.id}/reply`, {
            onSuccess: () => {
                replyForm.reset();
                toast.success(isInternal ? 'Internal note added.' : 'Reply sent.');
            },
        });
    }

    function handleStatusChange(status: string) {
        router.post(`/admin/support/${conversation.id}/status`, { status }, {
            onSuccess: () => toast.success('Status updated.'),
        });
    }

    function handleAssign(userId: string) {
        router.post(`/admin/support/${conversation.id}/assign`, { assigned_to: userId || null }, {
            onSuccess: () => toast.success('Assigned.'),
        });
    }

    function insertCannedResponse(body: string) {
        replyForm.setData('body', body);
    }

    const customerName = conversation.customer
        ? `${conversation.customer.first_name} ${conversation.customer.last_name}`
        : conversation.name ?? conversation.email ?? 'Guest';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Support — ${conversation.subject}`} />
            <Wrapper>
                <PageHeader title={conversation.subject} description={`Channel: ${conversation.channel}`}>
                    <PageHeaderActions>
                        <Badge className={statusColors[conversation.status]}>
                            {statuses.find((s) => s.value === conversation.status)?.label ?? conversation.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => router.visit('/admin/support')}>
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ── Left: Chat ─────────────────────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-4">

                        {/* Messages */}
                        <div className="rounded-lg border bg-card p-4 space-y-4 max-h-[500px] overflow-y-auto">
                            {conversation.messages.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-8">No messages yet.</p>
                            )}
                            {conversation.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[75%] rounded-lg px-4 py-2.5 shadow-sm ${
                                        msg.is_internal
                                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200'
                                            : msg.sender_type === 'customer'
                                                ? 'bg-muted text-foreground'
                                                : 'bg-primary text-primary-foreground'
                                    }`}>
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-xs font-semibold opacity-70">{msg.sender_name}</span>
                                            {msg.is_internal && (
                                                <span className="flex items-center gap-1 text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                                                    <LockIcon className="h-2.5 w-2.5" />
                                                    Internal note
                                                </span>
                                            )}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                                        <p className="mt-1 text-[10px] opacity-50">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply form */}
                        {conversation.status !== 'closed' && (
                            <form onSubmit={submitReply} className="rounded-lg border bg-card p-4 space-y-3">
                                <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium">Reply type:</Label>
                                    <div className="flex rounded-md border overflow-hidden text-sm">
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
                                                const cr = canned_responses.find((c) => String(c.id) === e.target.value);
                                                if (cr) { insertCannedResponse(cr.body); }
                                                e.target.value = '';
                                            }}
                                        >
                                            <option value="" disabled>Quick reply...</option>
                                            {canned_responses.map((cr) => (
                                                <option key={cr.id} value={cr.id}>#{cr.shortcut} — {cr.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <Textarea
                                    value={replyForm.data.body}
                                    onChange={(e) => replyForm.setData('body', e.target.value)}
                                    placeholder={isInternal ? 'Internal note (visible to agents only)...' : 'Type your reply...'}
                                    rows={4}
                                    className={isInternal ? 'border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10' : ''}
                                />
                                <InputError message={replyForm.errors.body} />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={replyForm.processing || !replyForm.data.body.trim()}>
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
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold text-sm">Customer</h3>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">{customerName}</p>
                                {conversation.email && (
                                    <p className="text-sm text-muted-foreground">{conversation.email}</p>
                                )}
                                {conversation.customer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full"
                                        onClick={() => router.visit(`/admin/ecommerce/customers/${conversation.customer!.id}`)}
                                    >
                                        View Profile
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Recent orders */}
                        {conversation.customer?.orders && conversation.customer.orders.length > 0 && (
                            <div className="rounded-lg border bg-card p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold text-sm">Recent Orders</h3>
                                </div>
                                <ul className="space-y-2">
                                    {conversation.customer.orders.map((order) => (
                                        <li key={order.id}>
                                            <button
                                                type="button"
                                                className="w-full rounded-md border bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                                                onClick={() => router.visit(`/admin/ecommerce/orders/${order.id}`)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">#{order.reference_number}</span>
                                                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                                                </div>
                                                <p className="text-muted-foreground">{Number(order.total).toFixed(2)} zł</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Manage */}
                        <div className="rounded-lg border bg-card p-4 space-y-4">
                            <h3 className="font-semibold text-sm">Manage</h3>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={conversation.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Assign to</Label>
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    value={conversation.assigned_to?.id ?? ''}
                                    onChange={(e) => handleAssign(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-t pt-3">
                                <p className="text-xs text-muted-foreground">
                                    Created: {new Date(conversation.created_at).toLocaleString()}
                                </p>
                                {conversation.last_reply_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Last reply: {new Date(conversation.last_reply_at).toLocaleString()}
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
