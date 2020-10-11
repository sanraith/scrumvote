import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-username',
    templateUrl: './username.component.html',
    styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit {
    userName: string;

    constructor(private userService: UserService) {
        this.userName = this.userService.userData.name;
    }

    ngOnInit(): void { }

    submit(): void {
        this.userService.userData.name = this.userName;
        this.userService.userData.isNamePersonalized = true;
        this.userService.save();
    }
}
