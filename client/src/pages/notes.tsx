import { useState } from "react";
import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/use-tts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const STUDY_NOTES = [
  {
    category: "Ancient India",
    topics: [
      {
        title: "Lithic Age (Stone Age)",
        content: "Ancient India can be studied under heads like Paleolithic, Mesolithic, Neolithic and Chalcolithic Period. Paleolithic (30,00,000 BC - 10,000 BC): Hunters and food gatherers using tools like Hand Axe, cleaver, and Flake. Mesolithic (9000 BC - 4000 BC): Hunters and Herders using Microlithic implements. Neolithic (1000 BC - 1000 BC): Food producers using polished implements."
      },
      {
        title: "Harappan Civilization (Indus)",
        content: "2,500 B.C – 1,750 BC. First discovered by Dayaram Sahni in 1921. Key features: Systematic town planning on grid system, burnt bricks, underground drainage. Important cities: Harappa (Ravi river), Mohenjodaro (Indus river - Great Bath, Granary), Lothal (Port city, rice cultivation evidence), Kalibangan (ploughed fields)."
      },
      {
        title: "Vedic Culture",
        content: "The Rig Veda is the oldest text in the world, containing 1028 hymns and 10,560 verses divided into 10 mandalas. It contains the famous Gayatri Mantra. The Yajur Veda is a Ritual Veda divided into Krishna and Shukla parts."
      }
    ]
  },
  {
    category: "Indian Polity",
    topics: [
      {
        title: "Making of the Constitution",
        content: "The Constitution of India was framed by the Constituent Assembly. It features a Preamble, Fundamental Rights, and Directive Principles of State Policy. Key schedules and parts define the Union and its territory, citizenship, and the powers of the President, Prime Minister, and Parliament."
      }
    ]
  },
  {
    category: "Geography",
    topics: [
      {
        title: "Physiography of India",
        content: "Includes the drainage system (rivers), Indian climate and soils, natural vegetation, wildlife, and mineral resources across the subcontinent."
      }
    ]
  }
];

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const { speak } = useTTS();

  const filteredNotes = STUDY_NOTES.map(section => ({
    ...section,
    topics: section.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.topics.length > 0);

  return (
    <div className="gyansetu-container">
      <TricolorHeader />
      
      <main className="flex-1 px-4 py-6 space-y-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-bold">Study Notes</h1>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => speak("Study Notes page. Browse through summarized notes for History, Polity, and Geography.")}
            data-testid="button-speak-notes-desc"
          >
            <i className="fas fa-volume-up text-xl" />
          </Button>
        </div>

        <div className="relative px-2">
          <Search className="absolute left-5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-notes"
          />
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-6 pb-20">
            {filteredNotes.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-lg font-bold text-primary border-l-4 border-primary pl-2 uppercase tracking-wide">
                  {section.category}
                </h2>
                {section.topics.map((topic, tIdx) => (
                  <Card key={tIdx} className="hover-elevate">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between gap-2">
                      <CardTitle className="text-md font-semibold">{topic.title}</CardTitle>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => speak(`${topic.title}. ${topic.content}`)}
                        data-testid={`button-read-note-${idx}-${tIdx}`}
                      >
                        <i className="fas fa-play text-xs" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {topic.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No notes found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <BottomNavigation currentPage="notes" />
    </div>
  );
}
