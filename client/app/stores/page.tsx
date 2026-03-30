import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 86400;

import { getStores } from '@/api/stores';
import { JsonLd } from '@/components/json-ld';
import { StoreMap } from '@/components/store-map';
import { buildBreadcrumbList, buildLocalBusiness } from '@/lib/schema';
import { generateAlternates, generateCanonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Store Locations',
  description: 'Find our stores near you.',
  alternates: generateAlternates('/stores'),
};

export default async function StoresPage() {
  let stores;
  try {
    stores = await getStores();
  } catch {
    return (
      <div className="text-muted-foreground py-24 text-center">Could not load store locations.</div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h1 className="text-3xl font-bold">Our Stores</h1>
        <p className="text-muted-foreground mt-2">No stores available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {stores.map((store) => (
        <JsonLd key={store.id} data={buildLocalBusiness(store)} />
      ))}
      <JsonLd
        data={buildBreadcrumbList([{ name: 'Store Locations', url: generateCanonical('/stores') }])}
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Our Stores</h1>
        <p className="text-muted-foreground mt-2">Find a store near you</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Store list */}
        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.id} className="border-border bg-card rounded-xl border p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{store.name}</h2>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {store.address}, {store.city}
                  </p>
                </div>
              </div>

              {(store.phone || store.email) && (
                <div className="mt-3 space-y-1 pl-8">
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {store.phone}
                    </a>
                  )}
                  {store.email && (
                    <a
                      href={`mailto:${store.email}`}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {store.email}
                    </a>
                  )}
                </div>
              )}

              {store.opening_hours && (
                <div className="mt-3 pl-8">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Opening hours
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(store.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{day}</span>
                        <span className="font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="border-border sticky top-4 h-fit overflow-hidden rounded-xl border">
          <StoreMap stores={stores} height={600} zoom={6} />
        </div>
      </div>
    </div>
  );
}
