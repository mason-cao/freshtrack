import { restoreItem } from "@/db/items";
import { itemActionHandler } from "../../_lib";

export const POST = itemActionHandler(restoreItem);
