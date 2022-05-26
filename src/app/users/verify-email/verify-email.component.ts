import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { UsersService } from '../users.service'

enum EmailStatus {
    Verifying,
    Failed
}

@Component({ templateUrl: 'verify-email.component.html' })
export class VerifyEmailComponent implements OnInit {
    EmailStatus = EmailStatus;
    emailStatus = EmailStatus.Verifying;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private usersService: UsersService,
    ) { }

    ngOnInit() {
      const token = this.route.snapshot.queryParams['token'];

        // remove token from url to prevent http referer leakage
      this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

      this.usersService.verifyEmail(token)
        .subscribe(
          () => {
            this.router.navigate(['/auth/login']);
            },
          error => {
            this.emailStatus = EmailStatus.Failed
          }
        )
    }
}
