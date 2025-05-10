import MemoryWizardForm from "@/components/wizard/MemoryWizardForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wand2 } from "lucide-react";

export default function WizardAsHomePage() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl shadow-xl rounded-lg bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 overflow-hidden">
        <CardHeader className="text-center pt-8 pb-6 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 dark:bg-primary/30 p-3 rounded-full w-fit ring-2 ring-primary/40 dark:ring-primary/60">
              <Wand2 className="h-10 w-10 text-primary dark:text-primary-foreground" />
            </div>
            <div className="text-left">
              <CardTitle className="text-3xl font-bold text-foreground">
                Hello, Nick
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                What memory would you like to slide back to today today?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-card p-6 sm:p-8 rounded-b-lg">
          <MemoryWizardForm />
        </CardContent>
      </Card>
    </div>
  );
}
