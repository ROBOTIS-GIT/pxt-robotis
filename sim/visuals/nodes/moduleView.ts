namespace pxsim.visuals {
    export function normalizeId(prefix: string, svgId: string) {
        return `${prefix}-${svgId}`;
    }

    export function normalizeXml(prefix: string, xml: string): string {
        xml = xml.replace(/id=\"(.*?)\"/g, (m: string, id: string) => {
            return `id="${normalizeId(prefix, id)}"`;
        });
        xml = xml.replace(/url\(#(.*?)\)/g, (m: string, id: string) => {
            return `url(#${normalizeId(prefix, id)})`;
        });
        xml = xml.replace(/xlink:href=\"#(.*?)\"/g, (m: string, id: string) => {
            return `xlink:href="#${normalizeId(prefix, id)}"`;
        });
        return xml;
    }

    export class ModuleView extends View implements LayoutElement {
        protected content: SVGSVGElement;

        protected controlShown: boolean;

        protected opacity: number;

        constructor(protected xml: string, protected prefix: string, protected id: NodeType, protected port: NodeType) {
            super();
            this.xml = normalizeXml(this.prefix, xml);
        }

        private normalizeXml(xml: string) {
            return pxsim.visuals.normalizeXml(this.prefix, xml);
        }

        protected normalizeId(svgId: string) {
            return `${this.prefix}-${svgId}`;
        }

        public getId() {
            return this.id;
        }

        public getPort() {
            return this.port;
        }

        public getPaddingRatio() {
            return 0;
        }

        public getWiringRatio() {
            return 0.5;
        }

        protected buildDom(): SVGElement {
            this.content = svg.parseString(this.xml);
            this.buildDomCore();
            if (pxsim.inLightMode()) this.optimizeForLightMode();
            this.attachEvents();
            if (this.hasClick())
                this.content.style.cursor = "pointer";
            return this.content;
        }

        protected buildDomCore() {

        }

        protected optimizeForLightMode() {
            
        }

        public getInnerHeight() {
            if (!this.content) {
                return 0;
            }
            if (!this.content.hasAttribute("viewBox")) {
                return this.getContentHeight();
            }
            return parseFloat(this.content.getAttribute("viewBox").split(" ")[3]);
        }

        public getInnerWidth() {
            if (!this.content) {
                return 0;
            }
            if (!this.content.hasAttribute("viewBox")) {
                return this.getContentWidth();
            }
            return parseFloat(this.content.getAttribute("viewBox").split(" ")[2]);
        }

        public getContentHeight() {
            if (!this.content) {
                return 0;
            }
            return parseFloat(this.content.getAttribute("height"));
        }
    
        public getContentWidth() {
            if (!this.content) {
                return 0;
            }
            return parseFloat(this.content.getAttribute("width"));
        }

        public attachEvents() {
        }

        public resize(width: number, height: number, strict?: boolean) {
            super.resize(width, height);
            this.updateDimensions(width, height);
        }

        protected updateDimensions(width: number, height: number) {
            if (this.content) {
                console.log("test");
                const currentWidth = this.getInnerWidth();
                const currentHeight = this.getInnerHeight();
                const newHeight = currentHeight / currentWidth * width;
                const newWidth = currentWidth / currentHeight * height;
                this.content.setAttribute('width', `${width}`);
                this.content.setAttribute('height', `${newHeight}`);
                this.height = newHeight;
            }
        }

        public hasClick() {
            return true;
        }

        public setSelected(selected: boolean) {
            super.setSelected(selected);
            this.updateOpacity();
        }

        public updateState() {
            this.updateOpacity();
        }

        protected updateOpacity() {
            if (this.rendered) {
                const opacity = this.selected && this.fadeWhenSelected() ? 0.2 : 1;
                if (this.hasClick() && this.opacity != opacity) {
                    this.opacity = opacity;
                    this.setOpacity(this.opacity);
                }
                if (this.hasClick()) {
                    if (this.selected) this.content.style.cursor = "";
                    else this.content.style.cursor = "pointer";
                }
            }
        }

        protected fadeWhenSelected() {
            return true;
        }

        protected setOpacity(opacity: number) {
            this.element.setAttribute("opacity", `${opacity}`);
        }
    }
}