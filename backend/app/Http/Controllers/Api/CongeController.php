<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conge;
use App\Models\Notification;
use App\Http\Requests\StoreCongeRequest;
use App\Http\Requests\UpdateCongeRequest;
use App\Http\Requests\ValiderCongeRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class CongeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $requete = Conge::with('employee.user')->orderBy('date_debut', 'desc');

        if ($user->role !== 'admin') {
            $requete->where('employee_id', $user->employee?->id);
        }

        return response()->json([
            'success' => true,
            'data'    => $requete->get(),
        ], 200);
    }

    public function store(StoreCongeRequest $request)
    {
        $user = Auth::user();

        if (Gate::denies('create', Conge::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $donneesConge = $request->all();
        $donneesConge['statut'] = $donneesConge['statut'] ?? 'en_attente';

        if ($user->role !== 'admin') {
            if (!$user->employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun employé associé à ce compte.',
                ], 422);
            }
            $donneesConge['employee_id'] = $user->employee->id;
        }

        $conge = Conge::create($donneesConge)->load('employee.user');

        if ($user->role === 'admin') {
            Notification::sendToUser(
                $conge->employee?->user,
                'conge_admin',
                'Congé ajouté',
                'Un congé a été ajouté à votre dossier du ' . $conge->date_debut->format('d/m/Y') . ' au ' . $conge->date_fin->format('d/m/Y') . '.',
                ['path' => '/conges', 'conge_id' => $conge->id]
            );
        } else {
            $nomEmploye = trim(($conge->employee->nom ?? '') . ' ' . ($conge->employee->prenom ?? ''));
            Notification::sendToAdmins(
                'conge_demande',
                'Nouvelle demande de congé',
                $nomEmploye . ' a envoyé une demande de congé du ' . $conge->date_debut->format('d/m/Y') . ' au ' . $conge->date_fin->format('d/m/Y') . '.',
                ['path' => '/conges', 'conge_id' => $conge->id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Congé créé avec succès.',
            'data'    => $conge,
        ], 201);
    }

    public function show(string $id)
    {
        $conge = Conge::with('employee.user')->find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.',
            ], 404);
        }

        if (Gate::denies('view', $conge)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $conge,
        ], 200);
    }

    public function update(UpdateCongeRequest $request, string $id)
    {
        $conge = Conge::with('employee.user')->find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.',
            ], 404);
        }

        if (Gate::denies('update', $conge)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $user = Auth::user();

        $ancienneDateDebut = $conge->date_debut?->toDateString();
        $ancienneDateFin   = $conge->date_fin?->toDateString();
        $ancienStatut      = $conge->statut;

        $donneesModification = $request->all();

        if ($user->role !== 'admin') {
            $donneesModification['employee_id'] = $user->employee?->id;
        } elseif ($request->filled('statut') && $request->statut !== $ancienStatut) {
            $donneesModification['validateur_id'] = Auth::id();
        }

        $conge->update($donneesModification);
        $conge->load('employee.user');

        if ($user->role === 'admin' && ($ancienneDateDebut !== $conge->date_debut?->toDateString() || $ancienneDateFin !== $conge->date_fin?->toDateString())) {
            Notification::sendToUser(
                $conge->employee?->user,
                'conge_modifie',
                'Durée du congé modifiée',
                'La période de votre congé a été modifiée : ' . $conge->date_debut->format('d/m/Y') . ' au ' . $conge->date_fin->format('d/m/Y') . '.',
                ['path' => '/conges', 'conge_id' => $conge->id]
            );
        }

        if ($user->role === 'admin' && $ancienStatut !== $conge->statut) {
            Notification::sendToUser(
                $conge->employee?->user,
                'conge_reponse',
                'Statut du congé modifié',
                'Votre demande de congé est maintenant : ' . ($conge->statut === 'approuve' ? 'approuvée' : ($conge->statut === 'refuse' ? 'refusée' : 'en attente')) . '.',
                ['path' => '/conges', 'conge_id' => $conge->id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Congé modifié avec succès.',
            'data'    => $conge,
        ], 200);
    }

    public function valider(ValiderCongeRequest $request, string $id)
    {
        $conge = Conge::with('employee.user')->find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.',
            ], 404);
        }

        if (Gate::denies('validate', $conge)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $conge->update([
            'statut'        => $request->statut,
            'validateur_id' => Auth::id(),
            'commentaire'   => $request->commentaire,
        ]);
        $conge->load('employee.user');

        Notification::sendToUser(
            $conge->employee?->user,
            'conge_reponse',
            'Réponse à votre demande de congé',
            'Votre demande de congé a été ' . ($request->statut === 'approuve' ? 'approuvée' : 'refusée') . '.',
            ['path' => '/conges', 'conge_id' => $conge->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Congé ' . $request->statut . ' avec succès.',
            'data'    => $conge,
        ], 200);
    }

    public function destroy(string $id)
    {
        $conge = Conge::find($id);

        if (!$conge) {
            return response()->json([
                'success' => false,
                'message' => 'Congé non trouvé.',
            ], 404);
        }

        if (Gate::denies('delete', $conge)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        $conge->delete();

        return response()->json([
            'success' => true,
            'message' => 'Congé supprimé avec succès.',
        ], 200);
    }
}
