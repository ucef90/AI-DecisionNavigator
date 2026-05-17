import { redirect } from "next/navigation";

// La landing atelier 7 redirige directement vers le cockpit exécutif
// (= la vue par défaut, l'utilisateur ne perd pas de temps en lobby).
export default async function Atelier7LandingPage(
  props: PageProps<"/projects/[id]/atelier/7">,
) {
  const { id } = await props.params;
  redirect(`/projects/${id}/atelier/7/executive-cockpit`);
}
