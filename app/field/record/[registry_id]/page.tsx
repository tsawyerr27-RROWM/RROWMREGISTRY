import { FieldRouteStub } from "@/components/Field/FieldRouteStub";

type Props = {
  params: Promise<{ registry_id: string }>;
};

export default async function FieldRecordPage({ params }: Props) {
  await params;
  return (
    <FieldRouteStub
      titleKey="field.record.title"
      descriptionKey="field.stub.preparing"
    />
  );
}
