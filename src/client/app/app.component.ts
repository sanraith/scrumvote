import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'vote-scrum';

    constructor(private router: Router, public userService: UserService) {
        // If the user have not set their username, go there first.
        router.events.subscribe(evt => {
            if (evt instanceof NavigationEnd && evt.urlAfterRedirects !== '/user') {
                this.redirectIfNoUserNameIsSet();
            }
        });
    }

    ngOnInit(): void { }

    private redirectIfNoUserNameIsSet(): void {
        if (!this.userService.userData.isNamePersonalized) {
            this.router.navigate(['user']);
        }
    }
}
