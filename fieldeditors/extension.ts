/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts" />

import { FieldProtractorEx } from "./field_protractor_ex";

//namespace pxt.editor {
pxt.editor.initFieldExtensionsAsync = function (opts: pxt.editor.FieldExtensionOptions): Promise<pxt.editor.FieldExtensionResult> {
       
    pxt.debug('loading pxt-microbit field editors...')
      
    const res: pxt.editor.FieldExtensionResult = {
        fieldEditors: [{
            selector: "protractorPickerEx",
            editor: FieldProtractorEx
        }]
    };
    
    return Promise.resolve<pxt.editor.FieldExtensionResult>(res);
}
    
    
//}