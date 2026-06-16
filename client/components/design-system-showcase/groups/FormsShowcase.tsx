import { Button } from '@/components/ui/button';
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

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

export function FormsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Forms"
                description="Form controls from components/ui — input, textarea, select, checkbox, radio, and submit."
            />
            <form
                className="max-w-lg space-y-6"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="space-y-2">
                    <Label htmlFor="ds-input">Input</Label>
                    <Input
                        id="ds-input"
                        placeholder="you@example.com"
                        type="email"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ds-textarea">Textarea</Label>
                    <Textarea
                        id="ds-textarea"
                        placeholder="Your message…"
                        rows={4}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ds-select">Select</Label>
                    <Select>
                        <SelectTrigger id="ds-select" className="w-full">
                            <SelectValue placeholder="Choose an option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a">Option A</SelectItem>
                            <SelectItem value="b">Option B</SelectItem>
                            <SelectItem value="c">Option C</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        className="border-input h-4 w-4 rounded"
                    />
                    Checkbox — agree to terms
                </label>
                <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Radio</legend>
                    {['Standard', 'Express'].map((option) => (
                        <label
                            key={option}
                            className="flex items-center gap-2 text-sm"
                        >
                            <input
                                type="radio"
                                name="ds-shipping"
                                value={option}
                                className="border-input h-4 w-4"
                            />
                            {option}
                        </label>
                    ))}
                </fieldset>
                <Button type="submit">Submit button</Button>
            </form>
        </div>
    );
}
