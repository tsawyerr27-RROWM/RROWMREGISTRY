import {
  opportunityEligibilityDisplayLabels,
  type OpportunityEligibilityFields,
} from "@/lib/opportunity-eligibility";

type Props = {
  eligibility: OpportunityEligibilityFields;
  variant?: "default" | "prose";
};

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-neutral-800">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function FieldOpportunityEligibilityPanel({
  eligibility,
  variant = "default",
}: Props) {
  const labels = opportunityEligibilityDisplayLabels(eligibility);
  const notes = eligibility.eligibility_notes?.trim() || null;
  const showInvitationOnly = eligibility.invitation_only !== null;
  const isProse = variant === "prose";

  return (
    <section
      className={
        isProse
          ? "mt-16 md:mt-20"
          : "mt-16 max-w-3xl border-t border-neutral-900/[0.06] pt-16 md:mt-20 md:pt-20"
      }
    >
      <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">Eligibility</h2>
      <div className="mt-8 space-y-8">
        {labels.disciplines.length > 0 ? (
          <div>
            <p className="text-sm text-neutral-500">Disciplines</p>
            <BulletList items={labels.disciplines} />
          </div>
        ) : null}

        {labels.locations.length > 0 ? (
          <div>
            <p className="text-sm text-neutral-500">Location</p>
            <BulletList items={labels.locations} />
          </div>
        ) : null}

        {labels.careerStages.length > 0 ? (
          <div>
            <p className="text-sm text-neutral-500">Career stage</p>
            <BulletList items={labels.careerStages} />
          </div>
        ) : null}

        {notes ? (
          <div>
            <p className="text-sm text-neutral-500">Notes</p>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700">
              {notes}
            </p>
          </div>
        ) : null}

        {showInvitationOnly ? (
          <div>
            <p className="text-sm text-neutral-500">Invitation only</p>
            <BulletList items={[eligibility.invitation_only ? "Yes" : "No"]} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
