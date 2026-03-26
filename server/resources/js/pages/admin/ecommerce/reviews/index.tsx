import { Head } from '@inertiajs/react';
import { useReviewColumns } from '@/components/columns/review-columns';

import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviews', href: '/admin/ecommerce/reviews' },
];

export default function ReviewsIndex({ reviews, filters }: IndexProps) {
    const __ = useTranslation();
    const reviewColumns = useReviewColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviews" />
            <Wrapper>
                <PageHeader
                    title="Product Reviews"
                    description={`${reviews.total} reviews total`}
                />

                <DataTable
                    columns={reviewColumns}
                    data={reviews.data}
                    pagination={{
                        current_page: reviews.current_page,
                        last_page: reviews.last_page,
                        per_page: reviews.per_page,
                        total: reviews.total,
                        prev_page_url: reviews.prev_page_url,
                        next_page_url: reviews.next_page_url,
                    }}
                    searchable
                    searchPlaceholder="Search reviews..."
                    searchValue={filters?.search ?? ''}
                    baseUrl="/admin/ecommerce/reviews"
                />
            </Wrapper>
        </AppLayout>
    );
}
