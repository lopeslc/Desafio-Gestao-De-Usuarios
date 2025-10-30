import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MeComponent } from './pages/me/me.component';
import { UsersComponent } from './pages/users/users.component';
import { UserFormComponent } from './pages/users/user-form.component';
import { ForgotComponent } from './pages/forgot/forgot.component';
import { ResetComponent } from './pages/reset/reset.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },     // default: login
  { path: 'login', component: LoginComponent },
  { path: 'forgot', component: ForgotComponent },            // se quiser manter
  { path: 'reset', component: ResetComponent },              // se quiser manter

  { path: 'me', component: MeComponent, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },

  { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'login' },
];
