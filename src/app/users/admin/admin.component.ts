import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";

import { User } from '../user.model';
import { UsersService } from '../users.service';
import { AuthService } from "src/app/auth/auth.service";
import { DialogComponent } from "../dialog/dialog.component";

@Component({
  selector: 'app-users-list',
  templateUrl: 'admin.component.html',
  styleUrls: [ 'admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  isLoading = false;
  users: User[] = [];
  totalUsers = 10;
  usersPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [ 1, 2, 5, 10 ]
  userIsAuthenticated = false;
  userId: string;
  private usersSub: Subscription;
  private authStatusSub: Subscription;

  constructor(
    public usersService: UsersService,
    private authService: AuthService,
    private dialog: MatDialog
    ) { }

  ngOnInit() {
    this.isLoading = true;
    this.usersService.getUsers(this.usersPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.usersSub = this.usersService.getUsersUpdatedListener()
      .subscribe((userData: { users: User [], usersCount: number }) => {
        this.isLoading = false;
        this.totalUsers = userData.usersCount
        this.users = userData.users;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService.getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId();
        });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.usersPerPage = pageData.pageSize
    this.usersService.getUsers(this.usersPerPage, this.currentPage);
  }

  onDelete(userId: string) {
    //this.isLoading = true;
    this.dialog.open(DialogComponent, { data: {message: `Do you want to delete this user?`, userId: userId, usersPerPage: this.usersPerPage, currentPage: this.currentPage}})
    /*
    this.usersService.deleteUser(userId).subscribe(() => {
      this.usersService.getUsers(this.usersPerPage, this.currentPage)
    }, () => {
      this.isLoading = false;
    });
    */
  }

  ngOnDestroy() {
    this.usersSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
