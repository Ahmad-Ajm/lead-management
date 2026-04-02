<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        $existing = Lead::count();

        if ($existing >= 50) {
            return;
        }

        $faker = \Faker\Factory::create();

        $userId = User::query()->value('id');

        $sources = ['facebook', 'whatsapp', 'website', 'manual'];
        $stages = ['new', 'contacted', 'follow_up', 'assigned', 'converted', 'lost'];

        for ($i = 0; $i < (50 - $existing); $i++) {
            Lead::create([
                'name' => $faker->name(),
                'email' => $faker->boolean(70) ? $faker->unique()->safeEmail() : null,
                'phone' => $faker->boolean(80) ? $faker->phoneNumber() : null,
                'source' => $faker->randomElement($sources),
                'stage' => $faker->randomElement($stages),
                'assigned_to' => $faker->boolean(40) ? $userId : null,
                'notes' => $faker->boolean(70) ? $faker->sentence() : null,
                'metadata' => [
                    'imported' => $faker->boolean(),
                    'tag' => $faker->word(),
                ],
            ]);
        }
    }
}