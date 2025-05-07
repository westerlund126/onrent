import { Roles } from "types/global";
import { auth } from "@clerk/nextjs/dist/types/server";

export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth();
    return sessionClaims?.metadata?.role === role;  
}