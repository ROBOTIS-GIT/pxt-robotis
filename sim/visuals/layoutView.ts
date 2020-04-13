/// <reference path="./view.ts" />
/// <reference path="./nodes/moduleView.ts" />
/// <reference path="./nodes/portView.ts" />

namespace pxsim.visuals {
    export const BASIC_HEIGHT_RATIO = 1 / 3;
    export const MODULE_AND_WIRING_HEIGHT_RATIO = 1 / 3; // For inputs and outputs

    export const MODULE_HEIGHT_RATIO = MODULE_AND_WIRING_HEIGHT_RATIO * 4 / 5;
    export const WIRING_HEIGHT_RATIO = MODULE_AND_WIRING_HEIGHT_RATIO / 5;

    export const MODULE_INNER_PADDING_RATIO = 1 / 35;

    export const MAX_MODULE_WIDTH = 100;
    export const MIN_MODULE_HEIGHT = 40;

    export const CLOSE_ICON_GAP_MULTIPLIER = 0.3;

    export interface LayoutElement extends View {
        getId(): number;
        getPort(): number;
        getPaddingRatio(): number;
        getWiringRatio(): number;
    }

    export class LayoutView extends ViewContainer {
        private inputs: LayoutElement[] = [];
        private outputs: LayoutElement[] = [];

        private inputContainers: ViewContainer[] = [];
        private outputContainers: ViewContainer[] = [];

        private inputControls: View[] = [];
        private outputControls: View[] = [];

        private inputCloseIcons: View[] = [];
        private outputCloseIcons: View[] = [];

        private inputBackgroundViews: View[] = [];
        private outputBackgroundViews: View[] = [];

        

        private basic: BasicViewPortrait;
        private basicLandscape: BasicViewLandscape;
        private basicInLandscape: boolean;

        private offsets: number[];
        private contentGroup: SVGGElement;
        private scrollGroup: SVGGElement;
        private renderedViews: Map<boolean> = {};
        private hasDimensions = false;

        constructor() {
            super();

            this.outputContainers = [new ViewContainer(), new ViewContainer, new ViewContainer(), new ViewContainer()];
            this.inputContainers = [new ViewContainer(), new ViewContainer, new ViewContainer(), new ViewContainer()];

            this.basic = new BasicViewPortrait(0);
            this.basicLandscape = new BasicViewLandscape(0);

            // for (let port = 0; port < DAL.NUM_OUTPUTS; port++) {
            //     this.outputWires[port] = new WireView(port);
            // }
            // for (let port = 0; port < DAL.NUM_INPUTS; port++) {
            //     this.inputWires[port] = new WireView(port);
            // }
        }

        public layout(width: number, height: number) {
            this.hasDimensions = true;
            this.resize(width, height);
            this.scrollGroup.setAttribute("width", width.toString());
            this.scrollGroup.setAttribute("height", height.toString());
            this.position();
        }

        public setBasic(basic: BasicView) {
            this.basic = basic;
            this.basic.inject(this.scrollGroup, this.theme);
            //this.basicLandscape.inject(this.scrollGroup, this.theme);
            this.basic.setSelected(false);
            //this.basicLandscape.setSelected(true);
            //this.basicLandscape.setVisible(false);
            this.position();
        }

        public isBasicLandscape() {
            return this.basicInLandscape;
        }

        public getBasic() {
            return this.basicInLandscape ? this.getLandscapeBasic() : this.getPortraitBasic();
        }

        public getPortraitBasic() {
            return this.basic;
        }

        public getLandscapeBasic() {
            return this.basicLandscape;
        }

        public unselectBasic() {
            this.basic.setSelected(false);
            this.basicLandscape.setSelected(true);
            this.basicLandscape.setVisible(false);
            this.basicInLandscape = false;
            this.position();
        }

        public setlectBasic() {
            this.basic.setSelected(true);
            this.basicLandscape.setSelected(false);
            this.basicLandscape.setVisible(true);
            this.basicInLandscape = true;
            this.position();
        }

        public toggleBasicSelect() {
            const selected = this.basicInLandscape;
            if (selected) this.unselectBasic();
            else this.setlectBasic();
        }

        public setInput(port: number, view: LayoutElement, control?: View, closeIcon?: View, backgroundView?: View) {
            if (this.inputs[port] != view || this.inputControls[port] != control) {
                if (this.inputs[port]) {
                    // Remove current input
                    this.inputs[port].dispose();
                }
                this.inputs[port] = view;
                if (this.inputControls[port]) {
                    this.inputControls[port].dispose();
                }
                this.inputControls[port] = control;
                this.inputCloseIcons[port] = closeIcon;
                this.inputBackgroundViews[port] = backgroundView;

                this.inputContainers[port].clear();

                if (control && backgroundView) this.inputContainers[port].addView(backgroundView);
                this.inputContainers[port].addView(view);
                if (control) this.inputContainers[port].addView(control);

                if (view.hasClick()) view.registerClick((ev: any) => {
                    view.setSelected(true);
                    runtime.queueDisplayUpdate();
                }, true);

                if (control && closeIcon) {
                    this.inputContainers[port].addView(closeIcon);
                    closeIcon.registerClick(() => {
                        // Clear selection
                        view.setSelected(false);
                        runtime.queueDisplayUpdate();
                    })
                }
            }

            this.position();
        }

        public setOutput(port: number, view: LayoutElement, control?: View, closeIcon?: View, backgroundView?: View) {
            if (this.outputs[port] != view || this.outputControls[port] != control) {
                if (this.outputs[port]) {
                    // Remove current output
                    this.outputs[port].dispose();
                }
                this.outputs[port] = view;
                if (this.outputControls[port]) {
                    this.outputControls[port].dispose();
                }
                this.outputControls[port] = control;
                this.outputCloseIcons[port] = closeIcon;
                this.outputBackgroundViews[port] = backgroundView;

                this.outputContainers[port].clear();

                if (control && backgroundView) this.outputContainers[port].addView(backgroundView);
                this.outputContainers[port].addView(view);
                if (control) this.outputContainers[port].addView(control);

                if (view.hasClick()) view.registerClick((ev: any) => {
                    view.setSelected(true);
                    runtime.queueDisplayUpdate();
                }, true)

                if (control && closeIcon) {
                    this.outputContainers[port].addView(closeIcon);
                    closeIcon.registerClick(() => {
                        // Clear selection
                        view.setSelected(false);
                        runtime.queueDisplayUpdate();
                    })
                }
            }

            this.position();
        }

        protected buildDom() {
            this.contentGroup = svg.elt("g") as SVGGElement;
            this.scrollGroup = svg.child(this.contentGroup, "g") as SVGGElement;

            this.inputs = [];
            this.outputs = [];
            this.inputControls = [];
            this.outputControls = [];

            // Inject all wires
            // for (let port = 0; port < DAL.NUM_OUTPUTS; port++) {
            //     this.outputWires[port].inject(this.scrollGroup, this.theme);
            // }
            // for (let port = 0; port < DAL.NUM_INPUTS; port++) {
            //     this.inputWires[port].inject(this.scrollGroup, this.theme);
            // }

            // Inject all view containers
            for (let i = 0; i < 4; i++) {
                this.inputContainers[i].inject(this.scrollGroup, this.theme);
                this.outputContainers[i].inject(this.scrollGroup, this.theme);
            }

            // Inject all ports
            // this.setInput(0, new PortView(0, '1'));
            // this.setInput(1, new PortView(1, '2'));
            // this.setInput(2, new PortView(2, '3'));
            // this.setInput(3, new PortView(3, '4'));

            // this.setOutput(0, new PortView(0, 'A'));
            // this.setOutput(1, new PortView(1, 'B'));
            // this.setOutput(2, new PortView(2, 'C'));
            // this.setOutput(3, new PortView(3, 'D'));

            return this.contentGroup;
        }

        public getInnerWidth() {
            if (!this.hasDimensions) {
                return 0;
            }
            return this.width;
        }

        public getInnerHeight() {
            if (!this.hasDimensions) {
                return 0;
            }
            return this.height;
        }

        public updateTheme(theme: IBoardTheme) {
            
            this.inputs.forEach(n => {
                n.updateTheme(theme);
            })
            this.basic.updateTheme(theme);
            this.basicLandscape.updateTheme(theme);
            this.outputs.forEach(n => {
                n.updateTheme(theme);
            })
        }

        private position() {
            if (!this.hasDimensions) {
                return;
            }

            this.offsets = [];

            const contentWidth = this.width;
            if (!contentWidth) return;
            const contentHeight = this.height;
            if (!contentHeight) return;

            const noConnections = this.outputs.concat(this.inputs).filter(m => m.getId() != NodeType.Port).length == 0;

            this.outputs.concat(this.inputs).forEach(m => m.setVisible(true));

            const moduleHeight = this.getModuleHeight();

            const basicHeight = this.getBasicHeight();
            const basicWidth = this.basic.getInnerWidth() / this.basic.getInnerHeight() * basicHeight;
            const basicPadding = (contentWidth - basicWidth) / 2;

            const modulePadding = this.getModulePadding();
            const moduleSpacing = contentWidth / 4;
            let currentX = this.getModulePadding();
            let currentY = 0;
            this.outputs.forEach((n, i) => {
                this.outputContainers[i].translate(currentX + (this.getAbosluteModuleWidth() - this.getInnerModuleWidth()) / 2, currentY);
                if (this.outputs[i]) {
                    const view = this.outputs[i];
                    const outputPadding = this.getInnerModuleWidth() * view.getPaddingRatio();
                    const outputHeight = this.getModuleHeight();
                    const outputWidth = this.getInnerModuleWidth();

                    // Translate and resize view
                    view.resize(outputWidth - outputPadding * 2, outputHeight);
                    // const viewHeight = view.getInnerHeight() / view.getInnerWidth() * outputWidth;
                    // view.translate(outputPadding + ((desiredOutputWidth - outputWidth) / 2), outputHeight - viewHeight, true);
                    const viewHeight = view.getActualHeight();
                    view.translate(outputPadding, outputHeight - viewHeight, true);

                    // Resize control
                    const control = this.outputControls[i];
                    if (control) {
                        const controlWidth = outputWidth;
                        const closeIconOffset = (this.getCloseIconSize() * (1 + CLOSE_ICON_GAP_MULTIPLIER));
                        const controlHeight = outputHeight - closeIconOffset;
                        control.resize(controlWidth, controlHeight);
                        control.translate((controlWidth - control.getActualWidth()) / 2,
                            closeIconOffset + ((controlHeight - control.getActualHeight()) / 2), true)

                        // Translate and resize close icon
                        const closeIcon = this.outputCloseIcons[i];
                        if (closeIcon) {
                            const closeIconSize = this.getCloseIconSize();
                            closeIcon.resize(closeIconSize, closeIconSize);
                            closeIcon.translate((outputWidth - closeIcon.getActualWidth()) / 2, (CLOSE_ICON_GAP_MULTIPLIER * closeIcon.getActualHeight()), true);
                        }
                    }

                    // Resize background
                    const backgroundView = this.inputBackgroundViews[i];
                    if (backgroundView) {
                        backgroundView.resize(this.getInnerModuleWidth(), outputHeight);
                        backgroundView.translate(0, 0, true)
                }
                }
                currentX += moduleSpacing;
            })

            currentX = 0;
            currentY = moduleHeight;

            const wireBasicSpacing = basicWidth / 5;
            const wiringYPadding = 5;
            let wireStartX = 0;
            let wireEndX = basicPadding + wireBasicSpacing;
            let wireEndY = currentY + this.getWiringHeight() + wiringYPadding;
            let wireStartY = currentY - wiringYPadding;

            // Draw output lines
            // for (let port = 0; port < DAL.NUM_OUTPUTS; port++) {
            //     this.outputWires[port].updateDimensions(wireStartX + moduleSpacing * this.outputs[port].getWiringRatio(), wireStartY, wireEndX, wireEndY);
            //     this.outputWires[port].setSelected(this.outputs[port].getId() == NodeType.Port);
            //     wireStartX += moduleSpacing;
            //     wireEndX += wireBasicSpacing;
            // }

            currentX = basicPadding;
            currentY += this.getWiringHeight();

            // Render the basic in the middle
            this.basic.resize(basicWidth, basicHeight);
            this.basic.translate(currentX, currentY);
            this.basicLandscape.resize(contentWidth, basicHeight);
            this.basicLandscape.translate((contentWidth - this.basicLandscape.getContentWidth()) / 2, currentY);

            currentX = modulePadding;
            currentY += basicHeight + this.getWiringHeight();

            this.inputs.forEach((n, i) => {
                this.inputContainers[i].translate(currentX + (this.getAbosluteModuleWidth() - this.getInnerModuleWidth()) / 2, currentY);
                if (this.inputs[i]) {
                    const view = this.inputs[i];
                    const inputPadding = this.getInnerModuleWidth() * view.getPaddingRatio();
                    const inputHeight = this.getModuleHeight();
                    const inputWidth = this.getInnerModuleWidth();

                    // Translate and resize view
                    view.resize(inputWidth - inputPadding * 2, inputHeight);
                    const viewHeight = Math.max(view.getActualHeight(), MIN_MODULE_HEIGHT);
                    view.translate(inputPadding, 0, true);

                    // Resize control
                    const control = this.inputControls[i];
                    if (control) {
                        const controlWidth = inputWidth;
                        const controlHeight = inputHeight - viewHeight - (this.getCloseIconSize() * (1 + CLOSE_ICON_GAP_MULTIPLIER));
                        control.resize(controlWidth, controlHeight);
                        control.translate((controlWidth - control.getActualWidth()) / 2,
                            viewHeight + ((controlHeight - control.getActualHeight()) / 2), true)

                        // Translate and resize close icon
                        const closeIcon = this.inputCloseIcons[i];
                        if (closeIcon) {
                            const closeIconSize = this.getCloseIconSize();
                            closeIcon.resize(closeIconSize, closeIconSize);
                            closeIcon.translate((inputWidth - closeIcon.getActualWidth()) / 2, inputHeight - ((1 + CLOSE_ICON_GAP_MULTIPLIER) * closeIcon.getActualHeight()), true);
                        }
                        }

                    // Resize background
                    const backgroundView = this.inputBackgroundViews[i];
                    if (backgroundView) {
                        backgroundView.resize(this.getInnerModuleWidth(), inputHeight, true);
                        backgroundView.translate(0, 0, true)
                    }
                }
                currentX += moduleSpacing;
            })

            wireStartX = moduleSpacing / 2;
            wireEndX = basicPadding + wireBasicSpacing;
            wireEndY = currentY - this.getWiringHeight() - wiringYPadding;
            wireStartY = currentY + wiringYPadding;

            // Draw input lines
            // for (let port = 0; port < DAL.NUM_INPUTS; port++) {
            //     this.inputWires[port].updateDimensions(wireStartX, wireStartY, wireEndX, wireEndY);
            //     this.inputWires[port].setSelected(this.inputs[port].getId() == NodeType.Port);
            //     wireStartX += moduleSpacing;
            //     wireEndX += wireBasicSpacing;
            // }
        }

        public getBasicHeight() {
            return this.height * BASIC_HEIGHT_RATIO;
        }

        public getWiringHeight() {
            return this.height * WIRING_HEIGHT_RATIO;
        }

        public getModuleBounds() {
            return {
                width: Math.min(this.getAbosluteModuleWidth(), MAX_MODULE_WIDTH),
                height: this.getModuleHeight()
            }
        }

        public getModulePadding() {
            return this.getModuleBounds().width / 35;
        }

        public getInnerModuleWidth() {
            return this.getModuleBounds().width - (this.getModulePadding() * 2);
        }

        public getAbosluteModuleWidth() {
            return this.width / 4;
        }

        public getModuleHeight() {
            return this.height * MODULE_HEIGHT_RATIO;
        }

        public getCloseIconSize() {
            return this.getInnerModuleWidth() / 4;
        }
    }
}