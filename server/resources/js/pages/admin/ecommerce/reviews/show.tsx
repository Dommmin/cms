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
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';

type Product = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    thumbnail?: string;
};

type User = {
    id: number;
    name: string;
    email: string;
};

type Review = {
    id: number;
    product: Product;
    user?: User;
    rating: number;
    title?: string;
    content: string;
    status: string;
    helpful_count: number;
    pros?: string;
    cons?: string;
    created_at: string;
    updated_at: string;
};

type Props = {
    review: Review;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviews', href: '/admin/ecommerce/reviews' },
    { title: 'Review Details', href: `#` },
];

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
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
                            : 'text-gray-300'
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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusUpdate = () => {
        if (status === review.status) return;

        setUpdating(true);
        router.put(
            `/admin/ecommerce/reviews/${review.id}`,
            { status },
            {
                onFinish: () => setUpdating(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review - ${productName}`} />
            <Wrapper>
                <PageHeader
                    title="Review Details"
                    description={`Submitted on ${formatDate(review.created_at)}`}
                >
                    <PageHeaderActions>
                        <Link
                            href="/admin/ecommerce/reviews"
                            className="rounded border bg-white px-4 py-2 hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Review Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Product Info */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <h2 className="flex items-center gap-2 text-lg font-medium">
                                    <Package className="h-5 w-5" />
                                    Product
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                                        {review.product.thumbnail ? (
                                                <img
                                                    src={review.product.thumbnail}
                                                    alt={productName}
                                                    className="h-full w-full rounded object-cover"
                                                />
                                        ) : (
                                            <Package className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {productName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            /{review.product.slug}
                                        </div>
                                        <Link
                                            href={`/admin/ecommerce/products/${review.product.id}/edit`}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View Product →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Content */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <h2 className="flex items-center gap-2 text-lg font-medium">
                                    <MessageSquare className="h-5 w-5" />
                                    Review Content
                                </h2>
                            </div>
                            <div className="space-y-4 px-6 py-6">
                                <div className="flex items-center gap-4">
                                    <StarRating rating={review.rating} />
                                    <span className="text-2xl font-bold text-gray-900">
                                        {review.rating}/5
                                    </span>
                                </div>

                                {review.title && (
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {review.title}
                                    </h3>
                                )}

                                <div className="prose max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-700">
                                        {review.content}
                                    </p>
                                </div>

                                {review.pros && (
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <h4 className="mb-2 font-medium text-green-800">
                                            Pros
                                        </h4>
                                        <p className="text-green-700">
                                            {review.pros}
                                        </p>
                                    </div>
                                )}

                                {review.cons && (
                                    <div className="rounded-lg bg-red-50 p-4">
                                        <h4 className="mb-2 font-medium text-red-800">
                                            Cons
                                        </h4>
                                        <p className="text-red-700">
                                            {review.cons}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 border-t pt-4">
                                    <ThumbsUp className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-600">
                                        {review.helpful_count} people found this
                                        helpful
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer & Actions */}
                    <div className="space-y-6">
                        {/* Update Status */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-medium">
                                    Moderation
                                </h2>
                            </div>
                            <div className="space-y-4 px-6 py-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Review Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        {statusOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={
                                        updating || status === review.status
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? (
                                        'Updating...'
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Update Status
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-medium">
                                    Customer
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {review.user ? (
                                    <div className="space-y-2">
                                        <div className="font-medium text-gray-900">
                                            {review.user.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {review.user.email}
                                        </div>
                                        <Link
                                            href={`/admin/users/${review.user.id}/edit`}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View Profile →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        Guest review
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Metadata */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-medium">
                                    Metadata
                                </h2>
                            </div>
                            <div className="space-y-3 px-6 py-4">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Review ID
                                    </div>
                                    <div className="font-medium">
                                        #{review.id}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Submitted
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(review.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Last Updated
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(review.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
