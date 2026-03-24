import { Link, Head, useForm } from '@inertiajs/react';
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
import type { User, AffiliateCode, EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliates', href: '/admin/affiliates/codes' },
    { title: 'Codes', href: '/admin/affiliates/codes' },
    { title: 'Edit', href: '' },
];

export default function EditCode({ code, users }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: String(code.user_id),
        code: code.code,
        discount_type: code.discount_type,
        discount_value: code.discount_value,
        commission_rate: parseFloat(code.commission_rate),
        max_uses: code.max_uses ? String(code.max_uses) : '',
        is_active: code.is_active,
        expires_at: code.expires_at ? code.expires_at.substring(0, 10) : '',
        notes: code.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/affiliates/codes/${code.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Code — ${code.code}`} />
            <Wrapper>
                <PageHeader
                    title={`Edit Code: ${code.code}`}
                    description={`${code.uses_count} uses so far`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/affiliates/codes"
                                prefetch
                                cacheFor={30}
                            >
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
                                    <SelectItem
                                        key={user.id}
                                        value={String(user.id)}
                                    >
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
                            onChange={(e) =>
                                setData('code', e.target.value.toUpperCase())
                            }
                            className="font-mono"
                        />
                        <InputError message={errors.code} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Discount Type</Label>
                            <Select
                                value={data.discount_type}
                                onValueChange={(v) =>
                                    setData(
                                        'discount_type',
                                        v as typeof data.discount_type,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No discount
                                    </SelectItem>
                                    <SelectItem value="percentage">
                                        Percentage
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                        Fixed amount
                                    </SelectItem>
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
                                    max={
                                        data.discount_type === 'percentage'
                                            ? 100
                                            : undefined
                                    }
                                    value={data.discount_value}
                                    onChange={(e) =>
                                        setData(
                                            'discount_value',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <InputError message={errors.discount_value} />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="commission_rate">
                                Commission Rate (%)
                            </Label>
                            <Input
                                id="commission_rate"
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={data.commission_rate}
                                onChange={(e) =>
                                    setData(
                                        'commission_rate',
                                        Number(e.target.value),
                                    )
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
                                onChange={(e) =>
                                    setData('max_uses', e.target.value)
                                }
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
                            onChange={(e) =>
                                setData('expires_at', e.target.value)
                            }
                        />
                        <InputError message={errors.expires_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active
                        </Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
