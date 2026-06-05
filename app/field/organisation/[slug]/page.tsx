import { FieldRouteStub } from "@/components/Field/FieldRouteStub";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function FieldOrganisationPresencePage({ params }: Props) {
  await params;
  return (
    <FieldRouteStub
      titleKey="field.presence.organisation.title"
      descriptionKey="field.stub.preparing"
    />
  );
}
