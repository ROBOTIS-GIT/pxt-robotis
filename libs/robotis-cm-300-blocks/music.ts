/**
 * Generation of music tones.
 */
//% color=#E30FC0 weight=900 icon="\uf025" block="Music"
namespace music {
    /**
     * Read sound detected count
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readSoundDetectedCount block="#sound detected count value"
    //% weight=1000 blockGap=8
    //% group="Record"
    export function readSoundDetectedCount(): number {
        return 0;
    }

    /**
     * Read sound detecting count
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readSoundDetectingCount block="#sound detecting count value"
    //% weight=1000 blockGap=8
    //% group="Record"
    export function readSoundDetectingCount(): number {
        return 0;
    }

    /**
     * Play recorded sound
     * @param sec second to play
     */
    //% help=basic/print/print
    //% blockId=cm300_playRecordedSound block="#play recorded sound for %sec second(s)"
    //% weight=1000 blockGap=8
    //% sec.defl=5 sec.min=1 sec.max=10
    //% group="Record"
    export function playRecordedSound(sec: number): void {
        
    }

    /**
     * Record sound
     * @param sec second to record
     */
    //% help=basic/print/print
    //% blockId=cm300_recordSound block="#record sound for %sec second(s)"
    //% weight=1000 blockGap=8
    //% sec.defl=5 sec.min=1 sec.max=10
    //% group="Record"
    export function recordSound(sec: number): void {
        
    }
}
