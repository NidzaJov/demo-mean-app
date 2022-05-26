import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../users.service';
import { mimeType } from "../../posts/post-create/mime-type.validator";
import { Role } from 'src/app/roles/role.model';
import { MustMatch } from '../../_helpers/must-match.validator';

@Component({
  selector: 'app-user-create',
  templateUrl: 'user-create.component.html',
  styleUrls: [ 'user-create.component.css']
 })
export class UserCreateComponent implements OnInit, OnDestroy{
  isLoading = false;
  email: string;
  password: string;
  oldPassword: string;
  newPassword1: string;
  newPassword2: string;
  firstName: string;
  lastName: string;
  imagePreview: string;
  imagePath: string;
  form: FormGroup;
  roleControl: FormControl
  public mode = 'create';
  private userId: string;
  private authStatusSub: Subscription;
  private roleSubs: Subscription;
  public currentRole: string;
  public roles: Role[] = [Role.Admin, Role.Regular]

  constructor(
      private usersService: UsersService,
      private authService: AuthService,
      public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
        .subscribe(authStatus => {
          this.isLoading = false;
        });
    this.currentRole = this.authService.roleValue;
    this.roleSubs = this.authService.role.subscribe(role => {
      this.currentRole = role;
    });
    this.form = new FormGroup({
      'email': new FormControl(null, {validators: [Validators.required]}),
      'firstName': new FormControl(null, {validators: [Validators.required]}),
      'lastName': new FormControl(null, { validators: [Validators.required]}),
      'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]}),
      'password': new FormControl('', { validators: [Validators.minLength(3)]}),
      'confirmPassword': new FormControl(''),
      roleControl: new FormControl(null, { validators: [Validators.required]})
    }, MustMatch)
    this.route.paramMap.subscribe((paramMap: ParamMap ) => {
      if (paramMap.has('userId')) {
        this.mode = 'edit';
        this.userId = paramMap.get('userId');
        this.isLoading = true;
        this.usersService.getUser(this.userId)
        .subscribe(user => {
          this.isLoading = false;
        this.form.setValue({
          'firstName': user.firstName?? '',
          'lastName': user.lastName?? '',
          'email': user.email,
          'password': '',
          'confirmPassword': '',
          'image': user.imagePath,
          roleControl: user.role
        });
        this.imagePath = user.imagePath;
        }
        )

      } else {
        this.mode = 'create';
        this.userId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = (reader.result as string);
    }
    reader.readAsDataURL(file);
  }

  onSaveUser() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.usersService.addUser(
        this.form.value.firstName,
        this.form.value.lastName,
        this.form.value.email,
        this.form.value.password,
        this.form.value.image,
        this.form.value.roleControl
        )
    } else {
      this.usersService.updateUser(
        this.userId,
        this.form.value.firstName,
        this.form.value.lastName,
        this.form.value.email,
        this.form.value.password,
        this.form.value.image,
        this.form.value.roleControl
      )
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.roleSubs.unsubscribe();
  }
}
