/// <reference path="./layoutView.ts" />

namespace pxsim {
    export const GAME_LOOP_FPS = 32;
}

namespace pxsim.visuals {

    const CM_STYLE = `
        svg.sim {
            margin-bottom:1em;
        }
        svg.sim.grayscale {
            -moz-filter: grayscale(1);
            -webkit-filter: grayscale(1);
            filter: grayscale(1);
        }
        .user-select-none, .sim-button {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;                        
        }
        .sim-button {
            cursor: pointer;
        }
        .sim-button:hover {
            stroke-width: 2px !important;
            stroke: white !important;
        }

        .sim-systemled {
            fill:#333;
            stroke:#555;
            stroke-width: 1px;
        }

        .sim-text {
            font-family:"Lucida Console", Monaco, monospace;
            font-size:8px;
            fill:#fff;
            pointer-events: none;
            user-select: none;
        }
        .sim-text.small {
            font-size:6px;
        }
        .sim-text.medium {
            font-size:16px;
        }
        .sim-text.large {
            font-size:20px;
        }
        .sim-text.number {
            font-family: Courier, Lato, Work Sans, PT Serif, Source Serif Pro;
            /*font-weight: bold;*/
        }
        .sim-text.inverted {
            fill: #5A5A5A; /*#F12B21;*/
        }

        .no-drag, .sim-text, .sim-text-pin {
            user-drag: none;
            user-select: none;
            -moz-user-select: none;
            -webkit-user-drag: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }

        /* Color Grid */
        .sim-color-grid-circle:hover {
            stroke-width: 0.4;
            stroke: #000;
            cursor: pointer;
        }
        .sim-color-selected {
            stroke-width: 1px !important;
            stroke: #000000 !important;
        }
        .sim-color-wheel-half:hover {
            stroke-width: 1;
            stroke: #000;
            fill: gray !important;
            cursor: pointer;
        }

    `;

    const CM_WIDTH = 99.984346;
    const CM_HEIGHT = 151.66585;
    export const SCREEN_WIDTH = 178;
    export const SCREEN_HEIGHT = 128;
    export interface IBoardTheme {
        accent?: string;
        highContrast?: boolean;
        display?: string;
        buttonOuter?: string;
        buttonUps: string[];
        buttonDown?: string;
        wireColor?: string;
        backgroundViewColor?: string;
    }

    export var themes: IBoardTheme[] = ["#3ADCFE"].map(accent => {
        return {
            accent: accent,
            buttonOuter: "#979797",
            buttonUps: ["#a8aaa8", "#393939", "#a8aaa8", "#a8aaa8", "#a8aaa8", '#a8aaa8'],
            buttonDown: "#000",
            wireColor: '#5A5A5A',
            backgroundViewColor: '#d6edff'
        }
    });

    export function randomTheme(highContrast?: boolean, light?: boolean): IBoardTheme {
        let theme = themes[Math.floor(Math.random() * themes.length)];
        if (highContrast) {
            theme = JSON.parse(JSON.stringify(theme)) as IBoardTheme;
            theme.highContrast = true;
            theme.wireColor = '#ffffff';
            theme.backgroundViewColor = '#ffffff';
        }
        return theme;
    }

    export interface IBoardProps {
        runtime?: pxsim.Runtime;
        theme?: IBoardTheme;
        disableTilt?: boolean;
        wireframe?: boolean;
    }

    export class CMView implements BoardView {
        public static BOARD_WIDTH = 500;
        public static BOARD_HEIGHT = 500;

        public wrapper: HTMLDivElement;
        public element: SVGSVGElement;
        private style: SVGStyleElement;
        private defs: SVGDefsElement;

        private layoutView: LayoutView;

        private cachedControlNodes: { [index: string]: View[] } = {};
        private cachedDisplayViews: { [index: string]: LayoutElement[] } = {};
        private cachedCloseIcons: { [index: string]: View } = {};
        private cachedBackgroundViews: { [index: string]: View } = {};

        private screenCanvas: HTMLCanvasElement;
        private screenCanvasCtx: CanvasRenderingContext2D;
        private screenCanvasData: ImageData;

        private screenCanvasTemp: HTMLCanvasElement;

        private screenScaledWidth: number;
        private screenScaledHeight: number;

        private width = 0;
        private height = 0;

        private g: SVGGElement;

        public board: pxsim.DalBoard;

        constructor(public props: IBoardProps) {
            this.buildDom();
            const dalBoard = board();
            dalBoard.updateSubscribers.push(() => this.updateState());
            if (props && props.wireframe)
                U.addClass(this.element, "sim-wireframe");

            if (props && props.theme)
                this.updateTheme();

            if (props && props.runtime) {
                this.board = this.props.runtime.board as pxsim.DalBoard;
                this.board.updateSubscribers.push(() => this.updateState());
                this.updateState();
            }

            Runtime.messagePosted = (msg) => {
                switch (msg.type || "") {
                    case "status": {
                        const state = (msg as pxsim.SimulatorStateMessage).state;
                        if (state == "killed") this.kill();
                        if (state == "running") this.begin();
                        break;
                    }
                }
            }
        }

        public getView(): SVGAndSize<SVGSVGElement> {
            return {
                el: this.wrapper as any,
                y: 0,
                x: 0,
                w: CMView.BOARD_WIDTH,
                h: CMView.BOARD_WIDTH
            };
        }

        public getCoord(pinNm: string): Coord {
            // Not needed
            return undefined;
        }

        public highlightPin(pinNm: string): void {
            // Not needed
        }

        public getPinDist(): number {
            // Not needed
            return 10;
        }

        public updateTheme() {
            let theme = this.props.theme;
            this.layoutView.updateTheme(theme);
        }

        private getControlForNode(id: NodeType, port: number, useCache = true) {
            if (useCache && this.cachedControlNodes[id] && this.cachedControlNodes[id][port]) {
                return this.cachedControlNodes[id][port];
            }

            let view: View;
            //switch (id) {
                // case NodeType.ColorSensor: {
                //     const state = cmboard().getInputNodes()[port] as ColorSensorNode;
                //     if (state.getMode() == ColorSensorMode.Colors) {
                //         view = new ColorGridControl(this.element, this.defs, state, port);
                //     } else if (state.getMode() == ColorSensorMode.Reflected) {
                //         view = new ColorWheelControl(this.element, this.defs, state, port);
                //     } else if (state.getMode() == ColorSensorMode.Ambient) {
                //         view = new ColorWheelControl(this.element, this.defs, state, port);
                //     }
                //     break;
                // }
                // case NodeType.UltrasonicSensor: {
                //     const state = cmboard().getInputNodes()[port] as UltrasonicSensorNode;
                //     view = new DistanceSliderControl(this.element, this.defs, state, port);
                //     break;
                // }
                // case NodeType.InfraredSensor: {
                //     const state = cmboard().getInputNodes()[port] as InfraredSensorNode;
                //     if (state.getMode() == InfraredSensorMode.Proximity)
                //         view = new ProximitySliderControl(this.element, this.defs, state, port);
                //     else if (state.getMode() == InfraredSensorMode.RemoteControl)
                //         view = new RemoteBeaconButtonsControl(this.element, this.defs, state, port);
                //     break;
                // }
                // case NodeType.GyroSensor: {
                //     const state = cmboard().getInputNodes()[port] as GyroSensorNode;
                //     view = new RotationSliderControl(this.element, this.defs, state, port);
                //     break;
                // }
                // case NodeType.MediumMotor:
                // case NodeType.LargeMotor: {
                //     const state = cmboard().getMotors()[port];
                //     view = new MotorSliderControl(this.element, this.defs, state, port);
                //     break;
                // }
           // }

            if (view) {
                if (!this.cachedControlNodes[id]) this.cachedControlNodes[id] = [];
                this.cachedControlNodes[id][port] = view;
                return view;
            }

            return undefined;
        }

        private getDisplayViewForNode(id: NodeType, port: number): LayoutElement {
            if (this.cachedDisplayViews[id] && this.cachedDisplayViews[id][port]) {
                return this.cachedDisplayViews[id][port];
            }

            let view: LayoutElement;
            // switch (id) {
            //     case NodeType.TouchSensor:
            //         view = new TouchSensorView(port); break;
            //     case NodeType.MediumMotor:
            //         view = new MediumMotorView(port); break;
            //     case NodeType.LargeMotor:
            //         view = new LargeMotorView(port); break;
            //     case NodeType.GyroSensor:
            //         view = new GyroSensorView(port); break;
            //     case NodeType.ColorSensor:
            //         view = new ColorSensorView(port); break;
            //     case NodeType.UltrasonicSensor:
            //         view = new UltrasonicSensorView(port); break;
            //     case NodeType.InfraredSensor:
            //         view = new InfraredView(port); break;
            //     case NodeType.Basic:
            //         //return new BasicView(0);
            //         view = this.layoutView.getBasic(); break;
            // }

            if (view) {
                if (!this.cachedDisplayViews[id]) this.cachedDisplayViews[id] = [];
                this.cachedDisplayViews[id][port] = view;
                return view;
            }

            return undefined;
        }

        private getCloseIconView(port: number) {
            if (this.cachedCloseIcons[port]) {
                return this.cachedCloseIcons[port];
            }
            return 1;
            // // const closeIcon = new CloseIconControl(this.element, this.defs, new PortNode(-1), -1);
            // this.cachedCloseIcons[port] = closeIcon;
            // return closeIcon;
        }

        private getBackgroundView(port: number) {
            if (this.cachedBackgroundViews[port]) {
                return this.cachedBackgroundViews[port];
            }
            const backgroundView = new BackgroundViewControl(this.element, this.defs, new PortNode(-1), -1);
            this.cachedBackgroundViews[port] = backgroundView;
            return backgroundView;
        }

        private buildDom() {
            this.wrapper = document.createElement('div');
            this.wrapper.style.display = 'inline';

            this.element = svg.elt("svg", { height: "100%", width: "100%", "class": "user-select-none" }) as SVGSVGElement;

            this.defs = svg.child(this.element, "defs") as SVGDefsElement;

            this.style = svg.child(this.element, "style", {}) as SVGStyleElement;
            this.style.textContent = CM_STYLE;

            this.layoutView = new LayoutView();
            this.layoutView.inject(this.element, this.props.theme);

            const basic = new BasicViewPortrait(-1);
            this.layoutView.setBasic(basic);
            CMView.isPreviousBasicLandscape() ? this.layoutView.setlectBasic() : this.layoutView.unselectBasic();

            //this.resize();

            // Add Screen canvas to board
            this.buildScreenCanvas();

            this.wrapper.appendChild(this.element);
            this.wrapper.appendChild(this.screenCanvas);
            this.wrapper.appendChild(this.screenCanvasTemp);

            window.addEventListener("resize", e => {
                this.resize();
            });
        }

        public resize() {
            if (!this.element) return;
            this.width = document.body.offsetWidth;
            this.height = document.body.offsetHeight;
            this.layoutView.layout(this.width, this.height);

            this.updateState();
            let state = cmboard().screenState;
            this.updateScreenStep(state);
        }

        private buildScreenCanvas() {
            this.screenCanvas = document.createElement("canvas");
            this.screenCanvas.id = "board-screen-canvas";
            this.screenCanvas.style.userSelect = "none";
            this.screenCanvas.style.msUserSelect = "none";
            this.screenCanvas.style.webkitUserSelect = "none";
            (this.screenCanvas.style as any).MozUserSelect = "none";
            this.screenCanvas.style.position = "absolute";
            this.screenCanvas.style.color = "#000000";
            this.screenCanvas.addEventListener(pxsim.pointerEvents.up, ev => {
                console.log("click");
                this.layoutView.toggleBasicSelect();
                this.resize();
            })
            /*
            this.screenCanvas.style.cursor = "crosshair";
            this.screenCanvas.onmousemove = (e: MouseEvent) => {
                const x = e.clientX;
                const y = e.clientY;
                const bBox = this.screenCanvas.getBoundingClientRect();
                this.updateXY(Math.floor((x - bBox.left) / this.screenScaledWidth * SCREEN_WIDTH),
                    Math.floor((y - bBox.top) / this.screenScaledHeight * SCREEN_HEIGHT));
            }
            this.screenCanvas.onmouseleave = () => {
                this.updateXY(SCREEN_WIDTH, SCREEN_HEIGHT);
            }
            */

            this.screenCanvas.width = SCREEN_WIDTH;
            this.screenCanvas.height = SCREEN_HEIGHT;

            this.screenCanvasCtx = this.screenCanvas.getContext("2d");

            this.screenCanvasTemp = document.createElement("canvas");
            this.screenCanvasTemp.style.display = 'none';
        }

        private kill() {
            this.running = false;
            if (this.lastAnimationIds.length > 0) {
                this.lastAnimationIds.forEach(animationId => {
                    cancelAnimationFrame(animationId);
                })
            }
            // Kill the basic
            this.layoutView.getPortraitBasic().kill();
            this.layoutView.getLandscapeBasic().kill();

            // Save previous inputs for the next cycle
            CMView.previousSelectedInputs = {};
            // cmboard().getInputNodes().forEach((node, index) =>
            //     CMView.previousSelectedInputs[index] = (this.getDisplayViewForNode(node.id, index).getSelected()));
            // CMView.previousSeletedOutputs = {};
            // cmboard().getMotors().forEach((node, index) =>
            //     CMView.previousSeletedOutputs[index] = (this.getDisplayViewForNode(node.id, index).getSelected()));
            CMView.previousBasicLandscape = this.layoutView.isBasicLandscape();
        }

        private static previousSelectedInputs: pxt.Map<boolean> = {};
        private static previousSeletedOutputs: pxt.Map<boolean> = {};
        private static previousBasicLandscape: boolean;

        private static isPreviousInputSelected(index: number) {
            const previousInput = CMView.previousSelectedInputs[index];
            delete CMView.previousSelectedInputs[index];
            return previousInput;
        }

        private static isPreviousOutputSelected(index: number) {
            const previousOutput = CMView.previousSeletedOutputs[index];
            delete CMView.previousSeletedOutputs[index];
            return previousOutput;
        }

        private static isPreviousBasicLandscape() {
            const b = CMView.previousBasicLandscape;
            CMView.previousBasicLandscape = false;
            return !!b;
        }

        private begin() {
            this.running = true;
            this.updateState();
        }

        private running: boolean = false;
        private lastAnimationIds: number[] = [];
        public updateState() {
            if (this.lastAnimationIds.length > 0) {
                this.lastAnimationIds.forEach(animationId => {
                    cancelAnimationFrame(animationId);
                })
            }
            if (!this.running) return;
            const fps = GAME_LOOP_FPS;
            let now;
            let then = pxsim.U.now();
            let interval = 1000 / fps;
            let delta;
            let that = this;
            function loop() {
                const animationId = requestAnimationFrame(loop);
                that.lastAnimationIds.push(animationId);
                now = pxsim.U.now();
                delta = now - then;
                if (delta > interval) {
                    then = now;
                    that.updateStateStep(delta);
                }
            }
            loop();
        }

        private updateStateStep(elapsed: number) {
            //const inputNodes = cmboard().getInputNodes();
            // inputNodes.forEach((node, index) => {
            //     node.updateState(elapsed);
            //     const view = this.getDisplayViewForNode(node.id, index);
            //     if (!node.didChange() && !view.didChange()) return;
            //     if (view) {
            //         const previousSelected = CMView.isPreviousInputSelected(index);
            //         const isSelected = previousSelected != undefined ? previousSelected : view.getSelected();
            //         view.setSelected(isSelected);
            //         const control = isSelected ? this.getControlForNode(node.id, index, !node.modeChange()) : undefined;
            //         const closeIcon = control ? this.getCloseIconView(index + 10) : undefined;
            //         const backgroundView = control && view.hasBackground() ? this.getBackgroundView(index + 10) : undefined;
            //         this.layoutView.setInput(index, view, control, closeIcon, backgroundView);
            //         view.updateState();
            //         if (control) control.updateState();
            //     }
            // });

            const basicNode = cmboard().getBasicNode();
            if (basicNode.didChange()) {
                this.layoutView.getPortraitBasic().updateState();
                this.layoutView.getLandscapeBasic().updateState();
            }

            //const outputNodes = cmboard().getMotors();
            // outputNodes.forEach((node, index) => {
            //     node.updateState(elapsed);
            //     const view = this.getDisplayViewForNode(node.id, index);
            //     if (!node.didChange() && !view.didChange()) return;
            //     if (view) {
            //         const previousSelected = CMView.isPreviousOutputSelected(index);
            //         const isSelected = previousSelected != undefined ? previousSelected : view.getSelected();
            //         view.setSelected(isSelected);
            //         const control = isSelected ? this.getControlForNode(node.id, index) : undefined;
            //         const closeIcon = control ? this.getCloseIconView(index) : undefined;
            //         const backgroundView = control && view.hasBackground() ? this.getBackgroundView(index) : undefined;
            //         this.layoutView.setOutput(index, view, control, closeIcon, backgroundView);
            //         view.updateState();
            //         if (control) control.updateState();
            //     }
            // });

            let state = cmboard().screenState;
            if (state.didChange()) {
                this.updateScreenStep(state);
            }
        }

        private updateScreenStep(state: ScreenState) {
            const isLandscape = this.layoutView.isBasicLandscape();
            const bBox = this.layoutView.getBasic().getScreenBBox();
            if (!bBox || bBox.width == 0) return;

            const scale = (bBox.height - 2) / SCREEN_HEIGHT;
            this.screenScaledHeight = (bBox.height - 2);
            this.screenScaledWidth = this.screenScaledHeight / SCREEN_HEIGHT * SCREEN_WIDTH;

            this.screenCanvas.style.top = `${bBox.top + 1}px`;
            this.screenCanvas.style.left = `${bBox.left + ((bBox.width - this.screenScaledWidth) * 0.5)}px`;
            this.screenCanvas.width = this.screenScaledWidth;
            this.screenCanvas.height = this.screenScaledHeight;

            this.screenCanvas.style.cursor = !isLandscape ? "zoom-in" : "zoom-out";

            this.screenCanvasData = this.screenCanvasCtx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

            new Uint32Array(this.screenCanvasData.data.buffer).set(state.screen)

            // Move the image to another canvas element in order to scale it
            this.screenCanvasTemp.style.width = `${SCREEN_WIDTH}`;
            this.screenCanvasTemp.style.height = `${SCREEN_HEIGHT}`;

            this.screenCanvasTemp.getContext("2d").putImageData(this.screenCanvasData, 0, 0);

            this.screenCanvasCtx.scale(scale, scale);
            this.screenCanvasCtx.drawImage(this.screenCanvasTemp, 0, 0);
        }

        private updateXY(width: number, height: number) {
            const screenWidth = Math.max(0, Math.min(SCREEN_WIDTH, width));
            const screenHeight = Math.max(0, Math.min(SCREEN_HEIGHT, height));
            console.log(`width: ${screenWidth}, height: ${screenHeight}`);

            // TODO: add a reporter for the hovered XY position
        }
    }
}