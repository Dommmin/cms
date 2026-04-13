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

export default function Edit({ flashSale, products }: Required<FormPageProps>) {
    const __ = useTranslation();
    const formId = 'flash-sale-edit-form';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Flash Sales', href: FlashSaleController.index.url() },
        { title: 'Edit Flash Sale', href: FlashSaleController.edit.url(flashSale.id!) },
    ];

    // Convert ISO datetime to datetime-local format
    const toDatetimeLocal = (iso: string) => iso.slice(0, 16);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Flash Sale: ${flashSale.name}`} />

            <Wrapper>
                <PageHeader
                    title="Edit Flash Sale"
                    description={`Update details for "${flashSale.name}"`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={FlashSaleController.index.url()} prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action={FlashSaleController.update.url(flashSale.id!)}
                    method="put"
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
                                    defaultValue={flashSale.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Product</Label>
                                <select
                                    id="product_id"
                                    name="product_id"
                                    required
                                    defaultValue={flashSale.product_id}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <option value="">— Select a product —</option>
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
                                    Sale Price (grosze)
                                </Label>
                                <Input
                                    id="sale_price"
                                    name="sale_price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    defaultValue={flashSale.sale_price}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter price in grosze (cents). 9900 = 99.00 PLN.
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
                                        defaultValue={toDatetimeLocal(flashSale.starts_at)}
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
                                        defaultValue={toDatetimeLocal(flashSale.ends_at)}
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
                                    defaultValue={flashSale.stock_limit ?? undefined}
                                />
                                <InputError message={errors.stock_limit} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={flashSale.is_active}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="is_active" className="font-normal">
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel={__('action.save_changes', 'Save Changes')}
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
