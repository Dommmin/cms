import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const locale = (await headers()).get('x-locale') ?? 'en';
  const prefix = locale === 'en' ? '' : `/${locale}`;
  redirect(`${prefix}/account/orders`);
}
