import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

type User = { email: string; nome: string; isAdmin: boolean; managerEmail: string | null };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="card">
    <div class="row between center-v">
      <h2 style="margin:0">Usuários</h2>
      <a routerLink="/users/new" class="secondary" *ngIf="auth.isAdmin()">Novo usuário</a>
    </div>

    <div class="mt-8" *ngIf="!auth.isAdmin()">
      <p class="err">Acesso restrito a administradores.</p>
    </div>

    <div class="mt-8" *ngIf="auth.isAdmin()">
      <p *ngIf="loading" style="color:var(--muted)">Carregando...</p>
      <p *ngIf="err" class="err">{{err}}</p>

      <table *ngIf="!loading && users.length" class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Papel</th>
            <th>Manager</th>
            <th style="width:180px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{ u.nome }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.isAdmin ? 'Admin' : 'User' }}</td>
            <td>{{ u.managerEmail || '—' }}</td>
            <td class="row" style="gap:8px">
              <a [routerLink]="['/users/new']" [queryParams]="{ email: u.email }" class="secondary">Editar</a>
              <button class="ghost" (click)="remove(u.email)">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && !users.length && !err" class="empty">
        Nenhum usuário encontrado.
      </div>

      <div class="mt-8">
        <button class="ghost" (click)="reload()">Recarregar</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .row{display:flex;gap:12px}
    .between{justify-content:space-between}
    .center-v{align-items:center}
    .table{width:100%; border-collapse:collapse; margin-top:12px}
    .table th, .table td{border-bottom:1px solid #eee; padding:10px}
    .empty{color:var(--muted); margin-top:12px}
  `]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  users: User[] = [];
  loading = false;
  err = '';

  ngOnInit(): void {
    if (this.isBrowser && this.auth.isAdmin()) {
      this.load();
    }
  }

  reload(){ this.load(); }

  private load(){
    this.err=''; this.loading = true;

    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: list => {
        // ajuda a depurar no console
        console.log('GET /users OK:', list);
        this.users = list ?? [];
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        // Mostra a causa real para você ver na tela
        const status = e?.status;
        const body = typeof e?.error === 'string' ? e.error : (e?.error?.message ?? '');
        this.err = status ? `Erro ${status} ao carregar usuários. ${body}` : 'Não foi possível carregar usuários.';
        console.error('GET /users ERRO:', e);
      }
    });
  }

  remove(email: string){
    if (!confirm('Remover este usuário?')) return;
    this.http.delete(`${environment.apiUrl}/users/${encodeURIComponent(email)}`).subscribe({
      next: () => { this.users = this.users.filter(u => u.email !== email); },
      error: (e) => {
        console.error('DELETE /users erro:', e);
        alert('Não foi possível remover.');
      }
    });
  }
}
