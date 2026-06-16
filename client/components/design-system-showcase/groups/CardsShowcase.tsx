import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

export function CardsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Cards"
                description="Card primitive patterns — basic, media, pricing, and content layouts."
            />
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic card</CardTitle>
                        <CardDescription>
                            Default card with header, body, and footer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed">
                            Uses{' '}
                            <code className="bg-muted rounded px-1">
                                --card
                            </code>{' '}
                            and{' '}
                            <code className="bg-muted rounded px-1">
                                --card-foreground
                            </code>
                            .
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button type="button" size="sm">
                            Action
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="overflow-hidden pt-0">
                    <div className="bg-muted flex aspect-video items-center justify-center text-sm font-medium">
                        Media placeholder
                    </div>
                    <CardHeader>
                        <CardTitle>Media card</CardTitle>
                        <CardDescription>
                            Image or video on top of card content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Common pattern for blog posts and product tiles.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>For growing catalogs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-3xl font-bold">
                            €49
                            <span className="text-muted-foreground text-base font-normal">
                                /mo
                            </span>
                        </p>
                        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                            <li>Unlimited products</li>
                            <li>Priority support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button type="button" className="w-full">
                            Choose plan
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content card</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm leading-relaxed">
                            Longer editorial content sits comfortably inside a
                            card with generous padding and readable line height.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Secondary paragraph with muted foreground for
                            hierarchy.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
