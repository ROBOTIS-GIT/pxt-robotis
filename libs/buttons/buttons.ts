// const enum ButtonEvent {
//     //% block="LongClick"
//     Long_Click = 4,
//     //% block="Click"
//     _Click = 3,
//     //% block="Down"
//     _Down = 1,
// }

namespace event {
    // let nextComponentId: number;

    // //% fixedInstances
    // export class Button {
    //     protected _id: number
    //     private downTime: number;
    //     private _isPressed: boolean;
    //     private _wasPressed: boolean;

    //     id() {
    //         return this._id;
    //     }

    //     protected poke() {

    //     }

    //     constructor(id = 0) {
    //         if (!nextComponentId)
    //             nextComponentId = 20000;
    //         if (!id) id = ++nextComponentId;
    //         this._id = id

    //         this.downTime = 0;
    //         this._isPressed = false;
    //         this._wasPressed = false;
    //     }

    //     //% hidden
    //     _update(curr: boolean) {
    //         if (this == null) return;
    //         if(this._isPressed == curr) return;
    //         this._isPressed = curr;
    //         if(curr){
    //             this._wasPressed = true;
    //             this.downTime = control.millis();
    //             control.raiseEvent(this._id, ButtonEvent.Long_Click);
    //         } else {
    //             control.raiseEvent(this._id, ButtonEvent._Click);
    //             const delta = control.millis() - this.downTime;
    //             if(delta < 500)
    //                 control.raiseEvent(this._id, ButtonEvent._Down)
    //         }
    //     }

    //     /**
    //      *  Check if button is currently pressed or not.
    //      *  @param button the button to query the request
    //      */
    //     //% block="button|is pressed"
    //     //% blockId=buttonIsPressed
    //     //% parts="event"
    //     //% blockNamespace=event
    //     //% weight=81
    //     isPressed() {
    //         this.poke();
    //         return this._isPressed;
    //     }

    //     /**
    //      *  See if the button was pressed again since the last time you checked.
    //      *  @param button the button to query the request
    //      */
    //     //% block="%button|was pressed"
    //     //% blockId=buttonWasPressed
    //     //% blockHidden=true
    //     //% parts="event"
    //     //% blockNamespace=event
    //     //% weight=80
    //     wasPressed() {
    //         this.poke();
    //         const r = this._wasPressed;
    //         this._wasPressed = false;
    //         return r;
    //     }

    //     /**
    //      * Do something when a button or sensor is clicked, up or down
    //      * @param button the button that needs to be clicked or used
    //      * @param event the kind of button gesture that needs to be detected
    //      * @param body code to run when the event is raised
    //      */
    //     //% blockId=buttonEvent block="on %button|%event"
    //     //% parts="event"
    //     //% blockNamespace=event
    //     //% weight=99 blockGap=16
    //     onEvent(ev: ButtonEvent, body: () => void) {
    //         control.onEvent(this._id, ev, body)
    //     }


    //     /**
    //      * Waits until ehe event is raised
    //      * @param ev the event to wait for
    //      */
    //     //% blockId=buttonWaitUntil block="pause until %button|%event"
    //     //% parts="event"
    //     //% blockNamespace=event
    //     pauseUntil(ev: ButtonEvent) {
    //         control.waitForEvent(this._id, ev);
    //     }

    // }
}