<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreCongeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isAdmin = Auth::user()?->role === 'admin';

        return [
            'employee_id' => $isAdmin ? 'required|exists:employees,id' : 'prohibited',
            'type_conge'  => 'required|string|max:255',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after_or_equal:date_debut',
            'motif'       => 'nullable|string|max:255',
            'statut'      => 'in:en_attente,approuve,refuse',
            'commentaire' => 'nullable|string',
        ];
    }
}
