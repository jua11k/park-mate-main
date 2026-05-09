import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to a default tenant for demo purposes
  redirect("/demo");
}
