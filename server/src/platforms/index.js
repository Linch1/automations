import Instagram from "./Instagram"

class PlatformClass {
    INSTAGRAM="instagram"
    
    get(platform){
        switch(platform){
            case this.INSTAGRAM:
                return Instagram
            default:
                return null;
        }
    }
}
export default new PlatformClass()