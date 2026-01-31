import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/use-tts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Info } from "lucide-react";

const EXAM_SCHEDULES = [
  {
    exam: "SSC CGL 2024",
    dates: "Sept - Oct 2024 (Tier-I)",
    pattern: "Tier-I: 100 Qs, 200 Marks, 60 Mins. Sections: Reasoning, GA, Quant, English.",
    status: "Tentative"
  },
  {
    exam: "SSC CHSL 2024",
    dates: "July 2024 (Tier-I)",
    pattern: "Tier-I: 100 Qs, 200 Marks, 60 Mins. Objective Type.",
    status: "Upcoming"
  },
  {
    exam: "SSC MTS 2024",
    dates: "Oct - Nov 2024",
    pattern: "Session I (Quant/Reasoning), Session II (GA/English).",
    status: "Tentative"
  }
];

export default function Schedules() {
  const { speak } = useTTS();

  return (
    <div className="gyansetu-container">
      <TricolorHeader />
      
      <main className="flex-1 px-4 py-6 space-y-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-bold">Exam Guide</h1>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => speak("Exam Guide page. View tentative dates and patterns for SSC CGL, CHSL, and MTS exams.")}
            data-testid="button-speak-schedules-desc"
          >
            <i className="fas fa-volume-up text-xl" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-6 pb-20">
            {EXAM_SCHEDULES.map((item, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between gap-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-bold">{item.exam}</CardTitle>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => speak(`${item.exam}. Date: ${item.dates}. Pattern: ${item.pattern}`)}
                    data-testid={`button-read-schedule-${idx}`}
                  >
                    <i className="fas fa-play text-xs" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <i className="fas fa-clock text-xs text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Exam Dates</p>
                      <p className="text-sm font-medium">{item.dates}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Exam Pattern</p>
                      <p className="text-sm leading-relaxed">{item.pattern}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {item.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>

      <BottomNavigation currentPage="schedules" />
    </div>
  );
}
