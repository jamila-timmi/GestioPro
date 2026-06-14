<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjetSeeder extends Seeder
{
    


    public function run(): void
    {
        DB::table('projets')->insert([
            [
                'nom' => 'Application de Gestion',
                'description' => 'Développement d’une application web Laravel',
                'date_debut' => '2026-01-10',
                'date_fin' => '2026-06-30',
                'statut' => 'en_cours',
                'budget' => 50000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Site E-commerce',
                'description' => 'Création d’une plateforme e-commerce',
                'date_debut' => '2026-02-01',
                'date_fin' => '2026-08-15',
                'statut' => 'suspendu',
                'budget' => 75000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Application Mobile',
                'description' => 'Développement mobile Flutter',
                'date_debut' => '2025-03-05',
                'date_fin' => '2026-01-20',
                'statut' => 'termine',
                'budget' => 120000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}