namespace pxsim {

    export class CMButtonState extends CommonButtonState {

        constructor() {
            super();
            
            this.buttons = [
                new CommonButton(DAL.DEVICE_ID_BUTTON_A),
                new CommonButton(DAL.DEVICE_ID_BUTTON_B),
                // new CommonButton(DAL.BUTTON_ID_DOWN),
                // new CommonButton(DAL.BUTTON_ID_RIGHT),
                // new CommonButton(DAL.BUTTON_ID_LEFT),
                // new CommonButton(DAL.BUTTON_ID_ESCAPE)
            ];
            // let data = new Uint8Array(this.buttons.length)
            // MMapMethods.register("/dev/lms_ui", {
            //     data,
            //     beforeMemRead: () => {
            //         for (let i = 0; i < this.buttons.length; ++i)
            //             data[i] = this.buttons[i].isPressed() ? 1 : 0
            //     },
            //     read: buf => {
            //         let v = "vSIM"
            //         for (let i = 0; i < buf.data.length; ++i)
            //             buf.data[i] = v.charCodeAt(i) || 0
            //         return buf.data.length
            //     },
            //     write: buf => {
            //         //pxsim.output.setLights(buf.data[0] - 48)
            //         return 2
            //     }
            // })
        }
    }
}