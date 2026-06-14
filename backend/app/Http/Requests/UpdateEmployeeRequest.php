<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('employee');

        
        $employee = \App\Models\Employee::find($id);

        return [
            'matricule'      => 'sometimes|required|string|unique:employees,matricule,' . $id,
            'nom'            => 'sometimes|required|string|max:255',
            'prenom'         => 'sometimes|required|string|max:255',
            'cin'            => 'sometimes|required|string|unique:employees,cin,' . $id,
            'date_naissance' => 'sometimes|required|date',
            'date_embauche'  => 'sometimes|required|date',
            'poste'          => 'sometimes|required|string|max:255',
            'departement'    => 'sometimes|required|string|max:255',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string',
            'statut'         => 'sometimes|required|in:actif,inactif',
            'email'          => [
                'sometimes', 'required', 'email',
                Rule::unique('users', 'email')->ignore($employee?->user_id),
            ],
            'password'       => 'nullable|string|min:6',
            'avatar'         => 'nullable|image|max:2048',
        ];
    }
}
