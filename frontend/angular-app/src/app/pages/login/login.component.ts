import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
 template: `
  <div class="center" style="min-height: calc(100dvh - 70px);">
    <div class="card w-400">
      <h2 style="margin:0 0 10px 0;">Login</h2>
      <p style="margin:0 0 18px 0;color:var(--muted)">Entre com suas credenciais</p>

      <form (ngSubmit)="onSubmit()">
        <div>
          <label>Email</label>
          <input [(ngModel)]="email" name="email" type="email" required (input)="err=''" />
        </div>
        <div>
          <label>Senha</label>
          <input [(ngModel)]="senha" name="senha" type="password" required (input)="err=''" />
        </div>

        <div class="actions">
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
          <a routerLink="/forgot" class="ghost" style="padding:10px 14px; border-radius:10px; text-decoration:none;">
            Esqueci minha senha
          </a>
        </div>
      </form>

      <p *ngIf="err" class="err mt-24">{{err}}</p>
    </div>
  </div>
`,
  styles: []
})
export class LoginComponent {
  email = '';
  senha = '';
  err = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loading) return;       // evita duplo submit
    this.err = '';
    this.loading = true;

    this.auth.login(this.email, this.senha).subscribe({
      next: r => {
        this.auth.setToken(r.token);
        this.router.navigate(['/me']);
      },
      error: () => {
        this.err = 'Credenciais inválidas';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
