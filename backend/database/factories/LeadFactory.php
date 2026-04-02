<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->boolean(70) ? $this->faker->unique()->safeEmail() : null,
            'phone' => $this->faker->boolean(80) ? $this->faker->phoneNumber() : null,
            'source' => $this->faker->randomElement([
                'facebook',
                'whatsapp',
                'website',
                'manual',
            ]),
            'stage' => $this->faker->randomElement([
                'new',
                'contacted',
                'follow_up',
                'assigned',
                'converted',
                'lost',
            ]),
            'assigned_to' => $this->faker->boolean(40)
                ? User::query()->inRandomOrder()->value('id')
                : null,
            'notes' => $this->faker->boolean(70) ? $this->faker->sentence() : null,
            'metadata' => [
                'imported' => $this->faker->boolean(),
                'tag' => $this->faker->word(),
            ],
        ];
    }
}