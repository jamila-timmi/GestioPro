<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projet;
use App\Http\Requests\StoreProjetRequest;
use App\Http\Requests\UpdateProjetRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ProjetController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $requete = Projet::with('affectations.employee')->orderBy('date_debut', 'desc');

        if ($user->role !== 'admin') {
            $requete->whereHas('affectations', function ($sousRequete) use ($user) {
                $sousRequete->where('employee_id', $user->employee_id);
            });
        }

        return response()->json([
            'success' => true,
            'data'    => $requete->get(),
        ], 200);
    }

    public function store(StoreProjetRequest $request)
    {
        if (Gate::denies('create', Projet::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $nouveauProjet = Projet::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès.',
            'data'    => $nouveauProjet,
        ], 201);
    }

    public function show(string $id)
    {
        $projet = Projet::with('affectations.employee')->find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.',
            ], 404);
        }

        if (Gate::denies('view', $projet)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $projet,
        ], 200);
    }

    public function update(UpdateProjetRequest $request, string $id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.',
            ], 404);
        }

        if (Gate::denies('update', $projet)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $donneesProjet = $request->all();
        $projet->update($donneesProjet);

        return response()->json([
            'success' => true,
            'message' => 'Projet modifié avec succès.',
            'data'    => $projet,
        ], 200);
    }

    public function destroy(string $id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé.',
            ], 404);
        }

        if (Gate::denies('delete', $projet)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $projet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès.',
        ], 200);
    }
}
