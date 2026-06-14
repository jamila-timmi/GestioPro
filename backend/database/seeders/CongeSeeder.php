<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conge;
use App\Models\Employee;
use App\Models\User;

class CongeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        
        $validateur = User::first();

        $conges = [

            [
                'type_conge' => 'annuel',
                'date_debut' => '2026-07-01',
                'date_fin' => '2026-07-10',
                'motif' => 'Vacances d’été',
                'statut' => 'approuve',
                'commentaire' => 'Congé validé',
            ],

            [
                'type_conge' => 'maladie',
                'date_debut' => '2026-03-15',
                'date_fin' => '2026-03-20',
                'motif' => 'Maladie temporaire',
                'statut' => 'en_attente',
                'commentaire' => null,
            ],

            [
                'type_conge' => 'sans_solde',
                'date_debut' => '2026-09-05',
                'date_fin' => '2026-09-12',
                'motif' => 'Voyage personnel',
                'statut' => 'refuse',
                'commentaire' => 'Période non disponible',
            ],

            [
                'type_conge' => 'maternite',
                'date_debut' => '2026-05-01',
                'date_fin' => '2026-08-01',
                'motif' => 'Congé maternité',
                'statut' => 'approuve',
                'commentaire' => 'Félicitations',
            ],
        ];

        foreach ($employees as $index => $employee) {

            $data = $conges[$index % count($conges)];

            Conge::create([
                'employee_id' => $employee->id,
                'type_conge' => $data['type_conge'],
                'date_debut' => $data['date_debut'],
                'date_fin' => $data['date_fin'],
                'motif' => $data['motif'],
                'statut' => $data['statut'],
                'validateur_id' => $validateur?->id,
                'commentaire' => $data['commentaire'],
            ]);
        }
    }
}