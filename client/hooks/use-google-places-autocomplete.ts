import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGooglePlacesAutocompleteProps {
    countryCode: string;
    debounce?: number;
}

export interface GooglePlacesSuggestion {
    place_id: string;
    description: string;
    placePrediction: google.maps.places.PlacePrediction;
}

interface GooglePlacesAPI {
    AutocompleteSessionToken: typeof google.maps.places.AutocompleteSessionToken;
    AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
}

interface GoogleWithPlaces {
    maps?: {
        places?: GooglePlacesAPI;
    };
}

export function useGooglePlacesAutocomplete({
    countryCode,
    debounce = 300,
}: UseGooglePlacesAutocompleteProps) {
    const [ready, setReady] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const win = window as unknown as { google?: GoogleWithPlaces };
        return !!win.google?.maps?.places?.AutocompleteSuggestion;
    });
    const [value, setValueState] = useState('');
    const [suggestions, setSuggestions] = useState<{
        status: string;
        data: GooglePlacesSuggestion[];
    }>({ status: '', data: [] });

    const sessionTokenRef =
        useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize session token when typing starts
    const getOrCreateSessionToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        const win = window as unknown as { google?: GoogleWithPlaces };
        if (
            win.google?.maps?.places?.AutocompleteSessionToken &&
            !sessionTokenRef.current
        ) {
            sessionTokenRef.current =
                new win.google.maps.places.AutocompleteSessionToken();
        }
        return sessionTokenRef.current;
    }, []);

    // Clear suggestions
    const clearSuggestions = useCallback(() => {
        setSuggestions({ status: '', data: [] });
    }, []);

    // Poll until ready if not ready on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (ready) return;

        const win = window as unknown as { google?: GoogleWithPlaces };

        const checkAndSetReady = () => {
            if (win.google?.maps?.places?.AutocompleteSuggestion) {
                setReady(true);
                return true;
            }
            return false;
        };

        if (checkAndSetReady()) return;

        const interval = setInterval(() => {
            if (checkAndSetReady()) {
                clearInterval(interval);
            }
        }, 500);

        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 30000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [ready]);

    // Function to fetch suggestions
    const fetchSuggestions = useCallback(
        async (query: string) => {
            if (typeof window === 'undefined') return;
            const win = window as unknown as { google?: GoogleWithPlaces };
            if (
                !win.google?.maps?.places?.AutocompleteSuggestion ||
                !query.trim()
            ) {
                clearSuggestions();
                return;
            }

            try {
                const token = getOrCreateSessionToken();
                const request: google.maps.places.AutocompleteRequest = {
                    input: query,
                    includedRegionCodes: [countryCode.toLowerCase()],
                };

                if (token) {
                    request.sessionToken = token;
                }

                const { suggestions: responseSuggestions } =
                    await win.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                        request,
                    );

                if (responseSuggestions && responseSuggestions.length > 0) {
                    const mapped: GooglePlacesSuggestion[] = responseSuggestions
                        .filter(
                            (
                                s,
                            ): s is google.maps.places.AutocompleteSuggestion & {
                                placePrediction: google.maps.places.PlacePrediction;
                            } =>
                                s.placePrediction !== null &&
                                s.placePrediction !== undefined,
                        )
                        .map((s) => ({
                            place_id: s.placePrediction.placeId,
                            description: s.placePrediction.text.text,
                            placePrediction: s.placePrediction,
                        }));
                    setSuggestions({ status: 'OK', data: mapped });
                } else {
                    setSuggestions({ status: 'ZERO_RESULTS', data: [] });
                }
            } catch (error) {
                console.error(
                    'Error fetching autocomplete suggestions:',
                    error,
                );
                setSuggestions({ status: 'ERROR', data: [] });
            }
        },
        [countryCode, clearSuggestions, getOrCreateSessionToken],
    );

    // setValue function matching use-places-autocomplete signature
    const setValue = useCallback(
        (val: string, shouldFetch = true) => {
            setValueState(val);

            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            if (!shouldFetch) {
                clearSuggestions();
                return;
            }

            if (!val.trim()) {
                clearSuggestions();
                return;
            }

            debounceTimeoutRef.current = setTimeout(() => {
                fetchSuggestions(val);
            }, debounce);
        },
        [debounce, fetchSuggestions, clearSuggestions],
    );

    // Reset session token after a successful selection / detail fetch
    const resetSessionToken = useCallback(() => {
        sessionTokenRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return {
        ready,
        value,
        suggestions,
        setValue,
        clearSuggestions,
        resetSessionToken,
    };
}
