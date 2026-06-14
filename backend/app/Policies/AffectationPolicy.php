<?php

namespace App\Policies;

use App\Models\Affectation;
use App\Models\User;

class AffectationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Affectation $affectation): bool
    {
        return $user->role === 'admin'
            || $affectation->employee_id === $user->employee?->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Affectation $affectation): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Affectation $affectation): bool
    {
        return $user->role === 'admin';
    }
}
