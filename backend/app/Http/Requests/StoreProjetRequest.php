<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut'  => 'required|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
            'statut'      => 'required|in:en_cours,termine,suspendu',
            'budget'      => 'nullable|numeric|min:0',
        ];
    }
}
