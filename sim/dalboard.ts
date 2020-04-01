/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts"/>
/// <reference path="../built/common-sim.d.ts"/>

namespace pxsim {

    export class DalBoard extends CoreBoard {
        viewHost: visuals.BoardHost;
        view: SVGSVGElement;
        screenState: ScreenState;
        audioState: AudioState;
    
     
        brickNode: BrickNode;


        highcontrastMode?: boolean;
        lightMode?: boolean;

        public motorMap: pxt.Map<number> = {
            0x01: 0,
            0x02: 1,
            0x04: 2,
            0x08: 3
        }

        constructor() {
            super()

            this.bus.setNotify(DAL.DEVICE_ID_NOTIFY, DAL.DEVICE_ID_NOTIFY_ONE);

            this.brickNode = new BrickNode();

            this.screenState = new ScreenState(["#97b5a6", "#000000"], visuals.SCREEN_WIDTH, visuals.SCREEN_HEIGHT); //KHG_색상지정
            this.audioState = new AudioState();
        }

        receiveMessage(msg: SimulatorMessage) {
            if (!runtime || runtime.dead) return;

            switch (msg.type || "") {
                case "eventbus": {
                    let ev = <SimulatorEventBusMessage>msg;
                    this.bus.queue(ev.id, ev.eventid, ev.value);
                    break;
                }
                case "serial": {
                    let data = (<SimulatorSerialMessage>msg).data || "";
                    // TODO
                    break;
                }
            }
        }

        initAsync(msg: SimulatorRunMessage): Promise<void> {
            super.initAsync(msg);

            const options = (msg.options || {}) as pxt.RuntimeOptions;

            const boardDef = msg.boardDefinition;
            const cmpsList = msg.parts;
            const cmpDefs = msg.partDefinitions || {};
            const fnArgs = msg.fnArgs;

            const opts: visuals.BoardHostOpts = {
                state: this,
                boardDef: boardDef,
                partsList: cmpsList,
                partDefs: cmpDefs,
                fnArgs: fnArgs,
                maxWidth: "100%",
                maxHeight: "100%",
                highContrast: msg.highContrast,
                light: msg.light
            };
            this.viewHost = new visuals.BoardHost(pxsim.visuals.mkBoardView({
                boardDef,
                visual: boardDef.visual,
                highContrast: msg.highContrast,
                light: msg.light
            }), opts);

            document.body.innerHTML = ""; // clear children
            document.body.className = msg.light ? "light" : "";
            document.body.appendChild(this.view = this.viewHost.getView() as SVGSVGElement);
            this.highcontrastMode = msg.highContrast;
            this.lightMode = msg.light;

            return Promise.resolve();
        }

        screenshotAsync(width?: number): Promise<ImageData> {
            return this.viewHost.screenshotAsync(width);
        }

        getBrickNode() {
            return this.brickNode;
        }

    }

    export function initRuntimeWithDalBoard() {
        U.assert(!runtime.board);
        let b = new DalBoard();
        runtime.board = b;
        runtime.postError = (e) => {
            // TODO
            runtime.updateDisplay();
            console.log('runtime error: ' + e);
        }
    }

    export function cmboard(): DalBoard {
        return runtime.board as DalBoard;
    }

    export function inLightMode(): boolean {
        return /light=1/i.test(window.location.href) || cmboard().lightMode;
    }

    export function inHighcontrastMode(): boolean {
        return cmboard().highcontrastMode;
    }

    if (!pxsim.initCurrentRuntime) {
        pxsim.initCurrentRuntime = initRuntimeWithDalBoard;
    }
}