// Side-effect import for the tsx database scripts. Import it before ./index,
// which reads DATABASE_URL as soon as it is evaluated.
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();
