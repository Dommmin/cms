<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductTypeAttribute;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ElectronicsSeeder extends Seeder
{
    private array $categories = [];
    private array $brands = [];
    private array $productTypes = [];
    private array $attributes = [];
    private array $attributeValues = [];
    private array $generatedSkus = [];

    public function run(): void
    {
        if (Product::query()->whereHas('category', fn ($q) => $q->where('slug', 'like', 'rtv%')->orWhere('slug', 'like', 'komputery%'))->exists()) {
            $this->command->info('Electronics already seeded, skipping.');

            return;
        }

        $this->command->info('Creating electronics categories...');
        $this->createCategories();

        $this->command->info('Creating brands...');
        $this->createBrands();

        $this->command->info('Creating attributes...');
        $this->createAttributes();

        $this->command->info('Creating product types...');
        $this->createProductTypes();

        $this->command->info('Creating products (1000+)...');
        $this->createProducts();

        $this->command->info('Electronics seeding completed!');
    }

    private function createCategories(): void
    {
        $categoryTree = [
            'RTV' => [
                'Telewizory' => [
                    'Telewizory 55 cali',
                    'Telewizory 65 cali',
                    'Telewizory 50 cali',
                    'Telewizory 43 cale',
                    'Telewizory 75 cali',
                    'Telewizory 32 cale',
                    'Telewizory 85 cali wieksze',
                    'Telewizory 4K Ultra HD',
                    'Telewizory 8K',
                    'Telewizory OLED',
                    'Telewizory QLED',
                    'Telewizory NanoCell',
                    'Telewizory Smart TV',
                ],
                'Audio' => [
                    'Soundbary' => [
                        'Soundbary z subwooferem',
                        'Soundbary bezprzewodowe',
                        'Soundbary Dolby Atmos',
                    ],
                    'Kolumny glosnikowe' => [
                        'Kolumny podlogowe',
                        'Kolumny podstawkowe',
                        'Glosniki przenośne',
                        'Glosniki Bluetooth',
                    ],
                    'Sluchawki' => [
                        'Sluchawki bezprzewodowe',
                        'Sluchawki nauszne',
                        'Sluchawki dokanalkowe',
                        'Sluchawki True Wireless',
                        'Sluchawki z redukcja szumow',
                    ],
                    'Kino domowe' => [
                        'Zestawy kina domowego',
                        'Wzmacniacze AV',
                        'Odtwarzacze Blu-ray',
                    ],
                    'Radioodbiorniki' => [
                        'Radio FM',
                        'Radio internetowe',
                        'Radiobudziki',
                    ],
                    'Mikro i mini wieze' => [
                        'Mikrowieze',
                        'Miniwieze',
                    ],
                    'Projektory' => [
                        'Projektory 4K',
                        'Projektory Full HD',
                        'Projektory przenośne',
                        'Ekranu do projektorow',
                    ],
                ],
            ],
            'Telefony i Akcesoria' => [
                'Smartfony' => [
                    'Smartfony 5G',
                    'Smartfony z NFC',
                    'Smartfony z duza bateria',
                    'Smartfony z dobrym aparatem',
                    'Smartfony dla graczy',
                    'iPhone',
                    'Smartfony Samsung',
                    'Smartfony Xiaomi',
                    'Smartfony Google Pixel',
                    'Smartfony Oppo',
                    'Smartfony Realme',
                    'Smartfony Motorola',
                ],
                'Tablety' => [
                    'Tablety 10 cali',
                    'Tablety 11 cali',
                    'Tablety 12 cali',
                    'Tablety 8 cali',
                    'iPad',
                    'Tablety Samsung',
                    'Tablety Lenovo',
                    'Tablety Xiaomi',
                ],
                'Smartwatche' => [
                    'Zegarki Apple Watch',
                    'Zegarki Samsung Galaxy Watch',
                    'Zegarki Xiaomi',
                    'Zegarki Garmin',
                    'Zegarki Fitbit',
                    'Smartwatche damskie',
                    'Smartwatche meskie',
                    'Opaski fitness',
                ],
            ],
            'Komputery' => [
                'Laptopy' => [
                    'Laptopy 15,6 cala',
                    'Laptopy 14 cali',
                    'Laptopy 16 cali',
                    'Laptopy 17,3 cala',
                    'Laptopy 13 cali',
                    'Laptopy gamingowe',
                    'Laptopy biznesowe',
                    'Laptopy dla graczy',
                    'MacBook' => [
                        'MacBook Air',
                        'MacBook Pro',
                    ],
                    'Laptopy convertibile',
                    'Laptopy ChromeOS',
                ],
                'Komputery stacjonarne' => [
                    'Komputery All in One',
                    'Komputery MINI PC',
                    'Komputery towers',
                    'Stacje robocze',
                    'iMac',
                    'Mac Mini',
                    'Mac Studio',
                ],
                'Podzespoly komputerowe' => [
                    'Procesory' => [
                        'Procesory Intel' => [
                            'Intel Core i9',
                            'Intel Core i7',
                            'Intel Core i5',
                            'Intel Core i3',
                        ],
                        'Procesory AMD' => [
                            'AMD Ryzen 9',
                            'AMD Ryzen 7',
                            'AMD Ryzen 5',
                            'AMD Ryzen 3',
                        ],
                    ],
                    'Karty graficzne' => [
                        'Karty NVIDIA GeForce RTX',
                        'Karty AMD Radeon',
                    ],
                    'Plyty glowne',
                    'Pamiec RAM' => [
                        'Pamiec DDR5',
                        'Pamiec DDR4',
                    ],
                    'Dyski' => [
                        'Dyski SSD NVMe',
                        'Dyski SSD SATA',
                        'Dyski HDD',
                        'Dyski zewnetrzne',
                    ],
                    'Zasilacze',
                    'Obudowy',
                    'Chlodzenie',
                ],
                'Monitory' => [
                    'Monitory 27 cali',
                    'Monitory 32 cale',
                    'Monitory 24 cale',
                    'Monitory 34 cale ultrawide',
                    'Monitory gamingowe',
                    'Monitory profesjonalne',
                    'Monitory 4K',
                    'Monitory Curved',
                ],
                'Akcesoria komputerowe' => [
                    'Klawiatury' => [
                        'Klawiatury mechaniczne',
                        'Klawiatury membranowe',
                        'Klawiatury bezprzewodowe',
                        'Klawiatury RGB',
                    ],
                    'Myszy' => [
                        'Myszy gamingowe',
                        'Myszy bezprzewodowe',
                    ],
                    'Pady gamingowe',
                    'Karty dzwikowe',
                    'Kamery internetowe',
                    'Mikrofony',
                    'Sluchawki komputerowe',
                ],
            ],
            'Gaming' => [
                'Konsole' => [
                    'PlayStation 5' => [
                        'PS5 Slim',
                        'Akcesoria PS5',
                        'Gry PS5',
                    ],
                    'Xbox Series X|S',
                    'Nintendo Switch' => [
                        'Nintendo Switch OLED',
                        'Nintendo Switch Lite',
                        'Akcesoria Switch',
                        'Gry Switch',
                    ],
                ],
                'PC Gaming' => [
                    'Komputery gamingowe',
                    'Klawiatury gamingowe',
                    'Sluchawki gamingowe',
                ],
                'Gry' => [
                    'Gry na PC',
                    'Gry na PlayStation',
                    'Gry na Xbox',
                    'Gry na Nintendo',
                ],
            ],
            'AGD' => [
                'Duze AGD' => [
                    'Pralki' => [
                        'Pralki przednie',
                        'Pralki ladowane od gory',
                        'Pralki slim',
                        'Pralki z suszeniem',
                    ],
                    'Suszarki',
                    'Zmywarki' => [
                        'Zmywarki 60cm',
                        'Zmywarki 45cm',
                    ],
                    'Lodowki' => [
                        'Lodowki Side by Side',
                        'Lodowki French Door',
                        'Lodowki jednodrzwiowe',
                        'Lodowki No Frost',
                    ],
                    'Zamrazarki',
                    'Plyty grzewcze' => [
                        'Plyty indukcyjne',
                        'Plyty ceramiczne',
                        'Plyty gazowe',
                    ],
                    'Kuchenki',
                    'Piekarniki i kuchenki mikrofalowe',
                    'Okapy',
                ],
                'Male AGD' => [
                    'Ekspresy do kawy' => [
                        'Ekspresy cisnieniowe',
                        'Ekspresy automatyczne',
                        'Ekspresy kapsulkowe',
                    ],
                    'Gotowanie' => [
                        'Czajniki',
                        'Patelnie elektryczne',
                        'Tostery',
                        'Grille elektryczne',
                    ],
                    'Pieczenie' => [
                        'Roboty kuchenne',
                        'Mikser reczny',
                        'Mikser planetarny',
                    ],
                    'Kuchnia' => [
                        'Blendery reczne',
                        'Blendery kielichowe',
                        'Wyciskarki do sokuw',
                    ],
                    'Dom' => [
                        'Odkurzacze' => [
                            'Odkurzacze bezprzewodowe',
                            'Odkurzacze pionowe',
                            'Odkurzacze automatyczne',
                        ],
                        'Prasowanie' => [
                            'Zelazka',
                            'Prasy do ubran',
                        ],
                        'Klimatyzacja' => [
                            'Klimatyzatory przenośne',
                            'Wentylatory',
                            'Nawilzacze',
                            'Oczyszczacze powietrza',
                        ],
                    ],
                    'Pielegnacja osobista' => [
                        'Suszarki do wlosow',
                        'Prostownice',
                        'Golarki' => [
                            'Golarki meskie',
                            'Golarki damskie',
                        ],
                        'Szczoteczki do zebow',
                    ],
                ],
            ],
            'Foto i Video' => [
                'Aparaty cyfrowe' => [
                    'Aparaty bezlusterkowe',
                    'Aparaty kompaktowe',
                    'Aparaty natychmiastowe',
                ],
                'Obiektywy',
                'Kamery' => [
                    'Kamery 4K',
                    'Kamery Full HD',
                    'Kamery sportowe',
                    'Kamery 360',
                ],
                'Drony',
                'Akcesoria fotograficzne' => [
                    'Torby i plecaki',
                    'Statywy',
                    'Lampy blyskowe',
                    'Filtry',
                    'Karty pamieci',
                ],
            ],
            'Smart Home' => [
                'Inteligentny dom' => [
                    'Centrale smart home',
                    'Czujniki' => [
                        'Czujniki ruchu',
                        'Czujniki temperatury',
                        'Czujniki otwarcia',
                    ],
                    'Sterowanie' => [
                        'Wlaczniki smart',
                        'Gniazdka smart',
                    ],
                    'Oswietlenie' => [
                        'Zarowki smart',
                        'Tasmy LED smart',
                    ],
                ],
                'Monitoring' => [
                    'Kamery IP' => [
                        'Kamery wewnetrzne',
                        'Kamery zewnetrzne',
                    ],
                    'Domofony i wideodomofony',
                ],
                'Roboty' => [
                    'Roboty odkurzajace',
                    'Roboty odkurzajace i mopujace',
                ],
            ],
            'Sport i zdrowie' => [
                'Rowery i akcesoria' => [
                    'Rowery' => [
                        'Rowery gorskie',
                        'Rowery szosowe',
                        'Rowery miejskie',
                        'Rowery elektryczne',
                    ],
                    'Akcesoria rowerowe' => [
                        'Kaski rowerowe',
                        'Oswietlenie rowerowe',
                    ],
                ],
                'Trening' => [
                    'Sprzet fitness' => [
                        'Bieznie',
                        'Rowerki stacjonarne',
                        'Orbitreki',
                    ],
                    'Hantle i kettlebell',
                ],
            ],
            'Biuro' => [
                'Meble biurowe' => [
                    'Biurka' => [
                        'Biurka regulowane',
                        'Biurka standardowe',
                    ],
                    'Krzesla' => [
                        'Krzesla biurowe',
                        'Krzesla gamingowe',
                        'Fotele kierownicze',
                    ],
                ],
                'Artykuly biurowe' => [
                    'Drukarki i tusze' => [
                        'Drukarki laserowe',
                        'Drukarki atramentowe',
                        'Urzadzenia wielofunkcyjne',
                    ],
                    'Niszczarki',
                    'Tablice',
                ],
            ],
        ];

        $this->createCategoryTree($categoryTree, null);
    }

    private function createCategoryTree(array $tree, ?int $parentId, string $prefix = ''): void
    {
        $position = 1;
        foreach ($tree as $key => $value) {
            if (is_array($value)) {
                $name = $key;
                $children = $value;
            } else {
                $name = $value;
                $children = [];
            }
            
            $slugBase = Str::slug($name);
            $slug = $prefix ? $prefix . '-' . $slugBase : $slugBase;
            
            $category = Category::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => ['pl' => $name, 'en' => $name],
                    'description' => ['pl' => 'Kategoria ' . $name, 'en' => $name . ' category'],
                    'is_active' => true,
                    'parent_id' => $parentId,
                    'position' => $position++,
                ],
            );

            // First occurrence of a name wins — prevents Gaming duplicates from overwriting Komputery entries
            if (! isset($this->categories[$name])) {
                $this->categories[$name] = $category->id;
            }

            if (! empty($children)) {
                $this->createCategoryTree($children, $category->id, $slug);
            }
        }
    }

    private function createBrands(): void
    {
        $brandsData = [
            'TV Audio' => [
                'Samsung', 'LG', 'Philips', 'Hisense', 'Sony', 'Panasonic', 'Sharp', 'Toshiba',
                'JBL', 'Bose', 'Sonos', 'Harman Kardon', 'Denon', 'Yamaha', 'Pioneer', 'Onkyo',
                'Marshall', 'Ultimate Ears', 'Bang Olufsen', 'Sennheiser', 'Audio-Technica', 'Skullcandy',
            ],
            'Mobile' => [
                'Apple', 'Samsung', 'Xiaomi', 'Google', 'Oppo', 'OnePlus', 'Realme', 'Motorola',
                'Nokia', 'Sony', 'Asus', 'Nothing', 'Honor', 'Vivo', 'TCL', 'CAT',
            ],
            'Computing' => [
                'Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'MSI', 'Acer', 'Microsoft', 'Samsung',
                'Razer', 'Alienware', 'Gigabyte', 'Toshiba', 'Fujitsu', 'Huawei',
                'Intel', 'AMD', 'NVIDIA', 'Crucial', 'Kingston', 'Corsair', 'Western Digital', 'Seagate',
                'AOC', 'LG', 'BenQ', 'ViewSonic', 'Philips', 'WD', 'G.Skill', 'Logitech', 'SteelSeries', 'HyperX',
            ],
            'Gaming' => [
                'Sony', 'Microsoft', 'Nintendo', 'Asus', 'Razer', 'Logitech', 'SteelSeries',
                'HyperX', 'Corsair', 'Turtle Beach', 'PlayStation', 'Xbox', 'Valve', 'EA', 'Ubisoft',
            ],
            'AGD' => [
                'Samsung', 'LG', 'Whirlpool', 'Electrolux', 'Beko', 'Bosch', 'Siemens', 'Miele',
                'Amica', 'Candy', 'Hotpoint', 'Indesit', 'Zanussi', 'AEG', 'Gorenje', 'Sharp',
                'Philips', 'Dyson', 'Vorwerk', 'Krups', 'DeLonghi', 'Jura', 'Nespresso',
                'Tefal', 'Russell Hobbs', 'Cuisinart', 'Braun', 'Oral-B', 'Panasonic', 'Remington',
                'Roborock', 'KitchenAid', 'Kenwood',
            ],
            'Photo Video' => [
                'Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus', 'Pentax', 'Leica',
                'Sigma', 'Tamron', 'Tokina', 'Zeiss', 'Samyang', 'GoPro', 'DJI', 'Insta360',
                'Manfrotto', 'Gitzo', 'Peak Design', 'Lowepro', 'SanDisk', 'Godox', 'Hoya',
            ],
            'Smart Home' => [
                'Google', 'Amazon', 'Apple', 'Xiaomi', 'Aqara', 'Tuya', 'Shelly', 'Sonoff',
                'Philips Hue', 'LIFX', 'Nanoleaf', 'Ring', 'Nest', 'Arlo', 'Eufy', 'Reolink',
                'Dyson', 'iRobot', 'Ecovacs', 'Neato',
            ],
            'Sport' => [
                'Nike', 'Adidas', 'Puma', 'Under Armour', 'Asics', 'New Balance', 'Reebok',
                'Fitbit', 'Garmin', 'Polar', 'Suunto', 'Apple Watch', 'Xiaomi',
            ],
            'Office' => [
                'HP', 'Canon', 'Epson', 'Brother', 'Lexmark', 'Xerox', 'Samsung', 'Ricoh',
                'Fellowes', 'HSM', 'Ubiquiti', 'Cisco', 'TP-Link', 'Netgear', 'MikroTik', 'D-Link',
            ],
        ];

        $position = 1;
        foreach ($brandsData as $category => $brandList) {
            foreach ($brandList as $brandName) {
                $key = $category . '::' . $brandName;
                
                $brand = Brand::query()->updateOrCreate(
                    ['slug' => Str::slug($brandName)],
                    [
                        'name' => $brandName,
                        'description' => 'Marka ' . $brandName,
                        'is_active' => true,
                        'position' => $position++,
                    ],
                );
                $this->brands[$key] = $brand->id;
            }
        }
    }

    private function createProductTypes(): void
    {
        $productTypes = [
            ['name' => 'Telewizor', 'attributes' => ['service-package']],
            ['name' => 'Soundbar', 'attributes' => ['bundle']],
            ['name' => 'Sluchawki', 'attributes' => ['color']],
            ['name' => 'Glownik Bluetooth', 'attributes' => ['edition']],
            ['name' => 'Smartphone', 'attributes' => ['storage', 'color']],
            ['name' => 'Tablet', 'attributes' => ['storage', 'connectivity']],
            ['name' => 'Smartwatch', 'attributes' => ['case-size', 'color']],
            ['name' => 'Laptop', 'attributes' => ['software-package']],
            ['name' => 'Monitor', 'attributes' => ['service-package']],
            ['name' => 'Procesor', 'attributes' => ['package-type']],
            ['name' => 'Karta graficzna', 'attributes' => ['package-type']],
            ['name' => 'Dysk SSD', 'attributes' => ['package-type']],
            ['name' => 'Pamiec RAM', 'attributes' => ['package-type']],
            ['name' => 'Klawiatura', 'attributes' => ['edition']],
            ['name' => 'Mysz', 'attributes' => ['edition']],
            ['name' => 'Konsole do gier', 'attributes' => ['edition']],
            ['name' => 'Gra', 'attributes' => ['edition']],
            ['name' => 'Pralka', 'attributes' => []],
            ['name' => 'Lodowka', 'attributes' => []],
            ['name' => 'Zmywarka', 'attributes' => []],
            ['name' => 'Plyta grzewcza', 'attributes' => []],
            ['name' => 'Kuchenka mikrofalowa', 'attributes' => []],
            ['name' => 'Ekspres do kawy', 'attributes' => []],
            ['name' => 'Odkurzac', 'attributes' => []],
            ['name' => 'Czajnik', 'attributes' => []],
            ['name' => 'Robot kuchenny', 'attributes' => []],
            ['name' => 'Suszarka do wlosow', 'attributes' => []],
            ['name' => 'Szczoteczka do zebow', 'attributes' => []],
            ['name' => 'Aparat fotograficzny', 'attributes' => ['package-type']],
            ['name' => 'Obiektyw', 'attributes' => []],
            ['name' => 'Kamera', 'attributes' => []],
            ['name' => 'Drone', 'attributes' => []],
            ['name' => 'Akcesoria fotograficzne', 'attributes' => []],
            ['name' => 'Centrale smart home', 'attributes' => []],
            ['name' => 'Czujniki', 'attributes' => []],
            ['name' => 'Kamera IP', 'attributes' => []],
            ['name' => 'Robot sprzatajacy', 'attributes' => ['bundle']],
            ['name' => 'Oswietlenie', 'attributes' => []],
        ];

        foreach ($productTypes as $definition) {
            $typeName = $definition['name'];
            $productType = ProductType::query()->updateOrCreate(
                ['slug' => Str::slug($typeName)],
                [
                    'name' => $typeName,
                    'has_variants' => $definition['attributes'] !== [],
                    'variant_selection_attributes' => $definition['attributes'],
                    'is_shippable' => true,
                ],
            );
            $this->productTypes[$typeName] = $productType->id;

            foreach ($definition['attributes'] as $position => $attributeSlug) {
                $attributeId = $this->attributes[$attributeSlug] ?? null;
                if (! $attributeId) {
                    continue;
                }

                ProductTypeAttribute::query()->updateOrCreate(
                    [
                        'product_type_id' => $productType->id,
                        'attribute_id' => $attributeId,
                    ],
                    [
                        'is_required' => true,
                        'position' => $position + 1,
                    ],
                );
            }
        }
    }

    private function createAttributes(): void
    {
        $definitions = [
            [
                'slug' => 'color',
                'name' => 'Kolor',
                'type' => AttributeTypeEnum::COLOR,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 1,
                'values' => [
                    ['value' => 'Czarny', 'color_hex' => '#111111'],
                    ['value' => 'Bialy', 'color_hex' => '#F5F5F5'],
                    ['value' => 'Czerwony', 'color_hex' => '#DC2626'],
                    ['value' => 'Zielony', 'color_hex' => '#16A34A'],
                    ['value' => 'Zolty', 'color_hex' => '#EAB308'],
                    ['value' => 'Niebieski', 'color_hex' => '#2563EB'],
                ],
            ],
            [
                'slug' => 'storage',
                'name' => 'Pamiec',
                'type' => AttributeTypeEnum::SELECT,
                'unit' => 'GB',
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 2,
                'values' => [
                    ['value' => '128GB'],
                    ['value' => '256GB'],
                    ['value' => '512GB'],
                    ['value' => '1TB'],
                ],
            ],
            [
                'slug' => 'connectivity',
                'name' => 'Lacznosc',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 3,
                'values' => [
                    ['value' => 'Wi-Fi'],
                    ['value' => 'Wi-Fi + 5G'],
                ],
            ],
            [
                'slug' => 'case-size',
                'name' => 'Rozmiar koperty',
                'type' => AttributeTypeEnum::SELECT,
                'unit' => 'mm',
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 4,
                'values' => [
                    ['value' => '41mm'],
                    ['value' => '45mm'],
                ],
            ],
            [
                'slug' => 'software-package',
                'name' => 'Pakiet oprogramowania',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => false,
                'is_variant_selection' => true,
                'position' => 5,
                'values' => [
                    ['value' => 'Standard'],
                    ['value' => 'Z Windows 11'],
                ],
            ],
            [
                'slug' => 'service-package',
                'name' => 'Pakiet uslug',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => false,
                'is_variant_selection' => true,
                'position' => 6,
                'values' => [
                    ['value' => 'Wersja podstawowa'],
                    ['value' => 'Wersja z montazem'],
                    ['value' => 'Standard'],
                    ['value' => 'Z regulacja wysokosci'],
                ],
            ],
            [
                'slug' => 'bundle',
                'name' => 'Zestaw',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => false,
                'is_variant_selection' => true,
                'position' => 7,
                'values' => [
                    ['value' => 'Single'],
                    ['value' => 'Starter Kit'],
                    ['value' => 'Soundbar'],
                    ['value' => 'Zestaw z subwooferem'],
                    ['value' => 'Zestaw 5.1'],
                    ['value' => 'Etui'],
                    ['value' => 'Z dodatkowym kontrolerem'],
                ],
            ],
            [
                'slug' => 'edition',
                'name' => 'Edycja',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 8,
                'values' => [
                    ['value' => 'Standard'],
                    ['value' => 'Wersja XL'],
                    ['value' => 'RGB'],
                    ['value' => 'Digital Edition'],
                    ['value' => 'Deluxe Edition'],
                ],
            ],
            [
                'slug' => 'package-type',
                'name' => 'Typ pakietu',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => false,
                'is_variant_selection' => true,
                'position' => 9,
                'values' => [
                    ['value' => 'Body'],
                    ['value' => 'Z obiektywem kit'],
                    ['value' => 'Box'],
                    ['value' => 'Tray'],
                ],
            ],
        ];

        foreach ($definitions as $definition) {
            $attribute = Attribute::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'name' => $definition['name'],
                    'type' => $definition['type'],
                    'unit' => $definition['unit'] ?? null,
                    'is_filterable' => $definition['is_filterable'],
                    'is_variant_selection' => $definition['is_variant_selection'],
                    'position' => $definition['position'],
                ],
            );

            $this->attributes[$definition['slug']] = $attribute->id;
            $this->attributeValues[$definition['slug']] = [];

            foreach ($definition['values'] as $position => $valueDefinition) {
                $value = AttributeValue::query()->updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'slug' => Str::slug($valueDefinition['value']),
                    ],
                    [
                        'value' => $valueDefinition['value'],
                        'color_hex' => $valueDefinition['color_hex'] ?? null,
                        'position' => $position + 1,
                    ],
                );

                $this->attributeValues[$definition['slug']][$this->normalizeAttributeValueKey($valueDefinition['value'])] = $value->id;
            }
        }
    }

    private function createProducts(): void
    {
        $productConfigs = $this->getProductConfigurations();
        
        $bar = $this->command->getOutput()->createProgressBar(count($productConfigs));
        $bar->start();

        foreach ($productConfigs as $config) {
            $this->createProduct($config);
            $bar->advance();
        }

        $bar->finish();
        $this->command->line('');
    }

    private function getProductConfigurations(): array
    {
        $configs = [];
        
        $configs = array_merge($configs, $this->getTVConfigurations());
        $configs = array_merge($configs, $this->getAudioConfigurations());
        $configs = array_merge($configs, $this->getMobileConfigurations());
        $configs = array_merge($configs, $this->getComputingConfigurations());
        $configs = array_merge($configs, $this->getGamingConfigurations());
        $configs = array_merge($configs, $this->getAGDConfigurations());
        $configs = array_merge($configs, $this->getPhotoVideoConfigurations());
        $configs = array_merge($configs, $this->getSmartHomeConfigurations());
        
        return $configs;
    }

    private function getTVConfigurations(): array
    {
        $configs = [];
        $tvs = [
            ['Samsung', 55, 'OLED', 8999, 12999],
            ['Samsung', 65, 'QLED', 7999, 11999],
            ['LG', 55, 'OLED', 8499, 12999],
            ['LG', 65, 'OLED', 11999, 17999],
            ['Sony', 55, 'OLED', 9499, 13999],
            ['Sony', 65, 'OLED', 12999, 18999],
            ['Philips', 55, 'OLED', 7499, 10999],
            ['Philips', 65, 'MiniLED', 8999, 12999],
            ['Hisense', 55, 'ULED', 3999, 5999],
            ['Hisense', 65, 'ULED', 5499, 7999],
            ['Samsung', 75, 'QLED', 9999, 14999],
            ['LG', 75, 'QNED', 8999, 12999],
            ['Samsung', 43, 'Crystal UHD', 2499, 3999],
            ['Samsung', 50, 'Crystal UHD', 2999, 4499],
            ['Philips', 50, 'Ambilight', 3499, 4999],
            ['LG', 50, 'NanoCell', 3299, 4799],
            ['Sony', 43, 'Full HD', 2199, 3499],
            ['Hisense', 43, 'Full HD', 1799, 2499],
            ['Samsung', 32, 'HD Ready', 1299, 1999],
            ['LG', 32, 'HD Ready', 1199, 1799],
            ['Samsung', 85, 'QLED', 19999, 29999],
            ['LG', 86, 'LED', 12999, 18999],
        ];

        $categoryMap = [
            55 => 'Telewizory 55 cali',
            65 => 'Telewizory 65 cali',
            75 => 'Telewizory 75 cali',
            43 => 'Telewizory 43 cale',
            50 => 'Telewizory 50 cali',
            32 => 'Telewizory 32 cale',
            85 => 'Telewizory 85 cali wieksze',
            86 => 'Telewizory 85 cali wieksze',
        ];

        foreach ($tvs as [$brand, $size, $tech, $priceMin, $priceMax]) {
            $category = $categoryMap[$size] ?? 'Telewizory 55 cali';
            $brandKey = 'TV Audio::' . $brand;
            
            for ($i = 0; $i < 4; $i++) {
                $modelSuffix = $this->generateModelSuffix();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $size . '" ' . $tech . ' Smart TV ' . $modelSuffix,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Telewizor',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Wersja podstawowa', 'price' => $price, 'sku' => $this->generateSku($brand, (string) $size)],
                        ['name' => 'Wersja z montazem', 'price' => $price + 300, 'sku' => $this->generateSku($brand, (string) $size) . '-M'],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getAudioConfigurations(): array
    {
        $configs = [];
        
        $soundbars = [
            ['Samsung', 1299, 3999],
            ['LG', 999, 3499],
            ['JBL', 899, 2999],
            ['Bose', 2499, 6999],
            ['Sony', 1499, 4499],
            ['Sonos', 2499, 5999],
            ['Harman Kardon', 1999, 4999],
        ];

        foreach ($soundbars as [$brand, $priceMin, $priceMax]) {
            $brandKey = 'TV Audio::' . $brand;
            
            for ($i = 0; $i < 6; $i++) {
                $model = $this->generateSoundbarModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' Soundbar ' . $model,
                    'brand' => $brandKey,
                    'category' => 'Soundbary',
                    'productType' => 'Soundbar',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Soundbar', 'price' => $price, 'sku' => $this->generateSku($brand, 'SB')],
                        ['name' => 'Zestaw z subwooferem', 'price' => $price + 500, 'sku' => $this->generateSku($brand, 'SB') . '-SW'],
                        ['name' => 'Zestaw 5.1', 'price' => $price + 1500, 'sku' => $this->generateSku($brand, 'SB') . '-51'],
                    ],
                ];
            }
        }

        $headphones = [
            ['Sony', 299, 3499, 'Sluchawki bezprzewodowe'],
            ['Samsung', 199, 1999, 'Sluchawki True Wireless'],
            ['Apple', 799, 2499, 'Sluchawki True Wireless'],
            ['JBL', 149, 1499, 'Sluchawki bezprzewodowe'],
            ['Bose', 1499, 3499, 'Sluchawki z redukcja szumow'],
            ['Sennheiser', 799, 3999, 'Sluchawki nauszne'],
            ['Audio-Technica', 299, 1999, 'Sluchawki dokanalkowe'],
            ['Skullcandy', 99, 799, 'Sluchawki bezprzewodowe'],
            ['Marshall', 799, 2499, 'Sluchawki nauszne'],
            ['Bang Olufsen', 1999, 5999, 'Sluchawki premium'],
        ];

        foreach ($headphones as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'TV Audio::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateHeadphoneModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Sluchawki',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Czarny', 'price' => $price, 'sku' => $this->generateSku($brand, 'HP') . '-BK'],
                        ['name' => 'Bialy', 'price' => $price, 'sku' => $this->generateSku($brand, 'HP') . '-WH'],
                    ],
                ];
            }
        }

        $speakers = [
            ['JBL', 199, 1999],
            ['Sony', 149, 1499],
            ['Ultimate Ears', 299, 1999],
            ['Marshall', 799, 2499],
            ['Bang Olufsen', 1999, 7999],
            ['Sonos', 999, 3999],
            ['Bose', 799, 2999],
        ];

        foreach ($speakers as [$brand, $priceMin, $priceMax]) {
            $brandKey = 'TV Audio::' . $brand;
            
            for ($i = 0; $i < 6; $i++) {
                $model = $this->generateSpeakerModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => 'Glosniki Bluetooth',
                    'productType' => 'Glownik Bluetooth',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'SP')],
                        ['name' => 'Wersja XL', 'price' => $price + 300, 'sku' => $this->generateSku($brand, 'SP') . '-XL'],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getMobileConfigurations(): array
    {
        $configs = [];
        
        $smartphones = [
            ['Apple', 3999, 9999, 'iPhone'],
            ['Samsung', 1999, 8999, 'Smartfony Samsung'],
            ['Xiaomi', 999, 4999, 'Smartfony Xiaomi'],
            ['Google', 2999, 6999, 'Smartfony Google Pixel'],
            ['Oppo', 1499, 5999, 'Smartfony Oppo'],
            ['OnePlus', 2499, 6999, 'Smartfony'],
            ['Realme', 799, 2999, 'Smartfony Realme'],
            ['Motorola', 799, 3999, 'Smartfony Motorola'],
            ['Nothing', 2499, 4999, 'Smartfony'],
            ['Honor', 1499, 5999, 'Smartfony'],
            ['Asus', 2999, 7999, 'Smartfony dla graczy'],
        ];

        foreach ($smartphones as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Mobile::' . $brand;
            
            for ($i = 0; $i < 10; $i++) {
                $model = $this->generateSmartphoneModel($brand);
                $price = rand($priceMin, $priceMax);
                $storageOptions = [128, 256, 512];
                $colorOptions = $this->getPhoneColors($brand);

                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Smartphone',
                    'price' => $price,
                    'variants' => $this->buildStorageColorVariants($brand, 'PH', $price, $storageOptions, $colorOptions),
                ];
            }
        }

        $tablets = [
            ['Apple', 2499, 8999, 'iPad'],
            ['Samsung', 1499, 6999, 'Tablety Samsung'],
            ['Xiaomi', 999, 3999, 'Tablety Xiaomi'],
            ['Lenovo', 799, 2999, 'Tablety Lenovo'],
            ['Microsoft', 3999, 9999, 'Tablice'],
        ];

        foreach ($tablets as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Mobile::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateTabletModel($brand);
                $price = rand($priceMin, $priceMax);
                $storageOptions = [128, 256, 512];
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Tablet',
                    'price' => $price,
                    'variants' => $this->buildTabletVariants($brand, $price, $storageOptions),
                ];
            }
        }

        $watches = [
            ['Apple', 1499, 6999, 'Zegarki Apple Watch'],
            ['Samsung', 799, 3999, 'Zegarki Samsung Galaxy Watch'],
            ['Xiaomi', 199, 799, 'Zegarki Xiaomi'],
            ['Garmin', 999, 4999, 'Zegarki Garmin'],
            ['Fitbit', 399, 1999, 'Zegarki Fitbit'],
            ['Amazfit', 299, 999, 'Opaski fitness'],
        ];

        foreach ($watches as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Mobile::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateWatchModel();
                $price = rand($priceMin, $priceMax);
                
                $watchColors = ['Czarny', 'Bialy', 'Zielony'];

                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Smartwatch',
                    'price' => $price,
                    'variants' => $this->buildWatchVariants($brand, $price, $watchColors),
                ];
            }
        }

        return $configs;
    }

    private function getComputingConfigurations(): array
    {
        $configs = [];
        
        $laptops = [
            ['Apple', 4999, 24999, 'MacBook Air', 'Laptopy'],
            ['Apple', 7999, 29999, 'MacBook Pro', 'Laptopy'],
            ['Dell', 2999, 8999, 'Dell XPS', 'Laptopy 14 cali'],
            ['Dell', 3999, 12999, 'Dell XPS', 'Laptopy 15,6 cala'],
            ['HP', 2499, 7999, 'HP Spectre', 'Laptopy'],
            ['HP', 1999, 6999, 'HP Pavilion', 'Laptopy 15,6 cala'],
            ['Lenovo', 2499, 8999, 'Lenovo ThinkPad', 'Laptopy biznesowe'],
            ['Lenovo', 2999, 9999, 'Lenovo Yoga', 'Laptopy convertibile'],
            ['ASUS', 2999, 9999, 'ASUS ZenBook', 'Laptopy'],
            ['ASUS', 4999, 19999, 'ASUS ROG', 'Laptopy gamingowe'],
            ['MSI', 4990, 19999, 'MSI Gaming', 'Laptopy gamingowe'],
            ['Razer', 7999, 24999, 'Razer Blade', 'Laptopy gamingowe'],
            ['Microsoft', 4999, 12999, 'Microsoft Surface', 'Laptopy'],
            ['Samsung', 3999, 9999, 'Samsung Galaxy Book', 'Laptopy'],
            ['Acer', 1999, 6999, 'Acer Swift', 'Laptopy'],
            ['Acer', 2999, 9999, 'Acer Predator', 'Laptopy gamingowe'],
        ];

        foreach ($laptops as [$brand, $priceMin, $priceMax, $modelName, $category]) {
            $brandKey = 'Computing::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $ram = $this->getRandomRam();
                $storage = $this->getRandomStorage();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $modelName . ' ' . $ram . 'GB/' . $storage . 'GB',
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Laptop',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'LT')],
                        ['name' => 'Z Windows 11', 'price' => $price + 400, 'sku' => $this->generateSku($brand, 'LT') . '-WIN'],
                    ],
                ];
            }
        }

        $monitors = [
            ['Samsung', 799, 4999, 'Monitory 27 cali'],
            ['LG', 999, 4999, 'Monitory 27 cali'],
            ['Dell', 799, 3999, 'Monitory 27 cali'],
            ['AOC', 499, 2999, 'Monitory 24 cale'],
            ['ASUS', 999, 4999, 'Monitory gamingowe'],
            ['MSI', 799, 3999, 'Monitory gamingowe'],
            ['BenQ', 1199, 4999, 'Monitory profesjonalne'],
            ['ViewSonic', 599, 2999, 'Monitory'],
        ];

        foreach ($monitors as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Computing::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateMonitorModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Monitor',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'MN')],
                        ['name' => 'Z regulacja wysokosci', 'price' => $price + 300, 'sku' => $this->generateSku($brand, 'MN') . '-ARM'],
                    ],
                ];
            }
        }

        $components = [
            'Procesory' => [
                ['Intel', 799, 6999, 'Procesory Intel'],
                ['AMD', 599, 5999, 'Procesory AMD'],
            ],
            'Karty graficzne' => [
                ['NVIDIA', 2999, 19999, 'Karty NVIDIA GeForce RTX'],
                ['AMD', 2499, 9999, 'Karty AMD Radeon'],
            ],
            'Dyski SSD' => [
                ['Samsung', 299, 2999, 'Dyski SSD NVMe'],
                ['WD', 249, 2499, 'Dyski SSD NVMe'],
                ['Crucial', 199, 1999, 'Dyski SSD NVMe'],
                ['Kingston', 179, 1799, 'Dyski SSD NVMe'],
            ],
            'Pamiec RAM' => [
                ['Corsair', 199, 1999, 'Pamiec DDR5'],
                ['G.Skill', 249, 2499, 'Pamiec DDR5'],
                ['Kingston', 149, 1499, 'Pamiec DDR4'],
            ],
        ];

        foreach ($components as $componentType => $brands) {
            foreach ($brands as [$brand, $priceMin, $priceMax, $category]) {
                $brandKey = 'Computing::' . $brand;
                
                for ($i = 0; $i < 10; $i++) {
                    $model = $this->generateComponentModel($componentType);
                    $price = rand($priceMin, $priceMax);
                    
                    $configs[] = [
                        'name' => $brand . ' ' . $model,
                        'brand' => $brandKey,
                        'category' => $category,
                        'productType' => $componentType === 'Karty graficzne' ? 'Karta graficzna' : 
                                        ($componentType === 'Procesory' ? 'Procesor' : 
                                        ($componentType === 'Dyski SSD' ? 'Dysk SSD' : 'Pamiec RAM')),
                        'price' => $price,
                        'variants' => [
                            ['name' => 'Box', 'price' => $price, 'sku' => $this->generateSku($brand, 'COMP')],
                            ['name' => 'Tray', 'price' => $price - 50, 'sku' => $this->generateSku($brand, 'COMP') . '-T'],
                        ],
                    ];
                }
            }
        }

        $peripherals = [
            ['Logitech', 199, 1999, 'Klawiatury'],
            ['Razer', 299, 1999, 'Klawiatury gamingowe'],
            ['SteelSeries', 399, 1999, 'Klawiatury gamingowe'],
            ['Corsair', 299, 1999, 'Klawiatury gamingowe'],
            ['HyperX', 199, 999, 'Sluchawki komputerowe'],
            ['Razer', 299, 1999, 'Myszy gamingowe'],
            ['Logitech', 99, 999, 'Myszy'],
            ['SteelSeries', 149, 999, 'Myszy gamingowe'],
        ];

        foreach ($peripherals as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Computing::' . $brand;
            
            for ($i = 0; $i < 10; $i++) {
                $model = $this->generatePeripheralModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => str_contains($category, 'Klawiatur') ? 'Klawiatura' : 'Mysz',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'PER')],
                        ['name' => 'RGB', 'price' => $price + 100, 'sku' => $this->generateSku($brand, 'PER') . '-RGB'],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getGamingConfigurations(): array
    {
        $configs = [];
        
        $consoles = [
            ['Sony', 2499, 4999, 'PlayStation 5'],
            ['Microsoft', 1999, 4999, 'Xbox Series X'],
            ['Nintendo', 1499, 3999, 'Nintendo Switch'],
        ];

        foreach ($consoles as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Gaming::' . $brand;
            
            for ($i = 0; $i < 5; $i++) {
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $category,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Konsole do gier',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'CON')],
                        ['name' => 'Digital Edition', 'price' => $price - 500, 'sku' => $this->generateSku($brand, 'CON') . '-DL'],
                        ['name' => 'Z dodatkowym kontrolerem', 'price' => $price + 300, 'sku' => $this->generateSku($brand, 'CON') . '-BUN'],
                    ],
                ];
            }
        }

        $games = [
            ['Sony', 249, 399, 'Gry PS5'],
            ['Microsoft', 249, 399, 'Gry Xbox'],
            ['Nintendo', 199, 399, 'Gry Switch'],
            ['EA', 199, 399, 'Gry na PC'],
            ['Ubisoft', 199, 399, 'Gry na PC'],
        ];

        foreach ($games as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Gaming::' . $brand;
            
            for ($i = 0; $i < 15; $i++) {
                $gameTitle = $this->generateGameTitle();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $gameTitle . ' - ' . $brand,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Gra',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'GAM')],
                        ['name' => 'Deluxe Edition', 'price' => $price + 100, 'sku' => $this->generateSku($brand, 'GAM') . '-DLX'],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getAGDConfigurations(): array
    {
        $configs = [];
        
        $largeAppliances = [
            ['Samsung', 2499, 9999, 'Pralki', 'Pralki przednie'],
            ['LG', 2499, 9999, 'Pralki', 'Pralki przednie'],
            ['Bosch', 2199, 8999, 'Pralki', 'Pralki przednie'],
            ['Samsung', 2999, 8999, 'Lodowki', 'Lodowki No Frost'],
            ['LG', 2999, 9999, 'Lodowki', 'Lodowki Side by Side'],
            ['Bosch', 2499, 7999, 'Lodowki', 'Lodowki French Door'],
            ['Samsung', 1999, 5999, 'Zmywarki', 'Zmywarki 60cm'],
            ['Bosch', 2199, 5999, 'Zmywarki', 'Zmywarki 60cm'],
            ['Electrolux', 1999, 5999, 'Zmywarki', 'Zmywarki'],
            ['Samsung', 2999, 9999, 'Plyty grzewcze', 'Plyty indukcyjne'],
            ['Bosch', 2499, 7999, 'Plyty grzewcze', 'Plyty indukcyjne'],
            ['Electrolux', 1999, 5999, 'Kuchenki mikrofalowe', 'Kuchenki mikrofalowe'],
        ];

        foreach ($largeAppliances as [$brand, $priceMin, $priceMax, $category, $subcategory]) {
            $brandKey = 'AGD::' . $brand;
            
            for ($i = 0; $i < 6; $i++) {
                $model = $this->generateApplianceModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $subcategory,
                    'productType' => $category === 'Lodowki' ? 'Lodowka' : 
                                    ($category === 'Pralki' ? 'Pralka' : 
                                    ($category === 'Zmywarki' ? 'Zmywarka' : 
                                    ($category === 'Plyty grzewcze' ? 'Plyta grzewcza' : 'Kuchenka mikrofalowa'))),
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'AGD')],
                        ['name' => 'Z instalacja', 'price' => $price + 200, 'sku' => $this->generateSku($brand, 'AGD') . '-INST'],
                    ],
                ];
            }
        }

        $smallAppliances = [
            ['Philips', 799, 4999, 'Ekspresy cisnieniowe'],
            ['DeLonghi', 999, 5999, 'Ekspresy cisnieniowe'],
            ['Jura', 2999, 12999, 'Ekspresy automatyczne'],
            ['Nespresso', 499, 2999, 'Ekspresy kapsulkowe'],
            ['Dyson', 2999, 9999, 'Odkurzacze bezprzewodowe'],
            ['Roborock', 1999, 5999, 'Roboty odkurzajace'],
            ['iRobot', 1999, 5999, 'Roboty odkurzajace'],
            ['Xiaomi', 999, 3999, 'Roboty odkurzajace i mopujace'],
            ['Tefal', 99, 799, 'Czajniki'],
            ['Russell Hobbs', 79, 499, 'Czajniki'],
            ['KitchenAid', 1999, 5999, 'Roboty kuchenne'],
            ['Kenwood', 800, 3999, 'Roboty kuchenne'],
            ['Braun', 299, 1999, 'Prostownice'],
            ['Dyson', 1499, 4999, 'Suszarki do wlosow'],
            ['Oral-B', 299, 1999, 'Szczoteczki do zebow'],
        ];

        foreach ($smallAppliances as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'AGD::' . $brand;
            
            for ($i = 0; $i < 6; $i++) {
                $model = $this->generateSmallApplianceModel();
                $price = rand($priceMin, $priceMax);
                
                $productType = 'Ekspres do kawy';
                if (str_contains($category, 'Roboty odkurzajace') || str_contains($category, 'Odkurzacze')) {
                    $productType = 'Odkurzac';
                } elseif (str_contains($category, 'Czajniki')) {
                    $productType = 'Czajnik';
                } elseif (str_contains($category, 'Roboty kuchenne')) {
                    $productType = 'Robot kuchenny';
                } elseif (str_contains($category, 'Prostownice') || str_contains($category, 'Suszarki do wlosow')) {
                    $productType = 'Suszarka do wlosow';
                } elseif (str_contains($category, 'Szczoteczki do zebow')) {
                    $productType = 'Szczoteczka do zebow';
                }
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => $productType,
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'SAGD')],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getPhotoVideoConfigurations(): array
    {
        $configs = [];
        
        $cameras = [
            ['Canon', 2999, 19999, 'Aparaty bezlusterkowe'],
            ['Nikon', 3999, 24999, 'Aparaty bezlusterkowe'],
            ['Sony', 3999, 24999, 'Aparaty bezlusterkowe'],
            ['Fujifilm', 2999, 14999, 'Aparaty bezlusterkowe'],
            ['Panasonic', 2499, 12999, 'Aparaty bezlusterkowe'],
            ['GoPro', 1499, 4999, 'Kamery sportowe'],
            ['DJI', 2999, 9999, 'Drony'],
            ['Insta360', 1999, 5999, 'Kamery 360'],
        ];

        foreach ($cameras as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Photo Video::' . $brand;
            
            for ($i = 0; $i < 6; $i++) {
                $model = $this->generateCameraModel();
                $price = rand($priceMin, $priceMax);
                
                $productType = 'Aparat fotograficzny';
                if (str_contains($category, 'Dron')) {
                    $productType = 'Drone';
                } elseif (str_contains($category, 'Kamera')) {
                    $productType = 'Kamera';
                }
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => $productType,
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Body', 'price' => $price, 'sku' => $this->generateSku($brand, 'CAM')],
                        ['name' => 'Z obiektywem kit', 'price' => $price + 500, 'sku' => $this->generateSku($brand, 'CAM') . '-KIT'],
                    ],
                ];
            }
        }

        $lenses = [
            ['Canon', 1999, 19999, 'Obiektywy'],
            ['Nikon', 1999, 19999, 'Obiektywy'],
            ['Sony', 1999, 19999, 'Obiektywy'],
            ['Sigma', 999, 9999, 'Obiektywy'],
            ['Tamron', 799, 7999, 'Obiektywy'],
            ['Zeiss', 3999, 19999, 'Obiektywy'],
        ];

        foreach ($lenses as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Photo Video::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateLensModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Obiektyw',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'LEN')],
                    ],
                ];
            }
        }

        $accessories = [
            ['Manfrotto', 199, 1999, 'Statywy'],
            ['Peak Design', 299, 1999, 'Torby i plecaki'],
            ['Lowepro', 199, 1499, 'Torby fotograficzne'],
            ['SanDisk', 49, 799, 'Karty pamieci'],
            ['Godox', 199, 1999, 'Lampy blyskowe'],
            ['Hoya', 49, 499, 'Filtry'],
        ];

        foreach ($accessories as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Photo Video::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateAccessoryModel();
                $price = rand($priceMin, $priceMax);
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => 'Akcesoria fotograficzne',
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Standard', 'price' => $price, 'sku' => $this->generateSku($brand, 'ACC')],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function getSmartHomeConfigurations(): array
    {
        $configs = [];
        
        $smartDevices = [
            ['Google', 199, 1999, 'Centrale smart home'],
            ['Amazon', 199, 1999, 'Centrale smart home'],
            ['Apple', 799, 1999, 'Centrale smart home'],
            ['Aqara', 99, 499, 'Czujniki'],
            ['Shelly', 49, 499, 'Sterowanie'],
            ['Philips Hue', 299, 2999, 'Oswietlenie'],
            ['Ring', 199, 1999, 'Kamery wewnetrzne'],
            ['Arlo', 299, 1999, 'Kamery IP'],
            ['Eufy', 199, 999, 'Kamery IP'],
            ['Xiaomi', 199, 1999, 'Roboty odkurzajace'],
        ];

        foreach ($smartDevices as [$brand, $priceMin, $priceMax, $category]) {
            $brandKey = 'Smart Home::' . $brand;
            
            for ($i = 0; $i < 8; $i++) {
                $model = $this->generateSmartHomeModel();
                $price = rand($priceMin, $priceMax);
                
                $productType = 'Centrale smart home';
                if (str_contains($category, 'Czujniki')) {
                    $productType = 'Czujniki';
                } elseif (str_contains($category, 'Kamer')) {
                    $productType = 'Kamera IP';
                } elseif (str_contains($category, 'Robot')) {
                    $productType = 'Robot sprzatajacy';
                } elseif (str_contains($category, 'Oswietlenie')) {
                    $productType = 'Oswietlenie';
                }
                
                $configs[] = [
                    'name' => $brand . ' ' . $model,
                    'brand' => $brandKey,
                    'category' => $category,
                    'productType' => $productType,
                    'price' => $price,
                    'variants' => [
                        ['name' => 'Starter Kit', 'price' => $price + 100, 'sku' => $this->generateSku($brand, 'KIT')],
                        ['name' => 'Single', 'price' => $price, 'sku' => $this->generateSku($brand, 'SGL')],
                    ],
                ];
            }
        }

        return $configs;
    }

    private function createProduct(array $config): void
    {
        $brandId = $this->brands[$config['brand']] ?? null;
        $categoryId = $this->findCategoryId($config['category']);
        $productTypeId = $this->productTypes[$config['productType']] ?? null;

        if (! $brandId || ! $categoryId || ! $productTypeId) {
            return;
        }

        $product = Product::create([
            'product_type_id' => $productTypeId,
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'name' => ['pl' => $config['name'], 'en' => $config['name']],
            'slug' => Str::slug($config['name']) . '-' . Str::random(5),
            'description' => ['pl' => $this->generateDescription($config['name']), 'en' => $this->generateDescription($config['name'])],
            'short_description' => ['pl' => 'Wysokiej jakosci produkt ' . $config['name'], 'en' => 'High quality product ' . $config['name']],
            'is_active' => true,
            'is_saleable' => true,
        ]);

        $variantPosition = 1;
        foreach ($config['variants'] as $variant) {
            $productVariant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $this->ensureUniqueSku($variant['sku'] ?? $this->generateSkuFromName($config['name'])),
                'name' => $variant['name'],
                'price' => $variant['price'] * 100,
                'cost_price' => (int) ($variant['price'] * 0.7 * 100),
                'stock_quantity' => rand(0, 100),
                'stock_threshold' => 5,
                'is_active' => true,
                'is_default' => $variantPosition === 1,
                'position' => $variantPosition++,
            ]);

            $this->attachVariantAttributes($config['productType'], $productVariant, $variant);
        }
    }

    private function findCategoryId(string $categoryName): ?int
    {
        // Exact match first
        if (isset($this->categories[$categoryName])) {
            return $this->categories[$categoryName];
        }

        // Partial match: category name contains the search term (not the other way — avoids 'Gry' matching 'Gry na PC')
        foreach ($this->categories as $name => $id) {
            if (stripos($name, $categoryName) !== false) {
                return $id;
            }
        }

        $this->command->warn("Category not found: '{$categoryName}'");

        return null;
    }

    private function generateModelSuffix(): string
    {
        $suffixes = ['Pro', 'Ultra', 'Plus', 'Max', 'Neo', 'QLED', 'OLED', 'Premium', 'Elite', 'Signature', 'Crystal', 'Vision'];
        return $suffixes[array_rand($suffixes)];
    }

    private function generateSku(string $brand, string $type): string
    {
        $brandPrefix = Str::upper(substr(preg_replace('/[^A-Za-z0-9]/', '', $brand) ?: 'BRD', 0, 3));
        $typePrefix = Str::upper(substr(preg_replace('/[^A-Za-z0-9]/', '', $type) ?: 'TP', 0, 2));
        $prefix = sprintf('%s-%s', str_pad($brandPrefix, 3, 'X'), str_pad($typePrefix, 2, 'X'));

        $nextNumber = ($this->generatedSkus[$prefix] ?? 0) + 1;
        $this->generatedSkus[$prefix] = $nextNumber;

        return sprintf('%s%04d', $prefix, $nextNumber);
    }

    private function generateSkuFromName(string $name): string
    {
        $words = explode(' ', $name);
        $prefix = '';
        foreach ($words as $word) {
            $prefix .= strtoupper(substr($word, 0, 1));
            if (strlen($prefix) >= 3) {
                break;
            }
        }

        $prefix = str_pad($prefix, 3, 'X');
        $nextNumber = ($this->generatedSkus[$prefix] ?? 0) + 1;
        $this->generatedSkus[$prefix] = $nextNumber;

        return sprintf('%s-%05d', $prefix, $nextNumber);
    }

    private function ensureUniqueSku(string $sku): string
    {
        if (! ProductVariant::query()->where('sku', $sku)->exists()) {
            return $sku;
        }

        $suffix = 2;
        $candidate = sprintf('%s-%d', $sku, $suffix);

        while (ProductVariant::query()->where('sku', $candidate)->exists()) {
            $suffix++;
            $candidate = sprintf('%s-%d', $sku, $suffix);
        }

        return $candidate;
    }

    private function attachVariantAttributes(string $productType, ProductVariant $variant, array $variantConfig): void
    {
        $assignments = isset($variantConfig['attributes']) && is_array($variantConfig['attributes'])
            ? $variantConfig['attributes']
            : $this->resolveVariantAttributeAssignments($productType, (string) $variantConfig['name']);

        foreach ($assignments as $attributeSlug => $valueLabel) {
            $attributeId = $this->attributes[$attributeSlug] ?? null;
            $attributeValueId = $this->attributeValues[$attributeSlug][$this->normalizeAttributeValueKey($valueLabel)] ?? null;

            if (! $attributeId || ! $attributeValueId) {
                continue;
            }

            VariantAttributeValue::query()->create([
                'variant_id' => $variant->id,
                'attribute_id' => $attributeId,
                'attribute_value_id' => $attributeValueId,
            ]);
        }
    }

    private function resolveVariantAttributeAssignments(string $productType, string $variantName): array
    {
        if (in_array($variantName, ['Czarny', 'Bialy'], true)) {
            return ['color' => $variantName];
        }

        if (preg_match('/^(\d+GB)(?: \+ etui)?$/', $variantName, $matches) === 1) {
            $assignments = ['storage' => $matches[1]];

            if (str_contains($variantName, '+ etui')) {
                $assignments['bundle'] = 'Etui';
            }

            return $assignments;
        }

        if (in_array($variantName, ['Wi-Fi', 'Wi-Fi + 5G'], true)) {
            return ['connectivity' => $variantName];
        }

        if (in_array($variantName, ['41mm', '45mm'], true)) {
            return ['case-size' => $variantName];
        }

        if (in_array($variantName, ['Wersja podstawowa', 'Wersja z montazem', 'Z regulacja wysokosci'], true)) {
            return ['service-package' => $variantName];
        }

        if ($variantName === 'Z Windows 11') {
            return ['software-package' => 'Z Windows 11'];
        }

        if (in_array($variantName, ['Soundbar', 'Zestaw z subwooferem', 'Zestaw 5.1', 'Starter Kit', 'Single', 'Z dodatkowym kontrolerem'], true)) {
            return ['bundle' => $variantName];
        }

        if (in_array($variantName, ['Wersja XL', 'RGB', 'Digital Edition', 'Deluxe Edition'], true)) {
            return ['edition' => $variantName];
        }

        if (in_array($variantName, ['Body', 'Z obiektywem kit', 'Box', 'Tray'], true)) {
            return ['package-type' => $variantName];
        }

        if ($variantName === 'Standard') {
            return match ($productType) {
                'Laptop' => ['software-package' => 'Standard'],
                'Monitor', 'Telewizor' => ['service-package' => 'Standard'],
                'Glownik Bluetooth', 'Klawiatura', 'Mysz', 'Konsole do gier', 'Gra' => ['edition' => 'Standard'],
                default => [],
            };
        }

        return [];
    }

    private function normalizeAttributeValueKey(string $value): string
    {
        return Str::lower(trim($value));
    }

    private function buildStorageColorVariants(
        string $brand,
        string $skuType,
        int $basePrice,
        array $storageOptions,
        array $colorOptions,
    ): array {
        $variants = [];

        foreach ($storageOptions as $storage) {
            foreach ($colorOptions as $color) {
                $variants[] = [
                    'name' => sprintf('%dGB / %s', $storage, $color),
                    'price' => $basePrice + $this->storagePriceDelta($storage),
                    'sku' => $this->generateSku($brand, $skuType),
                    'attributes' => [
                        'storage' => sprintf('%dGB', $storage),
                        'color' => $color,
                    ],
                ];
            }
        }

        return $variants;
    }

    private function buildTabletVariants(string $brand, int $basePrice, array $storageOptions): array
    {
        $variants = [];

        foreach ($storageOptions as $storage) {
            foreach (['Wi-Fi', 'Wi-Fi + 5G'] as $connectivity) {
                $variants[] = [
                    'name' => sprintf('%dGB / %s', $storage, $connectivity),
                    'price' => $basePrice + $this->storagePriceDelta($storage) + ($connectivity === 'Wi-Fi + 5G' ? 500 : 0),
                    'sku' => $this->generateSku($brand, 'TB'),
                    'attributes' => [
                        'storage' => sprintf('%dGB', $storage),
                        'connectivity' => $connectivity,
                    ],
                ];
            }
        }

        return $variants;
    }

    private function buildWatchVariants(string $brand, int $basePrice, array $colors): array
    {
        $variants = [];

        foreach ([41, 45] as $size) {
            foreach ($colors as $color) {
                $variants[] = [
                    'name' => sprintf('%dmm / %s', $size, $color),
                    'price' => $basePrice + ($size === 45 ? 200 : 0),
                    'sku' => $this->generateSku($brand, 'WT'),
                    'attributes' => [
                        'case-size' => sprintf('%dmm', $size),
                        'color' => $color,
                    ],
                ];
            }
        }

        return $variants;
    }

    private function getPhoneColors(string $brand): array
    {
        return match (Str::lower($brand)) {
            'apple' => ['Czarny', 'Bialy', 'Czerwony'],
            'samsung' => ['Czarny', 'Zielony', 'Zolty'],
            'xiaomi', 'oppo', 'realme' => ['Czarny', 'Niebieski', 'Zielony'],
            default => ['Czarny', 'Bialy', 'Niebieski'],
        };
    }

    private function storagePriceDelta(int $storage): int
    {
        return match ($storage) {
            256 => 300,
            512 => 800,
            1024 => 1400,
            default => 0,
        };
    }

    private function generateSoundbarModel(): string
    {
        $models = ['S1', 'S2', 'S3', 'B550', 'B650', 'B750', 'C450', 'C550', 'C650', 'Arc', 'Beam', 'Compact'];
        return $models[array_rand($models)];
    }

    private function generateHeadphoneModel(): string
    {
        $models = ['WH-1000XM5', 'WF-1000XM5', 'WH-CH720N', 'Momentum 4', 'HD 560S', 'AirPods Max', 'AirPods Pro 2', 'Galaxy Buds2 Pro', 'QuietComfort Ultra', 'Major V'];
        return $models[array_rand($models)];
    }

    private function generateSpeakerModel(): string
    {
        $models = ['X2', 'X3', 'Flip 5', 'Flip 6', 'Boom 3', 'Megaboom 3', 'Charge 5', 'Pulse 5', 'SoundLink Flex', 'HomePod mini', 'Era 100', 'Era 300'];
        return $models[array_rand($models)];
    }

    private function generateSmartphoneModel(string $brand): string
    {
        $models15 = ['15 Pro', '15 Pro Max', '15', '15 Plus'];
        $models24 = ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24'];
        $modelsXiaomi = ['14 Ultra', '14 Pro', '14', '13 Ultra'];
        $modelsPixel = ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a'];
        $modelsOther = ['Find X7 Pro', 'Nord 3', 'Edge 40', 'G100', 'X6 Pro', 'C55'];

        $models = match ($brand) {
            'Apple' => $models15,
            'Samsung' => $models24,
            'Xiaomi' => $modelsXiaomi,
            'Google' => $modelsPixel,
            default => $modelsOther,
        };

        return $models[array_rand($models)];
    }

    private function generateTabletModel(string $brand): string
    {
        $models = ['Pro 11"', 'Air 11"', '10.9"', 'Tab S9', 'Tab S8', 'Pad 6', 'MatePad 11', 'iPad 10.9"'];
        return $models[array_rand($models)];
    }

    private function generateWatchModel(): string
    {
        $models = ['Series 9', 'Ultra 2', 'Galaxy Watch 6', 'Galaxy Watch 5', 'Watch GT 4', 'Fenix 7', 'Versa 4', 'Band 8', 'Galaxy Watch 6 Classic'];
        return $models[array_rand($models)];
    }

    private function generateMonitorModel(): string
    {
        $models = ['Odyssey G7', 'Odyssey G9', 'UltraGear 27"', 'UltraGear 34"', 'ProArt PA278QV', 'TUF Gaming VG279QM', 'Predator XB273U', 'AOC 27G2'];
        return $models[array_rand($models)];
    }

    private function generateComponentModel(string $type): string
    {
        $cpuIntel = ['Core i9-14900K', 'Core i9-14900', 'Core i7-14700K', 'Core i7-14700', 'Core i5-14600K', 'Core i5-14600'];
        $cpuAmd = ['Ryzen 9 7950X', 'Ryzen 9 7900X', 'Ryzen 7 7800X3D', 'Ryzen 7 7700X', 'Ryzen 5 7600X', 'Ryzen 5 7600'];
        $gpuNvidia = ['RTX 5090', 'RTX 5080', 'RTX 4070 Ti SUPER', 'RTX 4070 SUPER', 'RTX 4070', 'RTX 4060 Ti', 'RTX 4060'];
        $gpuAmd = ['RX 9070 XT', 'RX 9070', 'RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7700 XT', 'RX 7600 XT'];
        $ssd = ['990 PRO 2TB', '990 PRO 1TB', 'SN850X 2TB', 'SN850X 1TB', 'P5 Plus 2TB', 'A770 2TB'];
        $ram = ['Vengeance DDR5 32GB', 'Trident Z5 RGB 32GB', 'Fury Beast 32GB', 'Dominator Platinum 32GB'];

        return match ($type) {
            'Procesory' => (rand(0, 1) ? $cpuIntel : $cpuAmd)[array_rand($cpuIntel)],
            'Karty graficzne' => (rand(0, 1) ? $gpuNvidia : $gpuAmd)[array_rand($gpuNvidia)],
            'Dyski SSD' => $ssd[array_rand($ssd)],
            'Pamiec RAM' => $ram[array_rand($ram)],
            default => 'Model ' . rand(100, 999),
        };
    }

    private function generatePeripheralModel(): string
    {
        $keyboards = ['MX Keys', 'MX Mechanical', 'K380', 'K860', 'G915', 'BlackWidow V4', 'Apex Pro', 'Spectre K780'];
        $mice = ['MX Master 3S', 'G Pro X Superlight', 'DeathAdder V3', 'G502 X', 'Model O', 'Razer Viper', 'IntelliMouse'];

        $list = rand(0, 1) ? $keyboards : $mice;
        return $list[array_rand($list)];
    }

    private function generateGameTitle(): string
    {
        $titles = [
            'Elden Ring', 'Baldur Gate 3', 'Starfield', 'Cyberpunk 2077', 'The Witcher 3',
            'Final Fantasy XVI', 'Resident Evil 4', 'Spider-Man 2', 'God of War Ragnarok',
            'Horizon Forbidden West', 'Zelda Tears of the Kingdom', 'Mario Kart 8',
            'FIFA 24', 'Mortal Kombat 1', 'Call of Duty Modern Warfare 3',
            'Assassin Creed Mirage', 'Far Cry 6', 'Just Cause 4', 'Hitman 3',
            'Forza Horizon 5', 'Flight Simulator 2024', 'Halo Infinite',
            'Diablo IV', 'Destiny 2', 'Apex Legends', 'Fortnite', 'Minecraft',
        ];
        return $titles[array_rand($titles)];
    }

    private function generateApplianceModel(): string
    {
        $models = ['WW80T', 'WW70T', 'WW60T', 'WW50T', 'F3', 'F5', 'F7', 'SERIE 6', 'SERIE 8', 'iQ300', 'iQ500', 'iQ700'];
        return $models[array_rand($models)];
    }

    private function generateSmallApplianceModel(): string
    {
        $models = ['EP2224', 'EP3241', 'ECAM', 'ES8', 'X903', 'X683', 'V11', 'V15', 'S8', 'Pro 3', 'LatteGo', 'GranBarista'];
        return $models[array_rand($models)];
    }

    private function generateCameraModel(): string
    {
        $models = ['EOS R5', 'EOS R6 Mark II', 'EOS R8', 'Z8', 'Z6 III', 'A7 IV', 'A7C II', 'A6700', 'X-T5', 'X-H2S', 'GH5 II', 'Hero 12 Black', 'Osmo Pocket 3', 'Pocket 3', 'Action 4'];
        return $models[array_rand($models)];
    }

    private function generateLensModel(): string
    {
        $models = ['24-70mm f/2.8', '70-200mm f/2.8', '50mm f/1.4', '85mm f/1.4', '35mm f/1.4', '24-105mm f/4', '100-400mm f/4.5-5.6', '16-35mm f/2.8', '50mm f/1.2', '135mm f/1.8'];
        return $models[array_rand($models)];
    }

    private function generateAccessoryModel(): string
    {
        $models = ['055', '055XPRO3', 'MT055CXPRO4', 'Peak Design 30L', 'ProTactic 450', 'Lowepro ProTactic', 'Extreme Pro 256GB', 'Extreme 512GB', 'AD600', 'V1', 'Master Hoya 77mm', 'Kenko 67mm'];
        return $models[array_rand($models)];
    }

    private function generateSmartHomeModel(): string
    {
        $models = ['Nest Hub', 'Echo Show', 'HomePod', 'Hub M2', 'Motion P2', 'Mini Switch', 'Hue Bridge', 'Hue Play', 'Video Doorbell', 'Pro S350', 'Roborock S8', 'Deebot T20'];
        return $models[array_rand($models)];
    }

    private function generateDescription(string $productName): string
    {
        return 'Wysokiej jakosci ' . $productName . '. Najnowsza technologia, innowacyjne rozwiazania i niezrownana wydajnosc. Idealny wybor dla wymagajacych uzytkownikow. Gwarancja jakosci i niezawodnosci przez dlugie lata uzytkowania.';
    }

    private function getRandomStorage(): int
    {
        $storages = [64, 128, 256, 512, 1024];
        return $storages[array_rand($storages)];
    }

    private function getRandomRam(): int
    {
        $rams = [8, 16, 32, 64];
        return $rams[array_rand($rams)];
    }
}
