import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import jwtDecode from 'jwt-decode';

type LoginDto = { email: string; senha: string };
type LoginResp = { token: string };
type JwtPayload = { exp?: number; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {
    return this.http.post<LoginResp>(`${environment.apiUrl}/auth/login`, { email, senha });
  }

  setToken(token: string) { localStorage.setItem(this.TOKEN_KEY, token); }
  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  logout() { localStorage.removeItem(this.TOKEN_KEY); }

  isAuthenticated(): boolean {
    const t = this.getToken(); if (!t) return false;
    try {
      const p = jwtDecode<JwtPayload>(t);
      const now = Math.floor(Date.now() / 1000);
      return !!p.exp && p.exp > now;
    } catch { return false; }
  }

  isAdmin(): boolean {
    const t = this.getToken(); if (!t) return false;
    try {
      const p: any = jwtDecode(t);
      const role = p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? p['role'];
      return role === 'Admin';
    } catch { return false; }
  }
}
