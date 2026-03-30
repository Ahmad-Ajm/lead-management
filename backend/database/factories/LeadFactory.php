<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->boolean(70) ? fake()->unique()->safeEmail() : null,
            'phone' => fake()->boolean(80) ? fake()->phoneNumber() : null,
            'source' => fake()->randomElement([
                'facebook',
                'whatsapp',
                'website',
                'manual',
            ]),
            'stage' => fake()->randomElement([
                'new',
                'contacted',
                'follow_up',
                'assigned',
                'converted',
                'lost',
            ]),
            'assigned_to' => fake()->boolean(40)
                ? User::query()->inRandomOrder()->value('id')
                : null,
            'notes' => fake()->boolean(70) ? fake()->sentence() : null,
            'metadata' => [
                'imported' => fake()->boolean(),
                'tag' => fake()->word(),
            ],
        ];
    }
}