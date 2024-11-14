'use server';
import { signIn } from "next-auth/react";

export async function SignIn() {
    return await signIn('google');
}
