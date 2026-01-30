import { useState, useEffect } from "react";
import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoLesson {
  id: string;
  title: string;
  hindiTitle: string;
  youtubeId: string;
  duration: string;
  category: string;
}

const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: "1",
    title: "SSC CGL Strategy for Beginners",
    hindiTitle: "SSC CGL की तैयारी कैसे शुरू करें",
    youtubeId: "kYPX_h7vKJs",
    duration: "18:45",
    category: "Strategy"
  },
  {
    id: "2",
    title: "Complete GS Playlist for Exams",
    hindiTitle: "परीक्षाओं के लिए संपूर्ण सामान्य अध्ययन",
    youtubeId: "PL22tVRPdgORGLpQe02TNsGj0B-ECBRslG",
    duration: "Playlist",
    category: "General Studies"
  }
];

export default function Lessons() {
  const [currentLanguage, setCurrentLanguage] = useState<"english" | "hindi">("english");
  const { speak } = useTTS();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('gyansetu-language') as "english" | "hindi" | null;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleVideoClick = (video: VideoLesson) => {
    const message = currentLanguage === "english" 
      ? `Opening video: ${video.title}. Navigating to YouTube.`
      : `वीडियो खोल रहा हूँ: ${video.hindiTitle}. यूट्यूब पर जा रहा हूँ।`;
    
    speak(message, currentLanguage);
    
    const url = video.youtubeId.startsWith("PL") 
      ? `https://www.youtube.com/playlist?list=${video.youtubeId}`
      : `https://www.youtube.com/watch?v=${video.youtubeId}`;
      
    window.open(url, "_blank");
  };

  return (
    <div className="gyansetu-container">
      <TricolorHeader />
      
      <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
        <h1 className="text-2xl font-bold">
          {currentLanguage === "english" ? "Video Lessons" : "वीडियो पाठ"}
        </h1>

        <div className="grid grid-cols-1 gap-4">
          {VIDEO_LESSONS.map((video) => (
            <Card 
              key={video.id} 
              className="gyansetu-card overflow-hidden hover-elevate cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              <div className="relative aspect-video bg-muted">
                <img 
                  src={video.youtubeId.startsWith("PL") 
                    ? `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500&auto=format&fit=crop` 
                    : `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={currentLanguage === "english" ? video.title : video.hindiTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white">
                    <i className="fas fa-play text-xl" aria-hidden="true"></i>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                  {video.category}
                </div>
                <h3 className="font-semibold text-base leading-tight">
                  {currentLanguage === "english" ? video.title : video.hindiTitle}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation currentPage="lessons" />
    </div>
  );
}
