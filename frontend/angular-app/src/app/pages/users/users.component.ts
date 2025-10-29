import { Component, OnInit, inject, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

type User = { email: string; nome: string; isAdmin: boolean; managerEmail?: string | null };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <h2 style="margin:0;">Usuários</h2>
      <button (click)="goNew()">Novo usuário</button>
    </div>

    <p *ngIf="loading" style="color:var(--muted)" class="mt-24">Carregando...</p>
    <p *ngIf="err" class="err mt-24">{{err}}</p>

    <div class="table-wrap mt-24" *ngIf="!loading && users.length; else vazio">
      <table>
        <thead>
          <tr>
            <th>Email</th><th>Nome</th><th>Admin</th><th>Gerente</th><th style="width:220px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{u.email}}</td>
            <td>{{u.nome}}</td>
            <td>{{u.isAdmin ? 'Sim' : 'Não'}}</td>
            <td>{{u.managerEmail || '-'}}</td>
            <td>
              <div class="actions">
                <button class="ghost" (click)="toggleAdmin(u)">{{ u.isAdmin ? 'Remover admin' : 'Promover a admin' }}</button>
                <button class="danger" (click)="remove(u.email)">Remover</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ng-template #vazio>
      <p *ngIf="!loading && !err" style="color:var(--muted);margin-top:18px;">Nenhum usuário cadastrado.</p>
    </ng-template>
  </div>
  `
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  users: User[] = [];
  loading = false;
  err = '';

  ngOnInit() {
    // Reage ao estado admin; carrega só no browser
    effect(() => {
      if (!this.isBrowser) return;
      const can = this.auth.isAdminSig();
      if (can) this.load();
      else { this.users = []; this.loading = false; }
    });

    if (this.isBrowser && this.auth.isAdminSig()) this.load();
  }

  private load() {
    this.err = '';
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (list)=> { this.users = list; this.loading = false; },
      error: (e)=> { this.err = e?.error || 'Erro ao carregar usuários.'; this.loading = false; }
    });
  }

  goNew(){ this.router.navigate(['/users/new']); }

  toggleAdmin(u: User){
    const body = { nome: u.nome, isAdmin: !u.isAdmin, managerEmail: u.managerEmail ?? null };
    this.http.put(`${environment.apiUrl}/users/${encodeURIComponent(u.email)}`, body)
      .subscribe({ next: ()=> this.load() });
  }

  remove(email: string){
    this.http.delete(`${environment.apiUrl}/users/${encodeURIComponent(email)}`)
      .subscribe({ next: ()=> this.load() });
  }
}
