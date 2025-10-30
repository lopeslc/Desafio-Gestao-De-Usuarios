import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="center" style="min-height: calc(100dvh - 70px);">
    <div class="card w-400">
      <h2 style="margin-top:0">Redefinir senha</h2>
      <p style="color:var(--muted)">Cole aqui o token que recebeu (em DEV, está no console do servidor) e escolha a nova senha.</p>

      <form (ngSubmit)="submit()">
        <label>Token (GUID)</label>
        <input [(ngModel)]="token" name="token" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />

        <label>Nova senha</label>
        <input [(ngModel)]="novaSenha" name="novaSenha" type="password" required />

        <div class="actions">
          <button type="submit" [disabled]="loading">{{ loading ? 'Salvando...' : 'Redefinir' }}</button>
          <a routerLink="/login" class="ghost" style="padding:10px 14px; border-radius:10px; text-decoration:none;">Voltar</a>
        </div>
      </form>

      <p *ngIf="ok" class="mt-24" style="color:var(--muted)">Senha alterada com sucesso. Faça login novamente.</p>
      <p *ngIf="err" class="err mt-24">{{err}}</p>
    </div>
  </div>
  `
})
export class ResetComponent {
  token = '';
  novaSenha = '';
  loading = false;
  ok = false;
  err = '';

  constructor(private http: HttpClient, private router: Router) {}

  submit(){
    if (this.loading) return;
    this.err=''; this.ok=false; this.loading=true;

    this.http.post(`${environment.apiUrl}/auth/reset`, { token: this.token, novaSenha: this.novaSenha }).subscribe({
      next: () => { this.ok = true; this.loading = false; },
      error: (e) => { this.err = typeof e?.error === 'string' ? e.error : 'Token inválido ou expirado.'; this.loading = false; }
    });
  }
}
