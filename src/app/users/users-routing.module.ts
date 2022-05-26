import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserCreateComponent } from "./users-create/user-create.component";
import { AdminComponent } from "./admin/admin.component";
import { AuthGuard } from "../auth/auth.guard";
import { VerifyEmailComponent } from "./verify-email/verify-email.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

const routes: Routes = [
  { path: 'edit/:userId', component: UserCreateComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { roles: ["Admin"]} },
  { path: 'create', component: UserCreateComponent, canActivate: [AuthGuard], data: { roles: ["Admin"]} },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class UsersRoutingModule {

}

