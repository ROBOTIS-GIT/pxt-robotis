/// <reference path="./moduleView.ts" />

namespace pxsim.visuals {

    export class BasicViewPortrait extends BasicView implements LayoutElement {

        constructor(port: number) {
            super(ROBOTIS_CM_SVG, "board", port);
            this.btnids = ["BTN_A", "BTN_B"];
        }
    }
}