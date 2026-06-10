'use client';

import { getStores } from '@/api/stores';
import { StoreMap } from '@/components/store-map';
import { Input } from '@/components/ui/input';
import type { Page, Store } from '@/types/api';
import { Clock, Loader2, Mail, MapPin, Phone, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface StoreLocatorModuleProps {
    page: Page;
}

export function StoreLocatorModule({ page }: StoreLocatorModuleProps) {
    const config = page.module_config ?? {};
    const defaultZoom =
        typeof config.default_zoom === 'number' ? config.default_zoom : 6;
    const initialCity =
        typeof config.initial_city === 'string' ? config.initial_city : '';

    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    useEffect(() => {
        async function fetchStoresData() {
            try {
                const data = await getStores();
                setStores(data);
            } catch (err) {
                console.error('Failed to load stores:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchStoresData();
    }, []);

    const cities = useMemo(() => {
        const uniqueCities = new Set(stores.map((s) => s.city));
        return Array.from(uniqueCities).sort();
    }, [stores]);

    const filteredStores = useMemo(() => {
        return stores.filter((store) => {
            const matchesSearch =
                store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                store.address
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                store.city.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCity = selectedCity
                ? store.city === selectedCity
                : true;

            return matchesSearch && matchesCity;
        });
    }, [stores, searchQuery, selectedCity]);

    // If a store is selected, we focus the map on it by passing it as the only store or first store
    const mapStores = useMemo(() => {
        if (selectedStore) {
            return [selectedStore];
        }
        return filteredStores;
    }, [selectedStore, filteredStores]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-primary h-10 w-10 animate-spin" />
                    <p className="text-muted-foreground mt-4 text-sm font-medium">
                        Loading store locations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {page.title || 'Store Locator'}
                </h1>
                {page.excerpt && (
                    <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
                        {page.excerpt}
                    </p>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                {/* Sidebar controls */}
                <div className="flex flex-col gap-6">
                    <div className="border-border bg-card/60 space-y-4 rounded-2xl border p-5 shadow-sm backdrop-blur-md">
                        <h2 className="text-lg font-semibold">Find Stores</h2>

                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search by name, address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {cities.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Filter by City
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        setSelectedStore(null);
                                    }}
                                    className="border-input bg-background text-foreground focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Stores List */}
                    <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
                        {filteredStores.length === 0 ? (
                            <div className="text-muted-foreground rounded-2xl border border-dashed py-10 text-center text-sm">
                                No stores match your criteria.
                            </div>
                        ) : (
                            filteredStores.map((store) => {
                                const isSelected =
                                    selectedStore?.id === store.id;
                                return (
                                    <div
                                        key={store.id}
                                        onClick={() =>
                                            setSelectedStore(
                                                isSelected ? null : store,
                                            )
                                        }
                                        className={`bg-card cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                                            isSelected
                                                ? 'border-primary ring-primary ring-1'
                                                : 'border-border hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <MapPin
                                                className={`mt-0.5 h-5 w-5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-semibold">
                                                    {store.name}
                                                </h3>
                                                <p className="text-muted-foreground mt-0.5 text-sm">
                                                    {store.address},{' '}
                                                    {store.city}
                                                </p>
                                            </div>
                                        </div>

                                        {(store.phone || store.email) && (
                                            <div className="border-border/50 mt-4 space-y-2 border-t pt-3 pl-8">
                                                {store.phone && (
                                                    <a
                                                        href={`tel:${store.phone}`}
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                                                    >
                                                        <Phone className="text-muted-foreground/70 h-4 w-4" />
                                                        {store.phone}
                                                    </a>
                                                )}
                                                {store.email && (
                                                    <a
                                                        href={`mailto:${store.email}`}
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                                                    >
                                                        <Mail className="text-muted-foreground/70 h-4 w-4" />
                                                        {store.email}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {store.opening_hours && (
                                            <div className="border-border/50 mt-4 border-t pt-3 pl-8">
                                                <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Opening hours
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    {Object.entries(
                                                        store.opening_hours,
                                                    ).map(([day, hours]) => (
                                                        <div
                                                            key={day}
                                                            className="flex justify-between text-xs"
                                                        >
                                                            <span className="text-muted-foreground capitalize">
                                                                {day}
                                                            </span>
                                                            <span className="text-foreground font-medium">
                                                                {hours}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Map Display */}
                <div className="border-border bg-muted/20 sticky top-4 h-[600px] overflow-hidden rounded-3xl border shadow-sm">
                    <StoreMap
                        stores={mapStores}
                        height={600}
                        zoom={selectedStore ? 15 : defaultZoom}
                    />
                </div>
            </div>
        </div>
    );
}
