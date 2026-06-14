<?php

namespace App\Providers;

use App\Models\Absence;
use App\Models\Affectation;
use App\Models\Conge;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\Projet;
use App\Policies\AbsencePolicy;
use App\Policies\AffectationPolicy;
use App\Policies\CongePolicy;
use App\Policies\EmployeePolicy;
use App\Policies\NotificationPolicy;
use App\Policies\ProjetPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    

    public function register(): void
    {
        
    }

    

    public function boot(): void
    {
        Gate::policy(Employee::class, EmployeePolicy::class);
        Gate::policy(Projet::class, ProjetPolicy::class);
        Gate::policy(Affectation::class, AffectationPolicy::class);
        Gate::policy(Absence::class, AbsencePolicy::class);
        Gate::policy(Conge::class, CongePolicy::class);
        Gate::policy(Notification::class, NotificationPolicy::class);

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
