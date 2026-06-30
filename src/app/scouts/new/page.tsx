import Shell from "@/components/Shell";
import NewScoutForm from "@/components/NewScoutForm";

export default function NewScoutPage() {
  return (
    <Shell leaderName="Leader">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-display text-2xl text-forest-dark">New scout application</h1>
        <p className="mb-5 text-sm text-charcoal/60">
          Add a scout&apos;s details to create their profile.
        </p>
        <NewScoutForm />
      </div>
    </Shell>
  );
}
