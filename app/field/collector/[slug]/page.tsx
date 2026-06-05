import { FieldRouteStub } from "@/components/Field/FieldRouteStub";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function FieldCollectorPresencePage({ params }: Props) {
  await params;
  return (
    <FieldRouteStub
      titleKey="field.presence.collector.title"
      descriptionKey="field.stub.preparing"
    />
  );
}
