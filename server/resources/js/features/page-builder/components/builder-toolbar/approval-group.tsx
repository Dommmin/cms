import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { ApprovalGroupProps } from '../builder-toolbar.types';

export function ApprovalGroup({
    approvalStatus,
    onSubmitForReview,
    onApprove,
    onReject,
}: ApprovalGroupProps) {
    const __ = useTranslation();
    const [rejectNoteOpen, setRejectNoteOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState('');

    const handleRejectSubmit = () => {
        onReject(rejectNote);
        setRejectNote('');
        setRejectNoteOpen(false);
    };

    return (
        <>
            <div className="h-4 w-px bg-border" />
            {approvalStatus === 'draft' && (
                <Button variant="outline" size="sm" onClick={onSubmitForReview}>
                    {__('builder.submit_for_review', 'Submit for Review')}
                </Button>
            )}
            {approvalStatus === 'in_review' && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400"
                        onClick={onApprove}
                    >
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        {__('builder.approve', 'Approve')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectNoteOpen(true)}
                    >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        {__('builder.reject', 'Reject')}
                    </Button>
                </>
            )}
            {approvalStatus === 'approved' && (
                <span className="flex items-center gap-1.5 rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-700 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    {__('builder.approved', 'Approved')}
                </span>
            )}

            <Dialog
                open={rejectNoteOpen}
                onOpenChange={(o) => !o && setRejectNoteOpen(false)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {__('builder.reject_page', 'Reject Page')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">
                            {__(
                                'builder.reject_note_hint',
                                'Optionally leave a note for the author explaining what needs to be changed.',
                            )}
                        </p>
                        <Textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder={__(
                                'builder.reject_note_placeholder',
                                'Describe what needs to be changed...',
                            )}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectNoteOpen(false)}
                        >
                            {__('builder.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                        >
                            {__('builder.reject', 'Reject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
