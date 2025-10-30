import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="center" style="min-height: calc(100dvh - 70px);">
    <div class="card w-400">
      <h2 style="margin-top:0">Trocar senha</h2>
      <form (ngSubmit)="submit()">
        <label>Senha atual</label>
        <input [(ngModel)]="current" name="current" type="password" required />

        <label>Nova senha</label>
        <input [(ngModel)]="next" name="next" type="password" required />

        <label>Confirmar nova senha</label>
        <input [(ngModel)]="confirm" name="confirm" type="password" required />

        <div class="actions">
          <button type="submit" [disabled]="loading">{{ loading ? 'Salvando...' : 'Salvar' }}</button>
          <a routerLink="/me" class="ghost" style="padding:10px 14px;border-radius:10px;text-decoration:none;">Voltar</a>
        </div>
      </form>

      <p *ngIf="err" class="err mt-24">{{err}}</p>
      <p *ngIf="ok" class="mt-24" style="color:var(--muted)">Senha alterada com sucesso.</p>
    </div>
  </div>
  `
})
export class ChangePasswordComponent {
  current=''; next=''; confirm='';
  loading=false; err=''; ok=false;

  constructor(private http: HttpClient, private router: Router){}

  submit(){
    this.err=''; this.ok=false;
    if (this.next !== this.confirm) {
      this.err = 'Confirmação não confere.'; return;
    }
    this.loading = true;
    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      currentSenha: this.current,
      novaSenha: this.next
    }).subscribe({
      next: () => { this.loading=false; this.ok=true; this.current=this.next=this.confirm=''; },
      error: (e) => { this.loading=false; this.err = typeof e?.error === 'string' ? e.error : 'Não foi possível alterar a senha.'; }
    });
  }
}
