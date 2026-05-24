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

function createCropMedia(UploadedFile $file): Media
{
    return CmsMedia::query()
        ->create()
        ->addMedia($file)
        ->withCustomProperties([
            'alt' => 'Original alt',
            'caption' => 'Original caption',
            'description' => 'Original description',
            'author' => 'Original author',
        ])
        ->toMediaCollection('default');
}

it('validates crop parameters', function (): void {
    $media = createCropMedia(UploadedFile::fake()->image('hero.jpg', 800, 600));

    actingAs($this->admin)
        ->postJson(route('admin.media.crop', $media), [
            'x' => 0,
            'y' => 0,
            'width' => 0,
            'height' => 100,
            'rotate' => 45,
            'zoom' => 4,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['width', 'rotate', 'zoom']);
});

it('rejects non-image media', function (): void {
    $media = createCropMedia(UploadedFile::fake()->create('manual.pdf', 64, 'application/pdf'));

    actingAs($this->admin)
        ->postJson(route('admin.media.crop', $media), [
            'x' => 0,
            'y' => 0,
            'width' => 100,
            'height' => 100,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['media']);
});

it('creates a cropped media variant with crop metadata and focal point', function (): void {
    $media = createCropMedia(UploadedFile::fake()->image('hero.jpg', 800, 600));

    $response = actingAs($this->admin)
        ->postJson(route('admin.media.crop', $media), [
            'x' => 50,
            'y' => 40,
            'width' => 300,
            'height' => 200,
            'rotate' => 0,
            'zoom' => 1.5,
            'aspect_ratio' => '3:2',
            'focal_point' => [
                'x' => 42,
                'y' => 58,
            ],
        ])
        ->assertOk()
        ->assertJsonPath('crop_of', $media->id)
        ->assertJsonPath('width', 300)
        ->assertJsonPath('height', 200)
        ->assertJsonPath('crop_variant', '3_2')
        ->assertJsonPath('crop_params.x', 50)
        ->assertJsonPath('crop_params.y', 40)
        ->assertJsonPath('crop_params.width', 300)
        ->assertJsonPath('crop_params.height', 200)
        ->assertJsonPath('crop_params.zoom', 1.5)
        ->assertJsonPath('focal_point.x', 42)
        ->assertJsonPath('focal_point.y', 58);

    $newMedia = Media::query()->findOrFail($response->json('id'));

    expect($newMedia->getCustomProperty('crop_of'))->toBe((string) $media->id)
        ->and($newMedia->getCustomProperty('crop_variant'))->toBe('3_2')
        ->and($newMedia->getCustomProperty('crop_params'))->toMatchArray([
            'x' => 50,
            'y' => 40,
            'width' => 300,
            'height' => 200,
            'rotate' => 0,
            'zoom' => 1.5,
            'aspect_ratio' => '3:2',
            'variant' => '3_2',
        ])
        ->and($newMedia->getCustomProperty('width'))->toBe(300)
        ->and($newMedia->getCustomProperty('height'))->toBe(200);

    expect($media->refresh()->getCustomProperty('focal_point'))->toMatchArray([
        'x' => 42,
        'y' => 58,
    ]);

    actingAs($this->admin)
        ->getJson(route('admin.media.search', ['search' => 'hero']))
        ->assertOk()
        ->assertJsonPath('data.0.crop_variants.0.id', $newMedia->id)
        ->assertJsonPath('data.0.crop_variants.0.variant', '3_2')
        ->assertJsonPath('data.0.crop_variants.0.width', 300)
        ->assertJsonPath('data.0.crop_variants.0.height', 200);
});
