import { redirect } from "next/navigation";

export default function TemplatesRedirect() {
  redirect("/knowledge?type=image");
}
