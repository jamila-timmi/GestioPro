<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAffectationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'projet_id'   => 'required|exists:projets,id',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'role_projet' => 'required|string|max:255',
        ];
    }
}
