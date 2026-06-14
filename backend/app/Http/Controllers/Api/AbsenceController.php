<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Notification;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class AbsenceController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $listeAbsences = Absence::with(['employee.user', 'enregistrePar'])
                ->orderBy('date_absence', 'desc')
                ->get();
        } else {
            $listeAbsences = Absence::with(['employee.user', 'enregistrePar'])
                ->where('employee_id', $user->employee?->id)
                ->orderBy('date_absence', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $listeAbsences,
        ], 200);
    }

    public function store(StoreAbsenceRequest $request)
    {
        $user = Auth::user();

        if (Gate::denies('create', Absence::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Seul un administrateur peut déclarer une absence.',
            ], 403);
        }

        $donneesAbsence = $request->all();
        $donneesAbsence['enregistre_par'] = $user->id;
        $donneesAbsence['justifiee']      = $request->boolean('justifiee');

        if ($donneesAbsence['justifiee'] && $request->hasFile('fichier_justification')) {
            $donneesAbsence['fichier_justification'] = $request
                ->file('fichier_justification')
                ->store('justificatifs', 'public');
        } else {
            $donneesAbsence['fichier_justification'] = null;
        }

        $absence = Absence::create($donneesAbsence)->load(['employee.user', 'enregistrePar']);

        Notification::sendToUser(
            $absence->employee?->user,
            'absence',
            'Absence enregistrée',
            'Une absence a été enregistrée dans votre dossier pour le ' . $absence->date_absence->format('d/m/Y') . '.',
            ['path' => '/absences', 'absence_id' => $absence->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Absence enregistrée avec succès.',
            'data'    => $absence,
        ], 201);
    }

    public function show(string $id)
    {
        $absence = Absence::with(['employee.user', 'enregistrePar'])->find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.',
            ], 404);
        }

        if (Gate::denies('view', $absence)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $absence,
        ], 200);
    }

    public function update(UpdateAbsenceRequest $request, string $id)
    {
        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.',
            ], 404);
        }

        if (Gate::denies('update', $absence)) {
            return response()->json([
                'success' => false,
                'message' => 'Seul un administrateur peut modifier une absence.',
            ], 403);
        }

        $donneesModification = $request->all();
        $donneesModification['justifiee'] = $request->boolean('justifiee');

        if (!$donneesModification['justifiee']) {
            if ($absence->fichier_justification) {
                Storage::disk('public')->delete($absence->fichier_justification);
            }
            $donneesModification['fichier_justification'] = null;

        } elseif ($request->hasFile('fichier_justification')) {

            if ($absence->fichier_justification) {
                Storage::disk('public')->delete($absence->fichier_justification);
            }
            $donneesModification['fichier_justification'] = $request
                ->file('fichier_justification')
                ->store('justificatifs', 'public');
        }

        $absence->update($donneesModification);

        return response()->json([
            'success' => true,
            'message' => 'Absence modifiée avec succès.',
            'data'    => $absence->load(['employee.user', 'enregistrePar']),
        ], 200);
    }

    public function destroy(string $id)
    {
        $absence = Absence::find($id);

        if (!$absence) {
            return response()->json([
                'success' => false,
                'message' => 'Absence non trouvée.',
            ], 404);
        }

        if (Gate::denies('delete', $absence)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisée.',
            ], 403);
        }

        if ($absence->fichier_justification) {
            Storage::disk('public')->delete($absence->fichier_justification);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimée avec succès.',
        ], 200);
    }
}
