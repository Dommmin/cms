import { router } from '@inertiajs/react';
import { FileDown, FileUp } from 'lucide-react';
import { useRef } from 'react';
import {
    exportMethod as pbExport,
    importMethod as pbImport,
} from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { ImportExportGroupProps } from '../builder-toolbar.types';

export function ImportExportGroup({ pageId }: ImportExportGroupProps) {
    const __ = useTranslation();
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        router.post(pbImport.url(pageId), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
        e.target.value = '';
    };

    return (
        <>
            <a
                href={pbExport.url(pageId)}
                download
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent"
                title={__('builder.export_hint', 'Export page as JSON')}
            >
                <FileDown className="h-3.5 w-3.5" />
                {__('builder.export', 'Export')}
            </a>
            <input
                ref={importInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => importInputRef.current?.click()}
                title={__('builder.import_hint', 'Import page from JSON')}
            >
                <FileUp className="mr-1.5 h-3.5 w-3.5" />
                {__('builder.import', 'Import')}
            </Button>
        </>
    );
}
