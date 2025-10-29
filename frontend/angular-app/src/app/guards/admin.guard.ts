import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService), router = inject(Router);
  if (auth.isAuthenticated() && auth.isAdmin()) return true;
  router.navigate(['/me']); return false;
};
