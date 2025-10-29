import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MeComponent } from './pages/me/me.component';
import { UsersComponent } from './pages/users/users.component';
import { UserFormComponent } from './pages/users/user-form.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'me', component: MeComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
  { path: 'users/new', component: UserFormComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
