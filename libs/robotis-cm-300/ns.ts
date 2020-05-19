enum JOYSTIC_DIRECTION {
    //% block="UP"
    UP,
    //% block="DOWN"
    DOWN,
    //% block="LEFT"
    LEFT,
    //% block="RIGHT"
    RIGHT,
    //% block="CENTER"
    CENTER
}

enum CONTROLLER_STATE {
    //% block="STATE1"
    STATE1,
    //% block="STATE2"
    STATE2
}

//% color="#68C3E2" weight=101
namespace event {
}
//% color="#C8509B" weight=100
namespace communication {
}

//% color="#D67923" weight=99
namespace output {
}

//% color="#5F3109" weight=98
//% groups='["LCD"]'
namespace input {
}

//% color="#EF2D56" weight=97
namespace lcd {
}

//% color="#011C32" weight=96 advanced=false
//% groups='["ROBOTIS"]'
namespace control {
}

//% groups='["ROBOTIS"]'
namespace loops {

}

//% groups='["ROBOTIS"]'
namespace logic {

     /**
     * This is a reporter block that returns a boolean
     */
    //% block="조이스틱이 %direction|인 상태"
    //% group="ROBOTIS"
    export function joysticDirection(direction: JOYSTIC_DIRECTION): boolean {
        return false;
    }

    /**
     * This is a reporter block that returns a boolean
     */
    //% block="제어기방향 %state|인 상태"
    //% group="ROBOTIS"
    export function controllerState(state: CONTROLLER_STATE): boolean {
        return false;
    }


}

