import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Star,
    MessageSquare,
    ThumbsUp,
    Save,
    Package,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';

type Customer = {
    id: number;
    name: string;
    email: string;
};

type Product = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    thumbnail?: string;
};

type Review = {
    id: number;
    product: Product;
    customer?: Customer;
    rating: number;
    title?: string;
    body: string;
    status: string;
    helpful_count: number;
    pros?: string;
    cons?: string;
    created_at: string;
    updated_at: string;
};

type Props = { review: Review };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviews', href: '/admin/ecommerce/reviews' },
    { title: 'Review Details', href: '#' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ReviewShow({ review }: Props) {
    const [status, setStatus] = useState(review.status);
    const [updating, setUpdating] = useState(false);
    const productName = resolveLocalizedText(review.product.name);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleStatusUpdate = () => {
        if (status === review.status) return;
        setUpdating(true);
        router.put(
            `/admin/ecommerce/reviews/${review.id}`,
            { status },
            { onFinish: () => setUpdating(false) },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review — ${productName}`} />
            <Wrapper>
                <PageHeader
                    title="Review Details"
                    description={`Submitted on ${formatDate(review.created_at)}`}
                >
                    <PageHeaderActions>
                        <Button variant="outline" asChild>
                            <Link href="/admin/ecommerce/reviews" prefetch cacheFor={30}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left column — review content */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Product */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/40 px-6 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    <Package className="h-4 w-4" />
                                    Product
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                                        {review.product.thumbnail ? (
                                            <img
                                                src={review.product.thumbnail}
                                                alt={productName}
                                                className="h-full w-full rounded-md object-cover"
                                            />
                                        ) : (
                                            <Package className="h-7 w-7 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{productName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            /{review.product.slug}
                                        </div>
                                        <Link
                                            href={`/admin/ecommerce/products/${review.product.id}/edit`}
                                            prefetch
                                            cacheFor={30}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Edit Product →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review content */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/40 px-6 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    <MessageSquare className="h-4 w-4" />
                                    Review Content
                                </h2>
                            </div>
                            <div className="space-y-4 px-6 py-6">
                                <div className="flex items-center gap-3">
                                    <StarRating rating={review.rating} />
                                    <span className="text-xl font-bold">
                                        {review.rating}/5
                                    </span>
                                </div>

                                {review.title && (
                                    <h3 className="text-lg font-semibold">{review.title}</h3>
                                )}

                                <p className="whitespace-pre-wrap text-muted-foreground">
                                    {review.body}
                                </p>

                                {review.pros && (
                                    <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/30">
                                        <h4 className="mb-1 text-sm font-medium text-green-800 dark:text-green-400">
                                            Pros
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {review.pros}
                                        </p>
                                    </div>
                                )}

                                {review.cons && (
                                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/30">
                                        <h4 className="mb-1 text-sm font-medium text-red-800 dark:text-red-400">
                                            Cons
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {review.cons}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
                                    <ThumbsUp className="h-4 w-4" />
                                    {review.helpful_count} people found this helpful
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column — sidebar */}
                    <div className="space-y-6">

                        {/* Moderation */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/40 px-6 py-4">
                                <h2 className="text-sm font-semibold">Moderation</h2>
                            </div>
                            <div className="space-y-4 px-6 py-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">
                                        Current status
                                    </label>
                                    <Badge variant={statusVariant[review.status] ?? 'outline'}>
                                        {review.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">
                                        Change status
                                    </label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleStatusUpdate}
                                    disabled={updating || status === review.status}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {updating ? 'Saving…' : 'Save Status'}
                                </Button>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/40 px-6 py-4">
                                <h2 className="text-sm font-semibold">Customer</h2>
                            </div>
                            <div className="px-6 py-4">
                                {review.customer ? (
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {review.customer.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {review.customer.email}
                                        </div>
                                        <Link
                                            href={`/admin/customers/${review.customer.id}/edit`}
                                            prefetch
                                            cacheFor={30}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            View Profile →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Guest review
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="rounded-lg border bg-card">
                            <div className="border-b bg-muted/40 px-6 py-4">
                                <h2 className="text-sm font-semibold">Metadata</h2>
                            </div>
                            <div className="space-y-3 px-6 py-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Review ID</div>
                                    <div className="font-mono font-medium">#{review.id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Submitted</div>
                                    <div className="text-sm">{formatDate(review.created_at)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Last updated</div>
                                    <div className="text-sm">{formatDate(review.updated_at)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
