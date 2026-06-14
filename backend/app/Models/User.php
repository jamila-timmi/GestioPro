<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'avatar',
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function employee()
    {
        return $this->hasOne(Employee::class, 'user_id');
    }

    public function congesValides()
    {
        return $this->hasMany(Conge::class, 'validateur_id');
    }

    public function absencesEnregistrees()
    {
        return $this->hasMany(Absence::class, 'enregistre_par');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function getEmployeeIdAttribute(): ?int
    {
        return $this->employee?->id;
    }
}
