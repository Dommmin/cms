import { Link, Head, router } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stores', href: '/admin/stores' },
    { title: 'Create', href: '/admin/stores/create' },
];

type FormData = {
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    opening_hours: string;
    lat: number | null;
    lng: number | null;
    is_active: boolean;
};

export default function CreateStore() {
    const [data, setData] = useState<FormData>({
        name: '',
        slug: '',
        address: '',
        city: '',
        country: 'PL',
        phone: '',
        email: '',
        opening_hours: '',
        lat: null,
        lng: null,
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/admin/stores', data, {
            onSuccess: () => toast.success('Store created'),
            onError: (errs) => {
                setErrors(errs);
                toast.error('Please fix the errors below');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Store" />
            <Wrapper>
                <PageHeader
                    title="Create Store"
                    description="Add a new store location"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/stores" prefetch cacheFor={30}>
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
                            placeholder="e.g. Warsaw Main Store"
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
                            placeholder="auto-generated if empty"
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
                            placeholder="ul. Marszałkowska 1"
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
                                placeholder="Warszawa"
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
                                placeholder="PL"
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
                                placeholder="+48 22 123 45 67"
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
                                placeholder="store@example.com"
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
                            placeholder='{"Mon-Fri": "9:00-18:00", "Sat": "10:00-14:00"}'
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
                                    value={data.lat ?? ''}
                                    onChange={(e) =>
                                        setData((p) => ({
                                            ...p,
                                            lat: e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                        }))
                                    }
                                    placeholder="52.2297"
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
                                    value={data.lng ?? ''}
                                    onChange={(e) =>
                                        setData((p) => ({
                                            ...p,
                                            lng: e.target.value
                                                ? parseFloat(e.target.value)
                                                : null,
                                        }))
                                    }
                                    placeholder="21.0122"
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
                            {processing ? 'Creating...' : 'Create Store'}
                        </Button>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
