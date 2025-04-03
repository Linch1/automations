import { execSync } from 'child_process';
import path from "path";
const desktop = execSync('xdg-user-dir DESKTOP').toString().trim();
class Paths {
    CONFIG_PATH=path.join(desktop, "client_config.json");
}
export default new Paths()