/// <reference path="./moduleView.ts" />

namespace pxsim.visuals {

    export class BrickViewPortrait extends BrickView implements LayoutElement {

        constructor(port: number) {
            super(ROBOTIS_CM_SVG, "board", port);
        }
    }
}