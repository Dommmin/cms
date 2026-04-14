import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircleIcon, CheckCircle2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ImportValidationResult } from './import-dialog.types';

type Step = 'pick' | 'result';

export default function ImportDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<Step>('pick');
    const [file, setFile] = useState<File | null>(null);
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportValidationResult | null>(null);
    const [networkError, setNetworkError] = useState<string | null>(null);

    function handleOpenChange(isOpen: boolean): void {
        if (!isOpen) {
            handleClose();
        }
    }

    function handleClose(): void {
        setStep('pick');
        setFile(null);
        setResult(null);
        setNetworkError(null);
        setValidating(false);
        setImporting(false);
        onClose();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setResult(null);
        setNetworkError(null);
    }

    async function handleValidate(): Promise<void> {
        if (!file) {
            return;
        }

        setValidating(true);
        setNetworkError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await axios.post<ImportValidationResult>(
                ProductController.validateImport.url(),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            setResult(data);
            setStep('result');
        } catch (err: unknown) {
            if (axios.isAxiosError<{ message?: string }>(err)) {
                const msg =
                    err.response?.data?.message ??
                    'Validation failed. Please check the file and try again.';
                setNetworkError(msg);
            } else {
                setNetworkError('An unexpected error occurred.');
            }
        } finally {
            setValidating(false);
        }
    }

    function handleImport(): void {
        if (!file) {
            return;
        }

        setImporting(true);

        const formData = new FormData();
        formData.append('file', file);

        router.post(
            ProductController.importMethod.url(),
            formData as unknown as Record<string, unknown>,
            {
                forceFormData: true,
                onSuccess: () => {
                    handleClose();
                },
                onFinish: () => {
                    setImporting(false);
                },
            },
        );
    }

    const previewColumns =
        result && result.preview.length > 0
            ? Object.keys(result.preview[0])
            : [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Import Products</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to import products. Required
                        columns: <strong>name</strong>, <strong>sku</strong>,{' '}
                        <strong>price</strong>.
                    </DialogDescription>
                </DialogHeader>

                {step === 'pick' && (
                    <div className="space-y-4">
                        <div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {file && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Selected: {file.name} (
                                    {(file.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>

                        {networkError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertDescription>
                                    {networkError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={validating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleValidate}
                                disabled={!file || validating}
                            >
                                {validating ? (
                                    <>
                                        <span className="mr-2 animate-spin">
                                            ⟳
                                        </span>
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        Validate File
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'result' && result && (
                    <div className="space-y-4">
                        {result.missing_headers.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertDescription>
                                    Missing required columns:{' '}
                                    <strong>
                                        {result.missing_headers.join(', ')}
                                    </strong>
                                </AlertDescription>
                            </Alert>
                        )}

                        {result.missing_headers.length === 0 &&
                            result.errors.length > 0 && (
                                <div className="space-y-2">
                                    <Alert variant="destructive">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        <AlertDescription>
                                            Found {result.errors.length}{' '}
                                            validation error(s) in the file.
                                            Please fix them before importing.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="max-h-48 overflow-auto rounded border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Row</TableHead>
                                                    <TableHead>Field</TableHead>
                                                    <TableHead>Error</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {result.errors.map((err, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-mono">
                                                            {err.row}
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {err.field}
                                                        </TableCell>
                                                        <TableCell className="text-destructive">
                                                            {err.message}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                        {result.valid && result.preview.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle2Icon className="h-4 w-4" />
                                    <span>
                                        File is valid. Previewing first{' '}
                                        {result.preview.length} of{' '}
                                        {result.total_rows} row(s).
                                    </span>
                                </div>

                                <div className="max-h-64 overflow-auto rounded border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {previewColumns.map((col) => (
                                                    <TableHead
                                                        key={col}
                                                        className="font-mono text-xs whitespace-nowrap"
                                                    >
                                                        {col}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.preview.map((row, i) => (
                                                <TableRow key={i}>
                                                    {previewColumns.map(
                                                        (col) => (
                                                            <TableCell
                                                                key={col}
                                                                className="text-xs whitespace-nowrap"
                                                            >
                                                                {String(
                                                                    row[col] ??
                                                                        '',
                                                                )}
                                                            </TableCell>
                                                        ),
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep('pick');
                                    setResult(null);
                                }}
                                disabled={importing}
                            >
                                Back
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={importing}
                            >
                                Cancel
                            </Button>
                            {result.valid && (
                                <Button
                                    onClick={handleImport}
                                    disabled={importing}
                                >
                                    {importing ? (
                                        <>
                                            <span className="mr-2 animate-spin">
                                                ⟳
                                            </span>
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="mr-2 h-4 w-4" />
                                            Import Now
                                        </>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
