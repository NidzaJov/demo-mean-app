import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UsersService } from "../users.service";

@Component({
  templateUrl: './dialog.component.html'
})
export class DialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {message: string, userId: string, usersPerPage: number, currentPage: number},
    public usersService: UsersService) {}

  public isLoading = false;

  OnDeletionConfirmed(userId: string, usersPerPage: number, currentPage: number) {
    this.isLoading = true
    this.usersService.deleteUser(userId).subscribe(() => {
      this.usersService.getUsers(usersPerPage, currentPage)
    }, );

  }
}
