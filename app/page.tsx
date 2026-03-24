import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LandingClient from "./landing-client";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <LandingClient />;
}
