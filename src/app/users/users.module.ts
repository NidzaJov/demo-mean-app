import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { AngularMaterialModule } from "../angular-material.module";

import { UserCreateComponent } from './users-create/user-create.component';
import { AdminComponent } from "./admin/admin.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

@NgModule({
  declarations: [
    UserCreateComponent,
    AdminComponent,
    ForgotPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ]
})
export class UsersModule {}
