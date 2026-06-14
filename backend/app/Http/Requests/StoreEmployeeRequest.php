<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricule'      => 'required|string|unique:employees,matricule',
            'nom'            => 'required|string|max:255',
            'prenom'         => 'required|string|max:255',
            'cin'            => 'required|string|unique:employees,cin',
            'date_naissance' => 'required|date',
            'date_embauche'  => 'required|date',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:6',
            'poste'          => 'required|string|max:255',
            'departement'    => 'required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'required|in:actif,inactif',
            'avatar'         => 'nullable|image|max:2048',
        ];
    }
}
