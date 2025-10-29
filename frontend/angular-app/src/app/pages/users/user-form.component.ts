import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card w-400">
    <h2 style="margin-top:0;">Novo usuário</h2>
    <form (ngSubmit)="create()">
      <div>
        <label>Email</label>
        <input [(ngModel)]="email" name="email" required type="email" />
      </div>
      <div>
        <label>Nome</label>
        <input [(ngModel)]="nome" name="nome" required />
      </div>
      <div>
        <label>Senha</label>
        <input [(ngModel)]="senha" name="senha" required type="password" />
      </div>
      <div>
        <label>Admin?</label>
        <input type="checkbox" [(ngModel)]="isAdmin" name="isAdmin" />
      </div>
      <div>
        <label>Manager Email (opcional)</label>
        <input [(ngModel)]="managerEmail" name="managerEmail" />
      </div>

      <div class="actions">
        <button type="submit">Criar</button>
        <button class="ghost" type="button" (click)="back()">Voltar</button>
      </div>
    </form>

    <p *ngIf="err" class="err mt-24">{{err}}</p>
  </div>
  `,
  styles: []
})
export class UserFormComponent {
  email=''; nome=''; senha=''; isAdmin=false; managerEmail: string | null = null; err='';
  constructor(private http: HttpClient, private router: Router) {}
  create(){
    this.err='';
    const body = { email: this.email, nome: this.nome, senha: this.senha, isAdmin: this.isAdmin, managerEmail: this.managerEmail };
    this.http.post(`${environment.apiUrl}/auth/register`, body).subscribe({
      next: ()=> this.router.navigate(['/users']),
      error: (e)=> this.err = e?.error || 'Erro ao criar usuário'
    });
  }
  back(){ this.router.navigate(['/users']); }
}
