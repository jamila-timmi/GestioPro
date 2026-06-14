<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    


    public function run(): void
    {
        

        
        
        
        
        $this->call(UserSeeder::class);

        $this->call(EmployeeSeeder::class);
        $this->call([ProjetSeeder::class,]);
        $this->call([
    EmployeeSeeder::class,
    CongeSeeder::class,
]);

    }
}