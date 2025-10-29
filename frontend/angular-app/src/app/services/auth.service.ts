import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

type LoginResp = { token: string };
type JwtPayload = { exp?: number; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ---- estado reativo (Signals) ----
  isAuth = signal<boolean>(false);
  isAdminSig = signal<boolean>(false);

  constructor(private http: HttpClient) {
    // hidrata estado a partir do storage (reload de página etc.)
    this.recomputeFromToken(this.getToken());
  }

  // --------- API ----------
  login(email: string, senha: string) {
    return this.http.post<LoginResp>(`${environment.apiUrl}/auth/login`, { email, senha });
  }

  setToken(token: string) {
    if (this.isBrowser) localStorage.setItem(this.TOKEN_KEY, token);
    this.recomputeFromToken(token);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    if (this.isBrowser) localStorage.removeItem(this.TOKEN_KEY);
    this.recomputeFromToken(null);
  }

  // ---- compat (se quiser manter chamadas antigas) ----
  isAuthenticated(): boolean { return this.isAuth(); }
  isAdmin(): boolean { return this.isAdminSig(); }

  // --------- helpers ----------
  private recomputeFromToken(token: string | null) {
    if (!token) {
      this.isAuth.set(false);
      this.isAdminSig.set(false);
      return;
    }
    try {
      const p = jwtDecode<JwtPayload & Record<string, any>>(token);
      const now = Math.floor(Date.now() / 1000);
      const valid = !!p.exp && p.exp > now;

      const role =
        p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        p['role'];

      this.isAuth.set(valid);
      this.isAdminSig.set(valid && role === 'Admin');
    } catch {
      this.isAuth.set(false);
      this.isAdminSig.set(false);
    }
  }
}
