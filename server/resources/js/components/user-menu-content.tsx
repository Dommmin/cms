import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Shield } from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { edit as profileEdit } from '@/routes/profile';
import { show as twoFactorShow } from '@/routes/two-factor';
import type { UserMenuContentProps } from './user-menu-content.types';

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={profileEdit.url()} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={twoFactorShow.url()} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Two-factor auth
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href="#"
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Logout
                </Link>
            </DropdownMenuItem>
        </>
    );
}
