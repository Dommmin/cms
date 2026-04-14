import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as FlashSaleController from '@/actions/App/Http/Controllers/Admin/Ecommerce/FlashSaleController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FormPageProps } from './form.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Flash Sales', href: FlashSaleController.index.url() },
    { title: 'Create Flash Sale', href: FlashSaleController.create.url() },
];

export default function Create({ products }: FormPageProps) {
    const __ = useTranslation();
    const formId = 'flash-sale-create-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Flash Sale" />

            <Wrapper>
                <PageHeader
                    title="Create Flash Sale"
                    description="Add a new limited-time flash sale"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={FlashSaleController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={FlashSaleController.store.url()}
                    method="post"
                    id={formId}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Sale Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="Weekend Sale"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Product</Label>
                                <select
                                    id="product_id"
                                    name="product_id"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="">
                                        — Select a product —
                                    </option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.product_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sale_price">
                                    Sale Price (PLN, decimal)
                                </Label>
                                <Input
                                    id="sale_price"
                                    name="sale_price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    placeholder="Price in grosze (e.g. 9900 = 99.00 PLN)"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter price in grosze (cents). 9900 = 99.00
                                    PLN.
                                </p>
                                <InputError message={errors.sale_price} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_at">Starts At</Label>
                                    <Input
                                        id="starts_at"
                                        name="starts_at"
                                        type="datetime-local"
                                        required
                                    />
                                    <InputError message={errors.starts_at} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ends_at">Ends At</Label>
                                    <Input
                                        id="ends_at"
                                        name="ends_at"
                                        type="datetime-local"
                                        required
                                    />
                                    <InputError message={errors.ends_at} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock_limit">
                                    Stock Limit (optional)
                                </Label>
                                <Input
                                    id="stock_limit"
                                    name="stock_limit"
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Maximum units available at the sale price.
                                </p>
                                <InputError message={errors.stock_limit} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__(
                                    'action.create',
                                    'Create Flash Sale',
                                )}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
