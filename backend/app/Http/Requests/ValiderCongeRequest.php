<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ValiderCongeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'statut'      => 'required|in:approuve,refuse',
            'commentaire' => 'nullable|string',
        ];
    }
}
