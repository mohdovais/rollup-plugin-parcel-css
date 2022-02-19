import { wrapper } from "./main.module.css";
import "./global.css";

import("./module-b").then((module) => module.colorMeRed());

console.log(wrapper);
