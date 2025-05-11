import MemoryWizardForm from "@/components/wizard/MemoryWizardForm";

export default function WizardAsHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <MemoryWizardForm />
    </div>
  );
}
