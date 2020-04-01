/**
 * Tagged image literal converter
 */
//% shim=@f4 helper=image::ofBuffer blockIdentity="sprites._createImageShim"
//% groups=["0.","1#","2T","3t","4N","5n","6G","7g","8","9","aAR","bBP","cCp","dDO","eEY","fFW"]
function img(lits: any, ...args: any[]): Image { return null }

// set palette before creating screen, so the JS version has the right BPP
image.setPalette(hex`__palette`)
//% whenUsed
const screen = _screen_internal.createScreen();

namespace image {
    //% shim=pxt::setPalette
    export function setPalette(buf: Buffer) { }
}

namespace _screen_internal {
    //% shim=pxt::updateScreen
    function updateScreen(img: Image): void { }
    //% shim=pxt::updateStats
    function updateStats(msg: string): void { }

    //% shim=pxt::updateScreenStatusBar
    function updateScreenStatusBar(img: Image): void { return }
    //% shim=pxt::setupScreenStatusBar
    function setupScreenStatusBar(barHeight: number): void { return }

    //% parts="screen"
    export function createScreen() {
        const img = image.create(178, 128)
        
        setupScreenStatusBar(8)

        const status = image.create(160, 8)
        updateScreenStatusBar(status) // clear the status area

        control.__screen.setupUpdate(() => updateScreen(img))
        control.EventContext.onStats = function (msg: string) {
            status.fill(0)
            status.print(msg, 2, 2, 1, image.font5)
            updateScreenStatusBar(status)
            updateStats(msg);
        }

        return img as ScreenImage;
    }
}

namespace basic {
    const textOffset = 4;
    const lineOffset = 2;
    enum ScreenMode {
        None,
        ShowLines,
        Image,
        Ports,
        Custom
    }
    let screenMode = ScreenMode.None;
    export let font = image.font8;

    /**
     * Gets the text line height
     */
    //%
    export function lineHeight(): number {
        return font.charHeight + lineOffset;
    }

    /**
     * Number of lines
     */
    //%
    export function lineCount(): number {
        return ((screen.height - textOffset) / lineHeight()) >> 0
    }

    /**
     * Show text on the screen at a specific line.
     * @param text the text to print on the screen, eg: "Hello world"
     * @param line the line number to print the text at (starting at 1), eg: 1
     */
    //% blockId=screen_print block="show string %text|at line %line"
    //% weight=98 group="Screen" inlineInputMode="inline" blockGap=8
    //% help=brick/show-string
    //% line.min=1 line.max=10
    export function showString(text: string, line: number) {
        if (screenMode != ScreenMode.ShowLines) {
            screenMode = ScreenMode.ShowLines;
            screen.fill(0);
        }

        // line indexing starts at 1.
        line = (line - 1) >> 0;
        const nlines = lineCount();
        if (line < 0 || line > nlines) return; // out of screen

        const h = lineHeight();
        const y = textOffset + h * line;
        screen.fillRect(0, y, screen.width, h, 0); // clear background
        screen.print(text, textOffset, y, 1, font);
    }

    /**
     * Show a number on the screen
     * @param value the numeric value
     * @param line the line number to print the text at, eg: 1
     */
    //% blockId=screenShowNumber block="show number %name|at line %line"
    //% weight=96 group="Screen" inlineInputMode="inline" blockGap=8
    //% help=brick/show-number
    //% line.min=1 line.max=10
    export function showNumber(value: number, line: number) {
        showString("" + value, line);
    }

    /**
     * Show a name, value pair on the screen
     * @param value the numeric value
     * @param line the line number to print the text at, eg: 1
     */
    //% blockId=screenShowValue block="show value %name|= %text|at line %line"
    //% weight=96 group="Screen" inlineInputMode="inline" blockGap=8
    //% help=brick/show-value
    //% line.min=1 line.max=10
    export function showValue(name: string, value: number, line: number) {
        value = Math.round(value * 1000) / 1000;
        showString((name ? name + ": " : "") + value, line);
    }

    /**
     * Show an image on the screen
     * @param image image to draw
     * @param duration duration in milliseconds to display the image, eg: 400
     */
    //% blockId=screen_show_image block="show image %image=screen_image_picker"
    //% weight=100 group="Screen" blockGap=8
    //% help=brick/show-image
    export function showImage(image: Image, duration: number = 400) {
        if (!image) return;
        image.width *= 2;
        screenMode = ScreenMode.Image;
        screen.fill(0);
        screen.drawImage(image, 0, 0);
        if (duration > 0)
            pause(duration);
    } 

    // function renderPorts() {
    //     const col = 44;
    //     const lineHeight8 = image.font8.charHeight + 2;
    //     const h = screen.height;

    //     clearScreen();

    //     for (let i = 0; i < 4; ++i) {
    //         const x = i * col + 2;
    //         screen.print("ABCD"[i], x, 1 * lineHeight8, 1, image.font8)
    //         screen.print((i + 1).toString(), x, h - lineHeight8, 1, image.font8)
    //     }
    //     screen.drawLine(0, 5 * lineHeight8, screen.width, 5 * lineHeight8, 1);
    //     screen.drawLine(0, h - 5 * lineHeight8, screen.width, h - 5 * lineHeight8, 1)

    //     function scale(x: number) {
    //         if (Math.abs(x) >= 5000) {
    //             const k = Math.floor(x / 1000);
    //             const r = Math.round((x - 1000 * k) / 100);
    //             return `${k}.${r}k`
    //         }
    //         return ("" + (x || 0));
    //     }

        

        
    // }

    /**
     * An image
     * @param image the image
     */
    //% blockId=screen_image_picker block="%image" shim=TD_ID
    //% image.fieldEditor="images"
    //% image.fieldOptions.columns=6
    //% image.fieldOptions.width=600
    //% group="Screen" weight=0 blockHidden=1
    export function __imagePicker(image: Image): Image {
        return image;
    }
}