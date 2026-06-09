export interface ShippingMethod {
    id: number;
    name: string;
    base_price: number;
    is_active: boolean;
    carrier?: string;
    free_shipping_threshold?: number | null;
}

export interface TaxRate {
    id?: number;
    name: string;
    rate: number;
    country_code: string;
    is_active: boolean;
    is_default: boolean;
}

export interface MenuItem {
    id?: number;
    label: Record<string, string>;
    url?: string;
    target?: string;
    icon?: string | null;
    position: number;
    parent_id?: number | null;
    children?: MenuItem[];
}

export interface MenuData {
    id: number;
    name: string;
    items: MenuItem[];
}

export interface LegalPage {
    id: number;
    title: Record<string, string> | string;
    content: string | null;
}

export interface WizardState {
    completed_steps: string[];
    current_step: string;
    is_completed: boolean;
}

export interface OnboardingProps {
    // Dynamic configuration store values of varying types (string, number, boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: Record<string, any>;
    shippingMethods: ShippingMethod[];
    taxRates: TaxRate[];
    homepageHero: {
        title: string;
        subtitle?: string;
        cta_text?: string;
        cta_url?: string;
    } | null;
    menu: MenuData | null;
    legalPages: {
        privacy_policy: LegalPage | null;
        terms_of_service: LegalPage | null;
    };
    wizard: WizardState;
}
