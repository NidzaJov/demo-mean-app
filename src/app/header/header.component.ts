import { Component, OnDestroy, OnInit } from "@angular/core"
import { Subscription } from "rxjs";

import { AuthService } from "../auth/auth.service";
import { User } from "../users/user.model";
import { UsersService } from "../users/users.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  private userIdSubs: Subscription;
  private roleSubs: Subscription;

  public userId: string;
  public role: string;
  public user : User

  constructor(private authService: AuthService, private usersService : UsersService) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
    });
    this.userId = this.authService.userIdValue;
    this.role = this.authService.roleValue;
    this.authService.role.subscribe(role => {
      this.role = role;
    });
    this.authService.userIdObs.subscribe(userId => {
      this.userId = userId;
    })

  }

  onLogout() {
    this.authService.logout();
    this.userId = null;
    this.role = null;
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.userIdSubs.unsubscribe();
    this.roleSubs.unsubscribe();
  }

}
