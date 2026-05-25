<?php

declare(strict_types=1);

use App\Models\CmsMedia;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    Storage::fake((string) config('media-library.disk_name', 'public'));
});

/**
 * @param  array<string, mixed>  $customProperties
 */
function createSearchMedia(UploadedFile $file, array $customProperties = []): Media
{
    return CmsMedia::query()
        ->create()
        ->addMedia($file)
        ->withCustomProperties(array_merge([
            'alt' => '',
            'caption' => '',
            'description' => '',
            'author' => '',
        ], $customProperties))
        ->toMediaCollection('default');
}

it('returns RTE media metadata in search results', function (): void {
    $media = createSearchMedia(
        UploadedFile::fake()->image('hero.jpg', 800, 600),
        [
            'alt' => 'Hero alt',
            'caption' => 'Hero caption',
            'description' => 'Hero description',
            'author' => 'Editorial team',
            'width' => 800,
            'height' => 600,
        ],
    );

    actingAs($this->admin)
        ->getJson(route('admin.media.search', ['search' => 'hero']))
        ->assertOk()
        ->assertJsonPath('data.0.id', $media->id)
        ->assertJsonPath('data.0.url', $media->getUrl())
        ->assertJsonPath('data.0.alt', 'Hero alt')
        ->assertJsonPath('data.0.caption', 'Hero caption')
        ->assertJsonPath('data.0.description', 'Hero description')
        ->assertJsonPath('data.0.credit', 'Editorial team')
        ->assertJsonPath('data.0.width', 800)
        ->assertJsonPath('data.0.height', 600)
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'name',
                    'file_name',
                    'mime_type',
                    'size',
                    'url',
                    'thumb_url',
                    'thumbnail_url',
                    'alt',
                    'caption',
                    'description',
                    'credit',
                    'width',
                    'height',
                    'created_at',
                ],
            ],
        ]);
});

it('filters media search results by mime type policy', function (): void {
    createSearchMedia(UploadedFile::fake()->image('photo.jpg'));
    $pdf = createSearchMedia(UploadedFile::fake()->create('manual.pdf', 64, 'application/pdf'));

    actingAs($this->admin)
        ->getJson(route('admin.media.search', ['mime_types' => [$pdf->mime_type]]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.id', $pdf->id)
        ->assertJsonPath('data.0.mime_type', $pdf->mime_type);
});

it('sorts media search results by name and size', function (): void {
    $small = createSearchMedia(UploadedFile::fake()->create('alpha.pdf', 16, 'application/pdf'));
    $large = createSearchMedia(UploadedFile::fake()->create('zulu.pdf', 64, 'application/pdf'));
    $small->forceFill(['size' => 16])->save();
    $large->forceFill(['size' => 64])->save();

    actingAs($this->admin)
        ->getJson(route('admin.media.search', ['sort' => 'name_asc']))
        ->assertOk()
        ->assertJsonPath('data.0.id', $small->id)
        ->assertJsonPath('data.1.id', $large->id);

    actingAs($this->admin)
        ->getJson(route('admin.media.search', ['sort' => 'size_desc']))
        ->assertOk()
        ->assertJsonPath('data.0.id', $large->id)
        ->assertJsonPath('data.1.id', $small->id);
});
