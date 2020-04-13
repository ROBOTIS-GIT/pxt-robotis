/// <reference path="./moduleView.ts" />

namespace pxsim.visuals {

    export class BasicViewLandscape extends BasicView implements LayoutElement {

        constructor(port: number) {
            super(ROBOTIS_CM_SVG, "board", port);

            this.btnids = ["BTN_A", "BTN_B"];
        }

        protected updateDimensions(width: number, height: number) {
            if (this.content) {
                const currentWidth = this.getInnerWidth();
                const currentHeight = this.getInnerHeight();
                const newHeight = currentHeight / currentWidth * width;
                const newWidth = currentWidth / currentHeight * height;
                this.content.setAttribute('width', `${height > width ? width : newWidth}`);
                this.content.setAttribute('height', `${height > width ? newHeight : height}`);
            }
        }
    }
}