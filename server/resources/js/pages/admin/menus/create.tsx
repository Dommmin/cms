import { Link, Form, Head } from '@inertiajs/react';
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
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    locations: { value: string; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menus', href: '/admin/menus' },
    { title: 'Create', href: '/admin/menus/create' },
];

export default function Create({ locations }: Props) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.create_menu', 'Create Menu')} />
            <Wrapper>
                <PageHeader
                    title={__('page.create_menu', 'Create Menu')}
                    description={__(
                        'page.create_menu_desc',
                        'Add a new navigation menu',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/menus" prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    action="/admin/menus"
                    method="post"
                    className="max-w-2xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {__('label.name', 'Name')} *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="e.g., Main Navigation"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">
                                    {__('label.location', 'Location')}
                                </Label>
                                <Select name="location">
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={__(
                                                'placeholder.select_location',
                                                'Select location',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            {__(
                                                'misc.no_location',
                                                'No location',
                                            )}
                                        </SelectItem>
                                        {locations.map((loc) => (
                                            <SelectItem
                                                key={loc.value}
                                                value={loc.value}
                                            >
                                                {loc.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.location} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.active', 'Active')}
                                </Label>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? __('misc.creating', 'Creating...')
                                        : __(
                                              'action.create_menu',
                                              'Create Menu',
                                          )}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
