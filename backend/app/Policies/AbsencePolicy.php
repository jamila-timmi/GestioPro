<?php

namespace App\Policies;

use App\Models\Absence;
use App\Models\User;

class AbsencePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Absence $absence): bool
    {
        return $user->role === 'admin'
            || $absence->employee_id === $user->employee?->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Absence $absence): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Absence $absence): bool
    {
        return $user->role === 'admin';
    }
}
