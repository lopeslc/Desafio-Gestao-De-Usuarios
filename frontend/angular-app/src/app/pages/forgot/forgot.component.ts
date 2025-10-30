import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="center" style="min-height: calc(100dvh - 70px);">
    <div class="card w-400">
      <h2 style="margin-top:0">Esqueci minha senha</h2>
      <p style="color:var(--muted)">
        Informe seu e-mail. Em desenvolvimento, o token de redefinição será impresso no console do servidor .NET.
      </p>

      <form (ngSubmit)="send()">
        <label>Email</label>
        <input [(ngModel)]="email" name="email" type="email" required />
        <div class="actions">
          <button type="submit" [disabled]="loading">{{ loading ? 'Enviando...' : 'Enviar' }}</button>
          <a routerLink="/login" class="ghost" style="padding:10px 14px;border-radius:10px;text-decoration:none;">Voltar</a>
        </div>
      </form>

      <p *ngIf="ok" class="mt-24" style="color:var(--muted)">
        Se o e-mail existir, enviaremos instruções. (Em DEV, veja o token no console do backend.)
      </p>
      <p *ngIf="err" class="err mt-24">{{err}}</p>
    </div>
  </div>
  `
})
export class ForgotComponent {
  email = '';
  loading = false;
  ok = false;
  err = '';

  constructor(private http: HttpClient) {}

  send() {
    if (this.loading) return;
    this.err = ''; this.ok = false; this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/forgot`, { email: this.email }).subscribe({
      next: () => { this.ok = true; this.loading = false; },
      error: () => { this.err = 'Não foi possível processar. Tente novamente.'; this.loading = false; }
    });
  }
}
