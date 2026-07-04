import { redirect } from "next/navigation";

export default function VideoReplicateRedirectPage() {
  redirect("/video/create?mode=replicate");
}
