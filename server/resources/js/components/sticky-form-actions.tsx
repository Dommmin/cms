import { Button } from '@/components/ui/button';

type StickyFormActionsProps = {
    formId: string;
    processing: boolean;
    submitLabel: string;
    processingLabel?: string;
};

export default function StickyFormActions({
    formId,
    processing,
    submitLabel,
    processingLabel = 'Saving...',
}: StickyFormActionsProps) {
    return (
        <>
            <div className="h-20 md:h-0" />
            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:sticky md:inset-auto md:bottom-4 md:ml-auto md:w-fit md:rounded-lg md:border md:px-3 md:py-2 md:shadow-lg">
                <div className="flex justify-end">
                    <Button type="submit" form={formId} disabled={processing}>
                        {processing ? processingLabel : submitLabel}
                    </Button>
                </div>
            </div>
        </>
    );
}
