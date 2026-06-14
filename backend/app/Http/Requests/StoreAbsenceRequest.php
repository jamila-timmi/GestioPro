<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'           => 'required|exists:employees,id',
            'date_absence'          => 'required|date',
            'motif'                 => 'nullable|string',
            'justifiee'             => 'boolean',
            'fichier_justification' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
    }
}
