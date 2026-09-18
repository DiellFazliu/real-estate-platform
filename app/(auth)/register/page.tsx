import RegisterForm from "@/components/auth/RegisterForm";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  
  if (session?.user?.id) {
      redirect("/");
  }

  return <RegisterForm />;
}