export interface BannerPromotion {
  id: number;
  name: string;
  banner_text: string;
  banner_color: string | null;
  banner_url: string | null;
  ends_at: string | null;
}

export interface CountdownProps {
  endsAt: string;
}
