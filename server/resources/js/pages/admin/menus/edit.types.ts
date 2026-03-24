export type MenuItemData = {
    id?: number;
    label: Record<string, string>;
    url: string;
    target: string;
    icon: string;
    children: MenuItemData[];
};
export type Menu = {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    items: MenuItemData[];
};
export type EditProps = {
    menu: Menu;
    locations: { value: string; label: string }[];
};
