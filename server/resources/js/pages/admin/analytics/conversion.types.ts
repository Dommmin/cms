export interface FunnelStage {
    name: string;
    count: number;
    rate: number;
}

export interface LandingPageStat {
    url: string;
    sessions: number;
    conversions: number;
    revenue: number;
}

export interface PromoStat {
    code: string;
    purchases: number;
    revenue: number;
}

export interface ConversionData {
    stages: FunnelStage[];
    cart_to_checkout_rate: number;
    checkout_to_purchase_rate: number;
    overall_conversion_rate: number;
    landing_pages: LandingPageStat[];
    promotions: PromoStat[];
}

export interface ConversionProps {
    data: ConversionData;
    filters: {
        from: string;
        to: string;
    };
}
