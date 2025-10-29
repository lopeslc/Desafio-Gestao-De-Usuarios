import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  <div class="container">
    <h2>Meu perfil</h2>
    <div *ngIf="me">
      <p><b>Nome:</b> {{me.nome}}</p>
      <p><b>Email:</b> {{me.email}}</p>
      <p><b>Admin:</b> {{me.isAdmin ? 'Sim' : 'Não'}}</p>
    </div>
    <div class="actions">
      <button (click)="goUsers()" *ngIf="isAdmin">Gerenciar usuários</button>
      <button (click)="logout()">Sair</button>
    </div>
  </div>
  `,
  styles:[`.container{max-width:600px;margin:40px auto} .actions{display:flex;gap:8px}`]
})
export class MeComponent implements OnInit {
  me?: User; isAdmin=false;
  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}
  ngOnInit(){ this.isAdmin = this.auth.isAdmin(); this.http.get<User>(`${environment.apiUrl}/me`).subscribe({ next:u=>this.me=u }); }
  goUsers(){ this.router.navigate(['/users']); }
  logout(){ this.auth.logout(); this.router.navigate(['/login']); }
}
