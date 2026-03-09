import { Head, Link } from '@inertiajs/react';
import {
    Star,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';

type Product = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
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
    created_at: string;
};

type Props = {
    reviews: {
        data: Review[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviews', href: '/admin/ecommerce/reviews' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ReviewsIndex({ reviews }: Props) {
    const [search, setSearch] = useState('');

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviews" />
            <Wrapper>
                <PageHeader
                    title="Product Reviews"
                    description={`${reviews.total} reviews`}
                />

                <div className="mt-4 mb-4 flex items-center gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded border px-3 py-2 pl-10"
                        />
                    </div>
                </div>

                {reviews.data.length === 0 ? (
                    <div className="rounded-lg border bg-white py-12 text-center">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No reviews yet
                        </h3>
                        <p className="text-gray-500">
                            Reviews will appear here when customers leave
                            feedback
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-lg border bg-white">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Review
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {reviews.data.map((review) => (
                                        <tr
                                            key={review.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {resolveLocalizedText(review.product.name)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    /{review.product.slug}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {review.user ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {review.user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {review.user.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Guest
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StarRating
                                                    rating={review.rating}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    {review.title && (
                                                        <div className="truncate font-medium text-gray-900">
                                                            {review.title}
                                                        </div>
                                                    )}
                                                    <div className="line-clamp-2 text-sm text-gray-600">
                                                        {review.content}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[review.status] || 'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(review.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/ecommerce/reviews/${review.id}`}
                                                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {reviews.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing{' '}
                                    {(reviews.current_page - 1) *
                                        reviews.per_page +
                                        1}{' '}
                                    to{' '}
                                    {Math.min(
                                        reviews.current_page * reviews.per_page,
                                        reviews.total,
                                    )}{' '}
                                    of {reviews.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={reviews.prev_page_url ?? '#'}
                                        className={`rounded border p-2 ${!reviews.prev_page_url ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                                        preserveScroll
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                    <span className="text-sm text-gray-600">
                                        Page {reviews.current_page} of{' '}
                                        {reviews.last_page}
                                    </span>
                                    <Link
                                        href={reviews.next_page_url ?? '#'}
                                        className={`rounded border p-2 ${!reviews.next_page_url ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                                        preserveScroll
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Wrapper>
        </AppLayout>
    );
}
