/// <reference path="./moduleView.ts" />

namespace pxsim.visuals {

    export class BrickView extends ModuleView implements LayoutElement {

        private static ROBOTIS_SCREEN_ID = "robotis_screen";
        private static ROBOTIS_LIGHT_ID = "btn_color";

        private buttons: SVGElement[];
        private light: SVGElement;

        private currentCanvasX = 178;
        private currentCanvasY = 128;

        private static LIGHT_BLACK_COLOR = '#6a6a6a';

        protected btnids: string[] = [];

        constructor(xml: string, prefix: string, port: number) {
            super(xml, prefix, NodeType.Brick, port);
        }

        protected buildDomCore() {
            // Setup buttons
            this.buttons = this.btnids.map(n => this.content.getElementById(this.normalizeId(n)) as SVGElement);
            this.buttons.forEach(b => U.addClass(b, "sim-button"));

            this.light = this.content.getElementById(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID)) as SVGElement;
        }

        protected optimizeForLightMode() {
            (this.content.getElementById(this.normalizeId('cm_body_2')) as SVGElement).style.fill = '#f1f1f1';
            (this.content.getElementById(this.normalizeId('cm_screen_grey')) as SVGElement).style.fill = '#a8aaa8';
            (this.content.getElementById(this.normalizeId('cm_grey_buttom')) as SVGElement).style.fill = '#a8aaa8';
            (this.content.getElementById(this.normalizeId('btn_part_2')) as SVGElement).style.fill = '#393939';
        }

        private setStyleFill(svgId: string, fillUrl: string, lightFill?: string) {
            const el = (this.content.getElementById(svgId) as SVGRectElement);
            if (el) el.style.fill = inLightMode() ? lightFill || BrickView.LIGHT_BLACK_COLOR : `url("#${fillUrl}")`;
        }

        public hasClick() {
            return false;
        }

        public updateState() {
            this.updateLight();
        }

        public updateThemeCore() {
            let theme = this.theme;
            // svg.fill(this.buttons[0], theme.buttonUps[0]);
            // svg.fill(this.buttons[1], theme.buttonUps[1]);
            // svg.fill(this.buttons[2], theme.buttonUps[2]);
        }

        private lastLightPattern: number = -1;
        private lastLightAnimationId: any = undefined;
        private updateLight() {
            // let state = cmboard().getBrickNode().lightState;

            // const lightPattern = state.lightPattern;
            // if (lightPattern == this.lastLightPattern) return;
            // this.lastLightPattern = lightPattern;
            // if (this.lastLightAnimationId) {
            //     cancelAnimationFrame(this.lastLightAnimationId);
            //     delete this.lastLightAnimationId;
            // }
            // switch (lightPattern) {
            //     case 0:  // LED_BLACK
            //         this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
            //         //svg.fill(this.light, "#FFF");
            //         break;
            //     case 1:  // LED_GREEN
            //         this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-green`), 'green');
            //         //svg.fill(this.light, "#00ff00");
            //         break;
            //     case 2:  // LED_RED
            //         this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-red`), 'red');
            //         //svg.fill(this.light, "#ff0000");
            //         break;
            //     case 3:  // LED_ORANGE
            //         this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-orange`), 'orange');
            //         //svg.fill(this.light, "#FFA500");
            //         break;
            //     case 4:  // LED_GREEN_FLASH
            //         this.flashLightAnimation('green');
            //         break;
            //     case 5:  // LED_RED_FLASH
            //         this.flashLightAnimation('red');
            //         break;
            //     case 6:  // LED_ORANGE_FLASH
            //         this.flashLightAnimation('orange');
            //         break;
            //     case 7:  // LED_GREEN_PULSE
            //         this.pulseLightAnimation('green');
            //         break;
            //     case 8:  // LED_RED_PULSE
            //         this.pulseLightAnimation('red');
            //         break;
            //     case 9:  // LED_ORANGE_PULSE
            //         this.pulseLightAnimation('orange');
            //         break;
            // }
        }

        private flashLightAnimation(id: string) {
            const pattern = this.lastLightPattern;
            let fps = 3;
            let now;
            let then = Date.now();
            let interval = 1000 / fps;
            let delta;
            let that = this;
            function draw() {
                if (that.lastLightPattern != pattern) return;
                that.lastLightAnimationId = requestAnimationFrame(draw);
                now = pxsim.U.now();
                delta = now - then;
                if (delta > interval) {
                    then = now - (delta % interval);
                    that.flashLightAnimationStep(id);
                }
            }
            draw();
        }

        private flash: boolean;
        private flashLightAnimationStep(id: string) {
            if (this.flash) {
                this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id);
            } else {
                this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
            }
            this.flash = !this.flash;
        }

        private pulseLightAnimation(id: string) {
            const pattern = this.lastLightPattern;
            let fps = 8;
            let now;
            let then = Date.now();
            let interval = 1000 / fps;
            let delta;
            let that = this;
            function draw() {
                if (that.lastLightPattern != pattern) return;
                that.lastLightAnimationId = requestAnimationFrame(draw);
                now = pxsim.U.now();
                delta = now - then;
                if (delta > interval) {
                    // update time stuffs
                    then = now - (delta % interval);
                    that.pulseLightAnimationStep(id);
                }
            }
            draw();
        }

        private pulse: number = 0;
        private pulseLightAnimationStep(id: string) {
            switch (this.pulse) {
                case 1: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`)); break;
                case 2: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`)); break;
                case 3: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`)); break;
                case 4: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`)); break;
                case 5: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id); break;
                case 6: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id); break;
                case 7: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-black`)); break;
                case 8: this.setStyleFill(this.normalizeId(BrickView.ROBOTIS_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id); break;

            }
            this.pulse++;
            if (this.pulse == 9) this.pulse = 0;
        }

        public kill() {
            cancelAnimationFrame(this.lastLightAnimationId);
        }

        
        public getScreenBBox() {
            if (!this.content) return undefined;
            const screen = this.content.getElementById(this.normalizeId(BrickView.ROBOTIS_SCREEN_ID));
            if (!screen) return undefined;
            return screen.getBoundingClientRect();
        }
    }
}