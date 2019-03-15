import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from '../login-screen/login-screen.component';
import { ApplicationComponent } from '../application/application.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { WebServicesComponent } from '../web-services/web-services.component';

export const routes: Routes = [
  { path: '', component: LoginScreenComponent },
  { path: 'application', component: ApplicationComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'web-services', component: WebServicesComponent }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
