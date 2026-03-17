import { Link, Head, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type User = { id: number; name: string; email: string };

type Props = { users: User[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliates', href: '/admin/affiliates/codes' },
    { title: 'Codes', href: '/admin/affiliates/codes' },
    { title: 'Create', href: '' },
];

export default function CreateCode({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        code: '',
        discount_type: 'none' as 'none' | 'percentage' | 'fixed',
        discount_value: 0,
        commission_rate: 10,
        max_uses: '',
        is_active: true,
        expires_at: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/affiliates/codes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Affiliate Code" />
            <Wrapper>
                <PageHeader
                    title="Create Affiliate Code"
                    description="Add a new referral code for an affiliate"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/affiliates/codes' prefetch cacheFor={30}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Affiliate User *</Label>
                        <Select
                            value={data.user_id}
                            onValueChange={(v) => setData('user_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.user_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">Code *</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="e.g. JOHN20"
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            Only uppercase letters, numbers, hyphens and underscores.
                        </p>
                        <InputError message={errors.code} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Discount Type</Label>
                            <Select
                                value={data.discount_type}
                                onValueChange={(v) =>
                                    setData('discount_type', v as typeof data.discount_type)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No discount</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {data.discount_type !== 'none' && (
                            <div className="grid gap-2">
                                <Label htmlFor="discount_value">
                                    {data.discount_type === 'percentage'
                                        ? 'Discount %'
                                        : 'Discount (cents)'}
                                </Label>
                                <Input
                                    id="discount_value"
                                    type="number"
                                    min={0}
                                    max={data.discount_type === 'percentage' ? 100 : undefined}
                                    value={data.discount_value}
                                    onChange={(e) =>
                                        setData('discount_value', Number(e.target.value))
                                    }
                                />
                                <InputError message={errors.discount_value} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                            <Input
                                id="commission_rate"
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={data.commission_rate}
                                onChange={(e) =>
                                    setData('commission_rate', Number(e.target.value))
                                }
                            />
                            <InputError message={errors.commission_rate} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="max_uses">Max Uses</Label>
                            <Input
                                id="max_uses"
                                type="number"
                                min={1}
                                value={data.max_uses}
                                onChange={(e) => setData('max_uses', e.target.value)}
                                placeholder="Unlimited"
                            />
                            <InputError message={errors.max_uses} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="expires_at">Expires At</Label>
                        <Input
                            id="expires_at"
                            type="date"
                            value={data.expires_at}
                            onChange={(e) => setData('expires_at', e.target.value)}
                        />
                        <InputError message={errors.expires_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Internal notes about this affiliate"
                            rows={3}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active
                        </Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Code'}
                    </Button>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
