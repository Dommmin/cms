'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    blockName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isResetting: boolean;
}

export class BlockErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        isResetting: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, isResetting: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Page Builder Block Crash:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ isResetting: true });
        // Simulate a small delay for premium feels and let the micro-animation play out
        setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                isResetting: false,
            });
        }, 600);
    };

    public render() {
        if (this.state.hasError) {
            const blockLabel = this.props.blockName
                ? this.props.blockName.replace(/[-_]/g, ' ').toUpperCase()
                : 'BLOCK';

            return (
                <div className="border-destructive/20 bg-destructive/5 my-6 w-full rounded-[var(--store-card-radius,1rem)] border p-6 shadow-[var(--store-shadow-soft)] backdrop-blur-md transition-all duration-300">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-4">
                            <div className="bg-destructive/10 text-destructive flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="space-y-1 text-center sm:text-left">
                                <h4 className="text-destructive text-sm font-semibold tracking-wider uppercase">
                                    {blockLabel} RENDER ERROR
                                </h4>
                                <p className="text-muted-foreground text-xs">
                                    This block failed to load, but the rest of
                                    the page remains fully operational.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={this.handleReset}
                            disabled={this.state.isResetting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--store-control-radius,0.5rem)] px-4 py-2 text-xs font-semibold shadow-sm transition-all focus:ring-2 focus:outline-none disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${this.state.isResetting ? 'animate-spin' : ''}`}
                            />
                            Try Reloading
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
