import { redirect } from "next/navigation";

// /projects/[id]/wizard → redirect to the first wizard step.
export default async function WizardEntry(
  props: PageProps<"/projects/[id]/wizard">,
) {
  const { id } = await props.params;
  redirect(`/projects/${id}/wizard/business-need`);
}
