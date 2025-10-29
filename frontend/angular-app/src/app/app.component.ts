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
    <div class="wrap">
      <a class="brand" routerLink="/login">⚙️ Projeto GDU</a>
      <div>
        <!-- Mostra "Login" só quando NÃO autenticado -->
        <a routerLink="/login" *ngIf="!auth.isAuth()">Login</a>

        <!-- Mostra estes quando autenticado -->
        <a routerLink="/me" *ngIf="auth.isAuth()">Meu Perfil</a>
        <a routerLink="/users" *ngIf="auth.isAdminSig()">Usuários</a>

        <!-- Botão sair só quando autenticado -->
        <a href (click)="sair($event)" *ngIf="auth.isAuth()">Sair</a>
      </div>
    </div>
  </nav>

  <div class="container">
    <router-outlet></router-outlet>
  </div>
`,
styles: []

})
export class AppComponent {
  constructor(public auth: AuthService) {}
  sair(e: Event) { e.preventDefault(); this.auth.logout(); }
}
