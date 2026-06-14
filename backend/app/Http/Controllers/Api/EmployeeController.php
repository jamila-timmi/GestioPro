<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index()
    {
        if (Gate::denies('viewAny', Employee::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $listeEmployes = Employee::with('user')
            ->orderBy('nom')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $listeEmployes,
        ], 200);
    }
    public function store(StoreEmployeeRequest $request)
    {
        if (Gate::denies('create', Employee::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $cheminAvatar = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : null;

        $user = User::create([
            'name'     => $request->nom . ' ' . $request->prenom,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'role'     => 'employee',
            'avatar'   => $cheminAvatar,
        ]);

        $employe = Employee::create([
            'user_id'        => $user->id,
            'matricule'      => $request->matricule,
            'nom'            => $request->nom,
            'prenom'         => $request->prenom,
            'cin'            => $request->cin,
            'date_naissance' => $request->date_naissance,
            'date_embauche'  => $request->date_embauche,
            'poste'          => $request->poste,
            'departement'    => $request->departement,
            'telephone'      => $request->telephone,
            'adresse'        => $request->adresse,
            'statut'         => $request->statut,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employé créé avec succès.',
            'data'    => $employe->load('user'),
        ], 201);
    }

    public function show(string $id)
    {
        $employe = Employee::with(['user', 'absences', 'conges', 'affectations.projet'])->find($id);

        if (!$employe) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.',
            ], 404);
        }

        if (Gate::denies('view', $employe)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $employe,
        ], 200);
    }

    public function update(UpdateEmployeeRequest $request, string $id)
    {
        $employe = Employee::find($id);

        if (!$employe) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.',
            ], 404);
        }

        if (Gate::denies('update', $employe)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $donneesValidees = $request->validated();

        $employe->update(collect($donneesValidees)->except(['email', 'password', 'avatar'])->toArray());

        if ($employe->user) {
            $donneesUser = [];

            if (isset($donneesValidees['email'])) {
                $donneesUser['email'] = $donneesValidees['email'];
            }

            if (isset($donneesValidees['nom']) || isset($donneesValidees['prenom'])) {
                $donneesUser['name'] = trim(
                    ($donneesValidees['nom'] ?? $employe->nom) . ' ' .
                    ($donneesValidees['prenom'] ?? $employe->prenom)
                );
            }

            if (!empty($donneesValidees['password'])) {
                $donneesUser['password'] = Hash::make($donneesValidees['password']);
            }

            if ($request->hasFile('avatar')) {

                if ($employe->user->avatar) {
                    Storage::disk('public')->delete($employe->user->avatar);
                }
                $donneesUser['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            if ($donneesUser) {
                $employe->user->update($donneesUser);
            }
        }

        $employe->refresh()->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Employé modifié avec succès.',
            'data'    => $employe,
        ], 200);
    }

    public function destroy(string $id)
    {
        $employe = Employee::find($id);

        if (!$employe) {
            return response()->json([
                'success' => false,
                'message' => 'Employé non trouvé.',
            ], 404);
        }

        if (Gate::denies('delete', $employe)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $user = $employe->user;
        $employe->delete();

        if ($user) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Employé supprimé avec succès.',
        ], 200);
    }
}
