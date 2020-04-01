/// <reference path="./nodeTypes.ts"/>

namespace pxsim {

    export class PortNode extends BaseNode {
        id = NodeType.Port;

        constructor(port: number) {
            super(port);
        }
    }


    export class BrickNode extends BaseNode {
        id = NodeType.Brick;


        constructor() {
            super(-1);
        }
    }
}