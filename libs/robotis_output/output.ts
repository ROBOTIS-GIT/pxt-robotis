const enum MOTOR {
    //% block="1번모터"
    port1 ,
    //% block="2번모터"
    port2 ,
    //% block="모든모터"
    portAll 
}

enum MOTORMODE {
    //% block="바퀴모드"
    wheel,
    //% block="관절모드"
    joint
}

enum DIRECTION {
    //% block="전진"
    front,
    //% block="후진"
    rear,
    //% block="좌회전"
    left,
    //% block="우회전"
    right,
    //% block="정지"
    stop
}

enum CLOCKWISE {
    //% block="정방향"
    clockwise,
    //% block="역방향"
    counterclockwise
}

enum BUTTONTYPE {
    //% block="버튼A"
    buttonA,
    //% block="버튼B"
    buttonB,
    //% block="모든버튼"
    allButton,
}
enum ON_OFF {
    //% block="켜기"
    on,
    //% block="끄기"
    off
}

//% color="#D67923" weight=99
namespace output {
    
    /**
     * 선택한 번호/모든 모터 바퀴/관절 모드로 설정
     * @param motor motor port
     * @param mode  motor mode
     */
    //% blockId=set_motor_mode block="%motor %mode|로 설정"
    //% weight=1000
    //% blockGap=8
    export function setMotorMode(motor: MOTOR, mode: MOTORMODE){
        let dxlMode;
        let id = motor + 1;
        switch(mode)
        {
            case MOTORMODE.joint:
                dxlMode = DXLOperatingMode.OPModePosition;
                break;

            case MOTORMODE.wheel:
                dxlMode = DXLOperatingMode.OPModeVelocity;
                break;
            default:
                dxlMode = -1;
                break;
        }
        console.log(dxlMode);
        dynamixel.setOperatingMode(id, dxlMode);
    }

    /**
     * 관절모드일 때 선택한 속도로 설정
     * @param speed  motor speed
     */
    //% blockId=set_joint_speed block="관절모드를 %speed 속도로 설정"
    //% speed.min=0 speed.max=100
    //% weight=999
    //% blockGap=8
    export function setJointSpeed(speed: number){
        const d = dynamixel.device();
        if(d){
            dynamixel.setOperatingMode(1, DXLOperatingMode.OPModePosition);
            dynamixel.setTorqueEnable(1, true);
            dynamixel.setOperatingMode(2, DXLOperatingMode.OPModePosition);
            dynamixel.setTorqueEnable(2, true);

            let data = control.createBuffer(4);
            if(data){
                
                data.setNumber(NumberFormat.UInt32LE, 0, speed);
                d.dxlDevice.write(1, 112, data);
            }
            let data_2 = control.createBuffer(4);
            if(data_2){
                
                data_2.setNumber(NumberFormat.UInt32LE, 0, speed);
                d.dxlDevice.write(2, 112, data_2);
            }

            dynamixel.setVelocity(1, speed);
            dynamixel.setVelocity(2, speed);
        }
    }

    /**
     * 전진/후진/좌회전/우회전/정지
     * @param speed motor speed
     * @param direction direction
     */
    //% blockId=set_speed_direction block="E2 로봇을 %speed|의 속도로 %direction"
    //% speed.min=0 speed.max=100
    //% weight=998
    //% blockGap=8
    export function setSpeedDirection(speed: number, direction: DIRECTION){
        let speed_motor_1;
        let speed_motor_2;

        const d = dynamixel.device();

        if(d){
            dynamixel.setOperatingMode(1, DXLOperatingMode.OPModeVelocity);
            dynamixel.setTorqueEnable(1, true);
            dynamixel.setOperatingMode(2, DXLOperatingMode.OPModeVelocity);
            dynamixel.setTorqueEnable(2, true);

            switch(direction)
            {
                case DIRECTION.front:
                    speed_motor_1 = speed;
                    speed_motor_2 = -speed;
                    break;
                case DIRECTION.left:
                    speed_motor_1 = speed;
                    speed_motor_2 = speed;
                    break;
                case DIRECTION.rear:
                    speed_motor_1 = -speed;
                    speed_motor_2 = +speed;
                    break;
                case DIRECTION.right:
                    speed_motor_1 = -speed;
                    speed_motor_2 = -speed;
                    break;
                case DIRECTION.stop:
                    speed_motor_1 = 0;
                    speed_motor_2 = 0;
                    break;
            }

            let data = control.createBuffer(4);
            if(data){
                
                data.setNumber(NumberFormat.UInt32LE, 0, speed_motor_1);
                d.dxlDevice.write(1, 104, data);
            }
            let data_2 = control.createBuffer(4);
            if(data_2){
                
                data_2.setNumber(NumberFormat.UInt32LE, 0, speed_motor_2);
                d.dxlDevice.write(2, 104, data_2);
            }

            dynamixel.__rotate(1, speed_motor_1);
            dynamixel.__rotate(2, speed_motor_2);
        }
    }

    /**
     * 선택한 모터를 선택한 속도와 방향으로 회전
     * @param motor motor port
     * @param speed motor speed
     * @param clockwise clockwise
     */
    //% blockId=set_speed_clockwise block="%motor %speed|의 속도로 %clockwise 회전"
    //% speed.min=0 speed.max=100
    //% weight=997
    //% blockGap=8
    export function setSpeedClockwise(motor: MOTOR, speed: number, clockwise: CLOCKWISE){
        let id;
        let speed_direction;
        const d = dynamixel.device();
        id = motor + 1;

        if(d){
            dynamixel.setOperatingMode(id, DXLOperatingMode.OPModeVelocity);
            dynamixel.setTorqueEnable(id, true);

            if(clockwise == CLOCKWISE.clockwise)
                speed_direction = speed;
            else
                speed_direction = -speed;

            let data = control.createBuffer(4);
            if(data){
                
                data.setNumber(NumberFormat.UInt32LE, 0, speed_direction);
                d.dxlDevice.write(id, 104, data);
            }
            
            dynamixel.__rotate(id, speed_direction);
        }
    }

    /**
     * 선택한 모터의 위치 값을 지정된 값으로 이동
     * @param motor motor port
     * @param position motor position
     */
    //% blockId=set_motor_position block="%motor|의 위치를 %position|으로 이동"
    //% position.min=0 position.max=2048
    //% weight=995
    //% blockGap=8
    export function setMotorPosition(motor: MOTOR, position: number){
        let id;
        id = motor + 1;
        const d = dynamixel.device();
        
        if(d){
            dynamixel.setOperatingMode(id, DXLOperatingMode.OPModePosition);
            dynamixel.setTorqueEnable(id, true);

            let data = control.createBuffer(4);
            if(data){
                data.setNumber(NumberFormat.UInt32LE, 0, position);
                d.dxlDevice.write(id, 116, data);
            }
            
            dynamixel.__setVelocity(id, 2048);
            dynamixel.__setPosition(id, position);
        }

    }

    /**
     * 선택한 버튼의 LED 켜기/끄기
     * @param button button
     * @param onoff set button led
     */
    //% blockId=set_button_led block="%button LED %onoff"
    //% weight=994
    //% blockGap=8
    export function setButtonLed(button: BUTTONTYPE, onoff: ON_OFF){
        pins.LED.digitalWrite(onoff == 0?true:false);
    }

}