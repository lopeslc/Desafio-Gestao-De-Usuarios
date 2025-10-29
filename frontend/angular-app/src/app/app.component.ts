import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
    <nav class="nav">
      <a routerLink="/login">Login</a>
      <a routerLink="/me" *ngIf="auth.isAuthenticated()">Meu Perfil</a>
      <a routerLink="/users" *ngIf="auth.isAdmin()">Usuários</a>
      <a href (click)="sair($event)" *ngIf="auth.isAuthenticated()">Sair</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles:[`.nav{display:flex;gap:12px;padding:12px;border-bottom:1px solid #ddd}`]
})
export class AppComponent {
  constructor(public auth: AuthService){}
  sair(e: Event){ e.preventDefault(); this.auth.logout(); }
}
