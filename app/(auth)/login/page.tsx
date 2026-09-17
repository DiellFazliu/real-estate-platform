import LoginForm from "@/components/auth/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth();

    if (session?.user?.id) {
        redirect("/");
    }
  return <LoginForm />;
}