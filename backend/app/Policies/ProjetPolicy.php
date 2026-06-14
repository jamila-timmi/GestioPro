<?php

namespace App\Policies;

use App\Models\Projet;
use App\Models\User;

class ProjetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Projet $projet): bool
    {
        return $user->role === 'admin'
            || $projet->affectations->contains('employee_id', $user->employee_id);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Projet $projet): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Projet $projet): bool
    {
        return $user->role === 'admin';
    }
}
