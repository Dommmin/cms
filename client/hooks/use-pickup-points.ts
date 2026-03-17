import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { PickupPoint } from "@/types/api";

interface PickupPointsResponse {
  data: PickupPoint[];
  configured: boolean;
  missing_env: string[];
}

export function usePickupPoints(carrier: string, postalCode: string) {
  const cleanPostal = postalCode.replace(/\s/g, "");

  const query = useQuery<PickupPointsResponse>({
    queryKey: ["pickup-points", carrier, cleanPostal],
    queryFn: async () => {
      const { data } = await api.get<PickupPointsResponse>(
        "/checkout/pickup-points",
        { params: { carrier, postal_code: cleanPostal } },
      );
      // Normalise: older responses may not include configured field
      return {
        data: data.data ?? [],
        configured: data.configured ?? true,
        missing_env: data.missing_env ?? [],
      };
    },
    enabled: !!carrier && cleanPostal.length >= 5,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  return {
    data: query.data?.data ?? [],
    configured: query.data?.configured ?? true,
    missingEnv: query.data?.missing_env ?? [],
    isLoading: query.isLoading,
  };
}
