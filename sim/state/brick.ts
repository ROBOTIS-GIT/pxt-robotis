/// <reference path="./nodeTypes.ts"/>

namespace pxsim {

    export class PortNode extends BaseNode {
        id = NodeType.Port;

        constructor(port: number) {
            super(port);
        }
    }


    export class BasicNode extends BaseNode {
        id = NodeType.Basic;

        buttonState: CMButtonState;
        constructor() {
            super(-1);
            this.buttonState = new CMButtonState();
        }
    }
}