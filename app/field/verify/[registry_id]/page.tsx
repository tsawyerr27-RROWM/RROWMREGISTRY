import { FieldRouteStub } from "@/components/Field/FieldRouteStub";

type Props = {
  params: Promise<{ registry_id: string }>;
};

export default async function FieldVerifyRecordPage({ params }: Props) {
  await params;
  return (
    <FieldRouteStub
      titleKey="field.verify.record.title"
      descriptionKey="field.stub.preparing"
    />
  );
}
