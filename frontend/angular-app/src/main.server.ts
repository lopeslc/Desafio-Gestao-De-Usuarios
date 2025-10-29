import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { provideZonelessChangeDetection } from '@angular/core'; // <-- aqui

export default function bootstrap(context: unknown) {
  return bootstrapApplication(
    AppComponent,
    {
      providers: [
        provideZonelessChangeDetection(),
        provideServerRendering(),
        provideRouter(routes),
        provideHttpClient(
          withInterceptors([authInterceptor]),
          withFetch()                         // <— aqui
        ),
      ],
    },
    context as any
  );
}
