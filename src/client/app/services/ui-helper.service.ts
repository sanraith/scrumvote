import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiHelperService {
    constructor() { }

    onEnter(_this: any, event: any, onEnterFunc: () => void) {
        if (event.keyCode === 13) {
            onEnterFunc.apply(_this);
        }
    }
}
