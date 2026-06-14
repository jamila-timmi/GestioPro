<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;




class UserFactory extends Factory
{
    


    protected static ?string $password;

    




    public function definition(): array
    {
        return [
        'name' => $this->faker->name(),
        'email' => $this->faker->unique()->safeEmail(),
        'password' => Hash::make('password'), 
        'role' => 'employe',
        ];
    }

    


    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
