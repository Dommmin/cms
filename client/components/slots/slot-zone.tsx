import { getPublicSettings } from '@/api/settings';
import { SlotRenderer } from './slot-renderer';

interface SlotZoneProps {
    location: string;
}

export async function SlotZone({ location }: SlotZoneProps) {
    const publicSettings = await getPublicSettings();
    if (!publicSettings) return null;

    const slots = publicSettings.slots?.[location];
    if (!slots || slots.length === 0) return null;

    return <SlotRenderer slots={slots} location={location} />;
}
