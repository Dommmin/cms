import { Link, Head, router } from '@inertiajs/react';
import * as StoreController from '@/actions/App/Http/Controllers/Admin/StoreController';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPicker } from '@/components/ui/map-picker';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stores', href: StoreController.index.url() },
    { title: 'Edit', href: '' },
];

export default function EditStore({ store }: EditProps) {
    const [data, setData] = useState({
        name: store.name,
        slug: store.slug,
        address: store.address,
        city: store.city,
        country: store.country,
        phone: store.phone ?? '',
        email: store.email ?? '',
        opening_hours: store.opening_hours
            ? JSON.stringify(store.opening_hours, null, 2)
            : '',
        lat: parseFloat(store.lat),
        lng: parseFloat(store.lng),
        is_active: store.is_active,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(StoreController.update.url(store.id), data, {
            onSuccess: () => toast.success('Store updated'),
            onError: (errs) => {
                setErrors(errs);
                toast.error('Please fix the errors below');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${store.name}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Store"
                    description="Update store location details"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={StoreController.index.url()} prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) =>
                                setData((p) => ({ ...p, name: e.target.value }))
                            }
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) =>
                                setData((p) => ({ ...p, slug: e.target.value }))
                            }
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) =>
                                setData((p) => ({
                                    ...p,
                                    address: e.target.value,
                                }))
                            }
                            required
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData((p) => ({
                                        ...p,
                                        city: e.target.value,
                                    }))
                                }
                                required
                            />
                            <InputError message={errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                                id="country"
                                value={data.country}
                                onChange={(e) =>
                                    setData((p) => ({
                                        ...p,
                                        country: e.target.value,
                                    }))
                                }
                                maxLength={10}
                                required
                            />
                            <InputError message={errors.country} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData((p) => ({
                                        ...p,
                                        phone: e.target.value,
                                    }))
                                }
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData((p) => ({
                                        ...p,
                                        email: e.target.value,
                                    }))
                                }
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="opening_hours">
                            Opening Hours (JSON or text)
                        </Label>
                        <Textarea
                            id="opening_hours"
                            value={data.opening_hours}
                            onChange={(e) =>
                                setData((p) => ({
                                    ...p,
                                    opening_hours: e.target.value,
                                }))
                            }
                            rows={3}
                        />
                        <InputError message={errors.opening_hours} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Location on Map *</Label>
                        <MapPicker
                            lat={data.lat}
                            lng={data.lng}
                            onChange={(lat, lng) =>
                                setData((p) => ({ ...p, lat, lng }))
                            }
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="lat" className="text-xs">
                                    Latitude
                                </Label>
                                <Input
                                    id="lat"
                                    type="number"
                                    step="any"
                                    value={data.lat}
                                    onChange={(e) =>
                                        setData((p) => ({
                                            ...p,
                                            lat: parseFloat(e.target.value),
                                        }))
                                    }
                                />
                                <InputError message={errors.lat} />
                            </div>
                            <div>
                                <Label htmlFor="lng" className="text-xs">
                                    Longitude
                                </Label>
                                <Input
                                    id="lng"
                                    type="number"
                                    step="any"
                                    value={data.lng}
                                    onChange={(e) =>
                                        setData((p) => ({
                                            ...p,
                                            lng: parseFloat(e.target.value),
                                        }))
                                    }
                                />
                                <InputError message={errors.lng} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData((p) => ({
                                    ...p,
                                    is_active: e.target.checked,
                                }))
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Active (visible on site)
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
