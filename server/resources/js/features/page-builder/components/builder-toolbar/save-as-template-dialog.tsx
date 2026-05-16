import { BookmarkPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { SaveAsTemplateDialogProps } from '../builder-toolbar.types';

export function SaveAsTemplateDialog({
    open,
    onClose,
    onSave,
}: SaveAsTemplateDialogProps) {
    const __ = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('custom');
    const [isGlobal, setIsGlobal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        onSave(name, description, category, isGlobal);
        setName('');
        setDescription('');
        setCategory('custom');
        setIsGlobal(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookmarkPlus className="h-5 w-5" />
                        {__('builder.save_as_template', 'Save as Template')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-name">
                            {__('builder.name', 'Name')}
                        </Label>
                        <Input
                            id="tpl-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={__(
                                'builder.template_name_placeholder',
                                'My Template',
                            )}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-description">
                            {__('builder.description', 'Description')}{' '}
                            <span className="text-muted-foreground">
                                ({__('builder.optional', 'optional')})
                            </span>
                        </Label>
                        <Textarea
                            id="tpl-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={__(
                                'builder.template_description_placeholder',
                                'Describe what this template is for…',
                            )}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-category">
                            {__('builder.category', 'Category')}
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="tpl-category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">
                                    {__('builder.category_custom', 'Custom')}
                                </SelectItem>
                                <SelectItem value="landing">
                                    {__('builder.category_landing', 'Landing')}
                                </SelectItem>
                                <SelectItem value="product">
                                    {__('builder.category_product', 'Product')}
                                </SelectItem>
                                <SelectItem value="blog">
                                    {__('builder.category_blog', 'Blog')}
                                </SelectItem>
                                <SelectItem value="portfolio">
                                    {__(
                                        'builder.category_portfolio',
                                        'Portfolio',
                                    )}
                                </SelectItem>
                                <SelectItem value="other">
                                    {__('builder.category_other', 'Other')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="tpl-global"
                            checked={isGlobal}
                            onCheckedChange={(checked) =>
                                setIsGlobal(checked === true)
                            }
                        />
                        <Label
                            htmlFor="tpl-global"
                            className="cursor-pointer text-sm font-normal"
                        >
                            {__(
                                'builder.make_visible_to_all_admins',
                                'Make visible to all admins',
                            )}
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {__('builder.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            {__('builder.save_template', 'Save Template')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
