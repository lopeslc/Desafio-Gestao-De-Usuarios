import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
  <header class="navbar">
    <div class="nav-left">
      <div class="logo">
        <span class="gear">⚙️</span>
        <span class="brand">Projeto GDU</span>
      </div>
    </div>

    <nav class="nav-right">
      <a routerLink="/login" *ngIf="!auth.isAuthenticated()">Login</a>
      <a routerLink="/me" *ngIf="auth.isAuthenticated()">Meu Perfil</a>
      <a routerLink="/users" *ngIf="auth.isAuthenticated() && auth.isAdmin()">Usuários</a>
      <a href (click)="logout($event)" *ngIf="auth.isAuthenticated()">Sair</a>
    </nav>
  </header>

  <main class="content">
    <router-outlet></router-outlet>
  </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; font-family: 'Inter', sans-serif; }

    .navbar {
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#1e1e1e;
      color:#fff;
      padding:12px 24px;
      box-shadow:0 2px 4px rgba(0,0,0,0.2);
    }

    .logo {
      display:flex;
      align-items:center;
      gap:8px;
      font-weight:600;
      font-size:18px;
    }

    .gear {
      font-size:22px;
      animation:spin 4s linear infinite;
    }

    @keyframes spin {
      from { transform:rotate(0deg); }
      to { transform:rotate(360deg); }
    }

    .brand {
      color:#00c896;
    }

    .nav-right a {
      color:#fff;
      text-decoration:none;
      margin-left:16px;
      font-weight:500;
      transition:opacity .2s;
    }

    .nav-right a:hover { opacity:0.8; }

    .content { padding:24px; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService){}

  logout(e: Event){
    e.preventDefault();
    this.auth.logout();
  }
}
