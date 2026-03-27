import { Head } from '@inertiajs/react';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import AccordionBlock from '@/components/blocks/accordion';
import { PageHeader } from '@/components/page-header';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'CMS', href: ReusableBlockController.index.url() },
    { title: 'Blocks', href: ReusableBlockController.index.url() },
    { title: 'Accordion Demo', href: '' },
];

export default function AccordionDemo() {
    const items = [
        { title: 'Question 1', content: '<p>Answer to question 1</p>' },
        { title: 'Question 2', content: '<p>Answer to question 2</p>' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accordion Demo" />
            <Wrapper>
                <PageHeader
                    title="Accordion Block"
                    description="Demo usage of accordion block"
                />
                <AccordionBlock heading="FAQ" items={items} />
            </Wrapper>
        </AppLayout>
    );
}
