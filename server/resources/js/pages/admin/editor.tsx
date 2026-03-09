import { Head } from '@inertiajs/react';
import { FileText, Save } from 'lucide-react';
import { type JSX } from 'react';
import { useState } from 'react';
import Editor from '@/components/editor/editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Editor', href: '/admin/editor' },
];

export default function EditorPage(): JSX.Element {
    const [content, setContent] = useState<string>('');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In a real app, you'd send content to the server
        console.log('Saving editor content:', content);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rich Text Editor" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">Rich Text Editor</h1>
                            <p className="text-sm text-muted-foreground">
                                Full-featured Lexical editor with playground.lexical.dev features
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Lexical v0.40
                        </Badge>
                        <Button onClick={handleSave} disabled={saved} size="sm">
                            <Save className="mr-1.5 h-4 w-4" />
                            {saved ? 'Saved!' : 'Save'}
                        </Button>
                    </div>
                </div>

                {/* Editor */}
                <Card>
                    <CardContent className="p-0">
                        <Editor
                            value={content || undefined}
                            onChange={setContent}
                            placeholder="Start writing… (type / for commands)"
                            showTreeView={false}
                        />
                    </CardContent>
                </Card>

                {/* Features Overview */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Editor Features</CardTitle>
                        <CardDescription>Available features in this editor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                'Rich Text', 'Headings H1–H5', 'Bold/Italic/Underline',
                                'Strikethrough', 'Subscript/Superscript', 'Inline Code',
                                'Code Blocks', 'Syntax Highlight', 'Bullet Lists',
                                'Numbered Lists', 'Check Lists', 'Block Quote',
                                'Tables', 'Images', 'YouTube Embeds',
                                'Twitter/X Embeds', 'Figma Embeds', 'Horizontal Rule',
                                'Page Break', 'Multi-column Layout', 'Collapsible Sections',
                                'Auto-link', 'Link Editor', 'Font Family',
                                'Font Size', 'Text Color', 'Highlight Color',
                                'Text Alignment', 'Indent/Outdent', 'Undo/Redo',
                                'Markdown Shortcuts', 'Slash Commands', 'Drag & Drop Blocks',
                                'Floating Format Toolbar', 'Export JSON', 'Export HTML',
                                'Hashtags', 'Keyboard Shortcuts',
                            ].map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
