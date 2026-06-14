<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [

            
            [
                'name' => 'Ahmed Dev',
                'email' => 'ahmed.dev@gmail.com',
                'matricule' => 'DEV001',
                'nom' => 'Ahmed',
                'prenom' => 'Alaoui',
                'cin' => 'AB12345',
                'poste' => 'developer',
                'departement' => 'IT',
            ],

            [
                'name' => 'Sara Dev',
                'email' => 'sara.dev@gmail.com',
                'matricule' => 'DEV002',
                'nom' => 'Sara',
                'prenom' => 'Bennani',
                'cin' => 'CD67890',
                'poste' => 'developer',
                'departement' => 'IT',
            ],

            [
                'name' => 'Youssef Dev',
                'email' => 'youssef.dev@gmail.com',
                'matricule' => 'DEV003',
                'nom' => 'Youssef',
                'prenom' => 'El Idrissi',
                'cin' => 'EF11223',
                'poste' => 'developer',
                'departement' => 'IT',
            ],

            [
                'name' => 'Imane Dev',
                'email' => 'imane.dev@gmail.com',
                'matricule' => 'DEV004',
                'nom' => 'Imane',
                'prenom' => 'Tazi',
                'cin' => 'GH44556',
                'poste' => 'developer',
                'departement' => 'IT',
            ],

            
            [
                'name' => 'Omar Design',
                'email' => 'omar.design@gmail.com',
                'matricule' => 'DES001',
                'nom' => 'Omar',
                'prenom' => 'Fassi',
                'cin' => 'IJ77889',
                'poste' => 'designer',
                'departement' => 'Design',
            ],

            [
                'name' => 'Nadia Design',
                'email' => 'nadia.design@gmail.com',
                'matricule' => 'DES002',
                'nom' => 'Nadia',
                'prenom' => 'Amrani',
                'cin' => 'KL99001',
                'poste' => 'designer',
                'departement' => 'Design',
            ],

            [
                'name' => 'Hamza Design',
                'email' => 'hamza.design@gmail.com',
                'matricule' => 'DES003',
                'nom' => 'Hamza',
                'prenom' => 'Mekouar',
                'cin' => 'MN22334',
                'poste' => 'designer',
                'departement' => 'Design',
            ],

            [
                'name' => 'Salma Design',
                'email' => 'salma.design@gmail.com',
                'matricule' => 'DES004',
                'nom' => 'Salma',
                'prenom' => 'Lahlou',
                'cin' => 'OP55667',
                'poste' => 'designer',
                'departement' => 'Design',
            ],

            
            [
                'name' => 'Khadija Assistante',
                'email' => 'khadija.assist@gmail.com',
                'matricule' => 'ASS001',
                'nom' => 'Khadija',
                'prenom' => 'Zerouali',
                'cin' => 'QR88990',
                'poste' => 'assistante',
                'departement' => 'Administration',
            ],

            
            [
                'name' => 'Mounir RH',
                'email' => 'mounir.rh@gmail.com',
                'matricule' => 'RH001',
                'nom' => 'Mounir',
                'prenom' => 'Benjelloun',
                'cin' => 'ST11224',
                'poste' => 'rh',
                'departement' => 'RH',
            ],
        ];

        foreach ($employees as $data) {

            
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'employee',
            ]);

            
            Employee::create([
                'user_id' => $user->id,
                'matricule' => $data['matricule'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'cin' => $data['cin'],
                'date_naissance' => '1998-01-01',
                'date_embauche' => now(),
                'poste' => $data['poste'],
                'departement' => $data['departement'],
                'telephone' => '0600000000',
                'adresse' => 'Fes, Maroc',
                'statut' => 'actif',
            ]);
        }
    }
}