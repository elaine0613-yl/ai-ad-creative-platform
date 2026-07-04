import { redirect } from "next/navigation";

export default function ImageReplicateRedirectPage() {
  redirect("/image/create?mode=replicate");
}
