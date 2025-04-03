import Requests from "../Requests.js";
import Settings from "../Settings.js";
import Utils from "./Utils.js";

const RequestsUtils = new class {

    SELECTORS = {
        SEARCH_INPUT: "[aria-label='Input di ricerca']",
        OPEN_SEARCH: "[aria-label='Cerca']",

        OPEN_POST_CREATION: "[aria-label='Nuovo post']",
        CREATE_POST_BUTTON: "[aria-label='Nuovo post']",
        CREATE_POST_CONFIRM_BUTTON: "[aria-label='Post']",
        CREATE_POST_CUT_SECTION: "[aria-label='Seleziona ritaglio']",
        CREATE_POST_CUT_SECTION_ORIGINAL_DIMENSIONS: "[aria-label='Icona del contorno della foto']",
        CREATE_POST_FILE_UPLOAD: "[aria-label='Icona per rappresentare i contenuti multimediali come immagini o video']",
        POST_CAPTION: "[aria-placeholder='Scrivi una didascalia...']",

    }
    async waitForSelector(selector, timeout=10_000){
        while(timeout>0){
            let r = await Requests.executeBrowserCommand(`document.querySelector("${selector}") != null`);
            console.log(`waited for selector ${selector}. found=${r}`);
            if(r) return;
            await Utils.sleep(500);
            timeout -= 500;
        }
        throw new Error("Timeou while waiting for selector: " + selector);
    }
    async click(selector){
        await Requests.executeBrowserCommand(`
            console.log("[click] ${selector}")
            document.querySelector("${selector}")?.click()
        `);
    }
    async openSearch(){
        console.log("executing code for open search")
        await Requests.executeBrowserCommand(`
            console.log("[opening search]")
            document.querySelector("${this.SELECTORS.OPEN_SEARCH}")?.closest("a")?.click()
        `);
    }

    async openNewPost(){
        console.log("executing code for open post creation")
        await Requests.executeBrowserCommand(`
            console.log("[opening search]")
            document.querySelector("${this.SELECTORS.OPEN_POST_CREATION}")?.closest("a")?.click()
        `);
    }
    async clickConfirmPostCreationIfPresent(){
        await Requests.executeBrowserCommand(`
            document.querySelector("${this.SELECTORS.CREATE_POST_CONFIRM_BUTTON}")?.closest("a")?.click()
        `);
    }

    async postCreationOpenCutSection(){
        await Requests.executeBrowserCommand(`
            document.querySelector("${this.SELECTORS.CREATE_POST_CUT_SECTION}")?.closest("button")?.click()
        `);
    }
    async postCreationCutSectionOriginalDimensions(){
        await Requests.executeBrowserCommand(`
            document.querySelector("${this.SELECTORS.CREATE_POST_CUT_SECTION_ORIGINAL_DIMENSIONS}")?.closest("[role='button']")?.click()
        `);
    }

    async type(selector, text, delay){
        await Requests.executeBrowserCommand(`
            function typeInInput(selector, text, delay = 100) {
                const input = document.querySelector(selector);
                if (!input) return;
                input.focus();
                let i = 0;
                function typeChar() {
                    if (i < text.length) {
                        const event = new Event('input', { bubbles: true });
                        input.value += text[i];
                        input.dispatchEvent(event);
                        i++;
                        setTimeout(typeChar, Math.max(50, (Math.random()*delay)) );
                    }
                }
                typeChar();
            }
            typeInInput(\`${selector}\`, \`${text}\`, ${delay})
        `)
        console.log("SLEEPING=", (text.length*delay) + delay);
        await Utils.sleep((text.length*delay) + delay)
    }

    async simulateImageDragAndDrop( url ) {

        fetch(url)
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then( async buffer => {

            let name = url.endsWith("mp4") ? "video.mp4" : "image.jpeg"
            let type = url.endsWith("mp4") ? "video/mp4" : "image/jpeg"

            await Requests.executeBrowserCommand(`
            ( async () => {
                try {
                    const buffer = ${JSON.stringify(Array.from(new Uint8Array(buffer)))}
                    const uint8Array = new Uint8Array(buffer);
                    const blob = new Blob([uint8Array], { type: "${type}" });

                    const file = new File([blob], "${name}", {
                        type: blob.type,
                        lastModified: new Date()
                    });
                
                    const dropTarget = document.querySelector('body');
                
                    if (!dropTarget) {
                        alert("Nessun drop target trovato.");
                        return;
                    }
                
                    // Prepara il DataTransfer con l'immagine
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                
                    // Simula dragenter, dragover e drop
                    const fireEvent = (type) => {
                        const event = new DragEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: dataTransfer
                        });
                        dropTarget.dispatchEvent(event);
                    };
                
                    fireEvent("dragenter");
                    fireEvent("dragover");
                    fireEvent("drop");
                
                    console.log("Drag & drop immagine simulato da URL");
            
                } catch (error) {
                    console.error("Errore nel fetch dell'immagine:", error);
                }
            })()`)


        });
    }

    async clickNextStepInPostCreation(){ //TESTO-IT
        let timeout = 10_000;
        while(timeout>0){
            let r = await Requests.executeBrowserCommand(`
                let divs = Array.from(document.querySelectorAll("[role='dialog'] div"));
                let el = divs.find(div => div.textContent == "Avanti") || divs.find(div => div.textContent == "Condividi");
                if(el){
                    el.querySelector("[role='button']").click();
                    el != null;
                } else {
                    undefined;
                }
            `)
            //console.log("Resposne: ", r, r);
            if(r) return;
            await Utils.sleep(500);
            timeout -= 500;
        }

        
    }

    async typeInSearch(text){
        var code =  `
        {
            console.log("Sending message", "${text}");
            let element = document.querySelector("${this.SELECTORS.SEARCH_INPUT}")
            element.value = "${text}"
            
            let reactProps = Object.keys(element).find(key => key.startsWith("__reactProps$"));
            console.log("reactProps=", reactProps);
            element[reactProps].onChange({target:element});
            console.log("Wrote message");
        }
        `
        await this.injectCode(code);
    }

    extractHashtags(text) {
        const matches = text.match(/#[\wàèéìòùçÀÈÉÌÒÙÇ_]+/g);
        return matches ? matches : [];
    }

    async typeInCaption(text){

        /*let hashtags = this.extractHashtags(text);
        var code = `
        let e = document.querySelector("${this.SELECTORS.POST_CAPTION}");
        let reactProps = Object.keys(e).find(key => key.startsWith("__reactFiber$"));
        let editor = e[reactProps].return.memoizedProps.editor;

        function generateLexicalStateWithHashtags(text, hashtags) {
            const parts = [];
            let remainingText = text;

            // Ordina gli hashtag più lunghi prima per evitare match parziali
            const sortedTags = [...hashtags].sort((a, b) => b.length - a.length);

            while (remainingText.length > 0) {
                let found = false;

                for (const tag of sortedTags) {
                if (remainingText.startsWith(tag)) {
                    parts.push({
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: tag,
                    type: 'hashtag',
                    version: 1,
                    });
                    remainingText = remainingText.slice(tag.length);
                    found = true;
                    break;
                }
                }

                if (!found) {
                // Trova il prossimo hashtag o fine del testo
                const nextTagIndex = sortedTags
                    .map(tag => remainingText.indexOf(tag))
                    .filter(i => i !== -1)
                    .sort((a, b) => a - b)[0];

                const cutIndex = nextTagIndex !== undefined ? nextTagIndex : remainingText.length;
                const plainText = remainingText.slice(0, cutIndex);

                parts.push({
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: plainText,
                    type: 'text',
                    version: 1,
                });

                remainingText = remainingText.slice(cutIndex);
                }
            }

            return {
                root: {
                type: 'root',
                version: 1,
                format: '',
                indent: 0,
                direction: 'ltr',
                children: [
                    {
                    type: 'paragraph',
                    version: 1,
                    format: '',
                    indent: 0,
                    direction: 'ltr',
                    children: parts,
                    },
                ],
                },
            };
        }

        const lexicalJSON = generateLexicalStateWithHashtags(\\\`${text}\\\`, ${JSON.stringify(hashtags)});
        // Poi puoi fare:
        editor.setEditorState(editor.parseEditorState(lexicalJSON));
        `
        await this.injectCode(code);*/
        console.log("getting coordinats")
        let {x,y} = await Requests.executeBrowserCommand(`document.querySelector("${this.SELECTORS.POST_CAPTION}").getBoundingClientRect()`);
        console.log("writing caption", x, y);
        await fetch(Settings.INPUTS_SERVER + `/click?x=${x+10}&y=${y+10}`)
        await fetch(Settings.INPUTS_SERVER + "/type", {
            method: "post",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: text
            })
        })
        
    }

    async injectCode(code){
        await Requests.executeBrowserCommand(`
            var actualCode = \`${code}\`;
            var script = document.createElement('script');
            script.textContent = actualCode;
            (document.head||document.documentElement).appendChild(script);
            script.remove();
        `)
    }
    
    
}
export default RequestsUtils;