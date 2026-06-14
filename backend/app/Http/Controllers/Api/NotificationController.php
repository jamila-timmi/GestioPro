<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderByRaw('read_at is null desc')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $notifications->whereNull('read_at')->count(),
        ], 200);
    }

    public function markAsRead(string $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvee.',
            ], 404);
        }

        if (Gate::denies('update', $notification)) {
            return response()->json([
                'success' => false,
                'message' => 'Action non autorisee.',
            ], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => $notification,
        ], 200);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Notifications marquees comme lues.',
        ], 200);
    }
}
