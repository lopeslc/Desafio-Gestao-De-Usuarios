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
  <div class="container">
    <h2>Login</h2>
    <form (ngSubmit)="onSubmit()">
      <label>Email</label>
      <input [(ngModel)]="email" name="email" type="email" required />

      <label>Senha</label>
      <input [(ngModel)]="senha" name="senha" type="password" required />

      <button type="submit">Entrar</button>
    </form>
    <p *ngIf="err" class="err">{{err}}</p>
  </div>
  `,
  styles:[`.container{max-width:360px;margin:40px auto;display:flex;flex-direction:column;gap:8px} input{padding:8px} .err{color:#c00}`]
})
export class LoginComponent {
  email=''; senha=''; err='';
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit(){
    this.err='';
    this.auth.login(this.email, this.senha).subscribe({
      next: r => { this.auth.setToken(r.token); this.router.navigate(['/me']); },
      error: () => this.err = 'Credenciais inválidas'
    });
  }
}
