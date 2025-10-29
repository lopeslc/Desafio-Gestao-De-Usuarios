import { Component, OnInit, inject, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type User = { email: string; nome: string; isAdmin: boolean; managerEmail?: string | null };

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card">
    <h2 style="margin-top:0;">Meu perfil</h2>

    <ng-container *ngIf="isBrowser; else noSSR">
      <p *ngIf="!auth.isAuth()" style="color:var(--muted)">
        Faça login para ver seu perfil.
      </p>

      <p *ngIf="loading" style="color:var(--muted)">Carregando...</p>
      <p *ngIf="err" class="err">{{err}}</p>

      <div *ngIf="me && !loading">
        <p><b>Nome:</b> {{me.nome}}</p>
        <p><b>Email:</b> {{me.email}}</p>
        <p><b>Admin:</b> {{me.isAdmin ? 'Sim' : 'Não'}}</p>
      </div>

      <div class="actions mt-24" *ngIf="auth.isAuth() && !loading">
        <button class="secondary" (click)="goUsers()" *ngIf="isAdmin">Gerenciar usuários</button>
        <button class="ghost" (click)="logout()">Sair</button>
      </div>
    </ng-container>

    <ng-template #noSSR>
      <p style="color:var(--muted)">Carregando…</p>
    </ng-template>
  </div>
  `
})
export class MeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  me?: User;
  isAdmin = false;
  loading = false;
  err = '';

  ngOnInit() {
    // Reage ao login/logout (signals) e faz load só no browser
    effect(() => {
      if (!this.isBrowser) return;
      const authed = this.auth.isAuth();
      this.isAdmin = this.auth.isAdminSig();
      if (authed) this.load();
      else { this.me = undefined; this.loading = false; }
    });

    // Caso já esteja autenticado ao entrar
    if (this.isBrowser && this.auth.isAuth()) {
      this.isAdmin = this.auth.isAdminSig();
      this.load();
    }
  }

  private load() {
    this.err = '';
    this.loading = true;

    const token = this.auth.getToken();
    if (!token) { this.loading = false; return; }

    this.http.get<User>(`${environment.apiUrl}/me`).subscribe({
      next: (u) => { this.me = u; this.loading = false; },
      error: (e) => {
        this.err = typeof e?.error === 'string' && e.error ? e.error : 'Não foi possível carregar seu perfil.';
        this.loading = false;
      }
    });
  }

  goUsers(){ this.router.navigate(['/users']); }
  logout(){ this.auth.logout(); this.router.navigate(['/login']); }
}
