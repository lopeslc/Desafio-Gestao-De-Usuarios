import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type User = { email: string; nome: string; isAdmin: boolean; managerEmail?: string | null };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container">
    <h2>Usuários</h2>
    <button (click)="goNew()">Novo usuário</button>
    <table *ngIf="users.length">
      <thead><tr><th>Email</th><th>Nome</th><th>Admin</th><th>Gerente</th><th>Ações</th></tr></thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{u.email}}</td>
          <td>{{u.nome}}</td>
          <td>{{u.isAdmin ? 'Sim' : 'Não'}}</td>
          <td>{{u.managerEmail || '-'}}</td>
          <td>
            <button (click)="toggleAdmin(u)">Toggle Admin</button>
            <button (click)="remove(u.email)">Remover</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles:[`.container{max-width:900px;margin:40px auto} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px}`]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(){ this.load(); }
  load(){ this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({ next: list => this.users = list }); }
  goNew(){ this.router.navigate(['/users/new']); }
  toggleAdmin(u: User){
    const body = { nome: u.nome, isAdmin: !u.isAdmin, managerEmail: u.managerEmail ?? null };
    this.http.put(`${environment.apiUrl}/users/${encodeURIComponent(u.email)}`, body).subscribe({ next:()=>this.load() });
  }
  remove(email: string){
    this.http.delete(`${environment.apiUrl}/users/${encodeURIComponent(email)}`).subscribe({ next:()=>this.load() });
  }
}
