<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
   

    public function login(LoginRequest $request)
    {

        $email = strtolower(trim((string) $request->email));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion reussie',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Deconnexion reussie',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('employee'));
    }
}
