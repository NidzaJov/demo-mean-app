import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(
    private authService: AuthService,
    private router: Router) {

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isAuth = this.authService.getIsAuth();
    if (!isAuth) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    const role = this.authService.roleValue;
    if (role) {
      if (route.data.roles && route.data.roles.indexOf(role) === -1) {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }

    return false;
    }
}
