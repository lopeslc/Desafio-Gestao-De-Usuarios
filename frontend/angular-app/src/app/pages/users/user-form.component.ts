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
  <div class="container">
    <h2>Novo usuário</h2>
    <form (ngSubmit)="create()">
      <label>Email</label>
      <input [(ngModel)]="email" name="email" required type="email" />
      <label>Nome</label>
      <input [(ngModel)]="nome" name="nome" required />
      <label>Senha</label>
      <input [(ngModel)]="senha" name="senha" required type="password" />
      <label>Admin?</label>
      <input type="checkbox" [(ngModel)]="isAdmin" name="isAdmin" />
      <label>Manager Email (opcional)</label>
      <input [(ngModel)]="managerEmail" name="managerEmail" />
      <button type="submit">Criar</button>
      <button type="button" (click)="back()">Voltar</button>
    </form>
    <p *ngIf="err" class="err">{{err}}</p>
  </div>
  `,
  styles:[`.container{max-width:500px;margin:40px auto;display:flex;flex-direction:column;gap:8px} input{padding:8px} .err{color:#c00}`]
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
