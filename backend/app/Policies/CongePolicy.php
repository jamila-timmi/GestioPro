<?php

namespace App\Policies;

use App\Models\Conge;
use App\Models\User;

class CongePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Conge $conge): bool
    {
        return $user->role === 'admin'
            || $conge->employee_id === $user->employee?->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Conge $conge): bool
    {
        return $user->role === 'admin'
            || $conge->employee_id === $user->employee?->id;
    }

    public function validate(User $user, Conge $conge): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Conge $conge): bool
    {
        return $user->role === 'admin';
    }
}
