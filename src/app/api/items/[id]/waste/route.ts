import { completeItem } from "@/db/items";
import { itemActionHandler } from "../../_lib";

export const POST = itemActionHandler((id, userId) => completeItem(id, userId, "wasted"));
