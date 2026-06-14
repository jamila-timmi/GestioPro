<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\Notification;
use App\Http\Requests\StoreAffectationRequest;
use App\Http\Requests\UpdateAffectationRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class AffectationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $listeAffectations = Affectation::with(['employee.user', 'projet'])
                ->orderBy('date_debut', 'desc')
                ->get();
        } else {
            $listeAffectations = Affectation::with(['employee.user', 'projet'])
                ->where('employee_id', $user->employee?->id)
                ->orderBy('date_debut', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $listeAffectations,
        ], 200);
    }

    public function store(StoreAffectationRequest $request)
    {
        if (Gate::denies('create', Affectation::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $nouvelleAffectation = Affectation::create($request->all());
        $nouvelleAffectation->load(['employee.user', 'projet']);

        Notification::sendToUser(
            $nouvelleAffectation->employee?->user,
            'affectation',
            'Nouvelle affectation',
            'Vous avez été affecté au projet ' . ($nouvelleAffectation->projet->nom ?? '') . '.',
            ['path' => '/affectations', 'affectation_id' => $nouvelleAffectation->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Affectation créée avec succès.',
            'data'    => $nouvelleAffectation,
        ], 201);
    }

    public function show(string $id)
    {
        $affectation = Affectation::with(['employee.user', 'projet'])->find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.',
            ], 404);
        }

        if (Gate::denies('view', $affectation)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $affectation,
        ], 200);
    }

    public function update(UpdateAffectationRequest $request, string $id)
    {
        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.',
            ], 404);
        }

        if (Gate::denies('update', $affectation)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $donneesModification = $request->validated();
        $affectation->update($donneesModification);

        return response()->json([
            'success' => true,
            'message' => 'Affectation modifiée avec succès.',
            'data'    => $affectation->load(['employee.user', 'projet']),
        ], 200);
    }

    public function destroy(string $id)
    {
        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'success' => false,
                'message' => 'Affectation non trouvée.',
            ], 404);
        }

        if (Gate::denies('delete', $affectation)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $affectation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Affectation supprimée avec succès.',
        ], 200);
    }
}
