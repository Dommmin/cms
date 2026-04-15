import { useEffect, useState } from 'react';

export function useLiveCounter(min: number, max: number) {
    const [count, setCount] = useState(
        () => Math.floor(Math.random() * (max - min + 1)) + min,
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => {
                const delta = Math.floor(Math.random() * 3) - 1;
                return Math.max(min, Math.min(max, prev + delta));
            });
        }, 30000);
        return () => clearInterval(interval);
    }, [min, max]);

    return count;
}
