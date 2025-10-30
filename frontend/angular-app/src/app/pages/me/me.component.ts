import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface MeResponse {
  email: string;
  nome: string;
  isAdmin: boolean;
  managerEmail: string | null;
}

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="center" style="min-height: calc(100dvh - 70px); padding: 24px;">
    <div class="card w-600">
      <!-- TÍTULO -->
      <div class="row between center-v mb-16">
        <h2 style="margin:0">Meu Perfil</h2>
        <span class="badge" [class.badge-admin]="me?.isAdmin" [class.badge-user]="!me?.isAdmin">
          {{ me?.isAdmin ? 'Admin' : 'User' }}
        </span>
      </div>

      <!-- SSR fallback -->
      <ng-container *ngIf="isBrowser; else noSSR">

        <!-- ESTADOS -->
        <p *ngIf="!auth.isAuthenticated()" style="color:var(--muted)">
          Faça login para ver seu perfil.
        </p>

        <div *ngIf="loading" class="skeleton-wrap">
          <div class="skeleton avatar"></div>
          <div class="col" style="gap:8px; flex:1">
            <div class="skeleton line w-60"></div>
            <div class="skeleton line w-40"></div>
            <div class="skeleton line w-30"></div>
          </div>
        </div>

        <p *ngIf="err && !loading" class="err">{{ err }}</p>

        <!-- DADOS -->
        <div *ngIf="me && !loading" class="row">
          <div class="avatar">{{ initials(me.nome) }}</div>

          <div class="col" style="gap:10px; flex:1">
            <div class="row center-v" style="gap:10px;">
              <h3 style="margin:0">{{ me.nome }}</h3>
            </div>

            <div class="grid">
              <div class="item">
                <label>Email</label>
                <p>{{ me.email }}</p>
              </div>

              <div class="item">
                <label>Papel</label>
                <p>{{ me.isAdmin ? 'Administrador' : 'Usuário' }}</p>
              </div>

              <div class="item">
                <label>Manager</label>
                <p>{{ me.managerEmail || '—' }}</p>
              </div>
            </div>

            <div class="actions mt-8">
              <a routerLink="/change-password" class="secondary">Trocar senha</a>
              <a routerLink="/users" class="secondary" *ngIf="me?.isAdmin">Gerenciar usuários</a>
              <button class="ghost" (click)="logout()">Sair</button>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #noSSR>
        <p style="color:var(--muted)">Carregando…</p>
      </ng-template>
    </div>
  </div>
  `,
  styles: [`
    .w-600{max-width:600px}
    .row{display:flex; gap:16px}
    .col{display:flex; flex-direction:column}
    .between{justify-content:space-between}
    .center-v{align-items:center}
    .mb-16{margin-bottom:16px}
    .mt-8{margin-top:8px}

    .avatar{
      width:72px;height:72px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:var(--surface-2,#f3f3f3); font-weight:700; font-size:20px; color:#555;
      flex-shrink:0;
    }

    .grid{
      display:grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap:12px;
    }
    @media (max-width:560px){ .grid{ grid-template-columns:1fr } }

    .item label{
      font-size:12px; color:var(--muted,#777);
    }
    .item p{ margin:2px 0 0 0; }

    .badge{
      padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600;
      border:1px solid #e6e6e6; background:#fafafa;
    }
    .badge-admin{ color:#0a7; border-color:#0a7; background:#eafff6; }
    .badge-user{ color:#06c; border-color:#06c; background:#eaf3ff; }

    .skeleton-wrap{display:flex; gap:16px; align-items:flex-start;}
    .skeleton{
      background: linear-gradient(90deg, #eee 25%, #f6f6f6 37%, #eee 63%);
      background-size:400% 100%;
      animation: shimmer 1.4s ease infinite;
      border-radius:10px;
    }
    .skeleton.avatar{width:72px;height:72px;border-radius:50%}
    .skeleton.line{height:14px}
    .skeleton.w-60{width:60%}
    .skeleton.w-40{width:40%}
    .skeleton.w-30{width:30%}
    @keyframes shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
  `]
})
export class MeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  me: MeResponse | null = null;
  loading = false;
  err = '';

  ngOnInit() {
    if (!this.isBrowser) return;

    if (this.auth.isAuthenticated()) {
      this.load();
    } else {
      this.me = null;
    }
  }

  private load() {
    this.err = '';
    this.loading = true;

    this.http.get<MeResponse>(`${environment.apiUrl}/me`).subscribe({
      next: (u) => { this.me = u; this.loading = false; },
      error: (e) => {
        this.err = typeof e?.error === 'string' && e.error ? e.error : 'Não foi possível carregar seu perfil.';
        this.loading = false;
      }
    });
  }

  logout(){
    this.auth.logout();
    // opcional: router.navigate(['/login']); o logout já faz redirect
  }

  initials(nome: string){
    if(!nome) return '??';
    const parts = nome.trim().split(/\s+/).slice(0,2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
  }
}
