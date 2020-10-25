import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../services/user.service';
import { UiHelperService } from '../services/ui-helper.service';

@Component({
    selector: 'app-username',
    templateUrl: './username.component.html',
    styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit {
    userName: string;

    constructor(
        public uiHelper: UiHelperService,
        private userService: UserService,
        private location: Location) {
        this.userName = this.userService.userData.name;
    }

    ngOnInit(): void { }

    submit(): void {
        if (!this.userName || this.userName.length === 0) { return; }
        this.userService.userData.name = this.userName;
        this.userService.userData.isNamePersonalized = true;
        this.userService.save();
        this.location.back();
    }
}
