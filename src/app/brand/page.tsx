import { redirect } from "next/navigation";

export default function BrandRedirect() {
  redirect("/knowledge?type=image&category=brand-assets");
}
