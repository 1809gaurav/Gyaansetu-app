import { useLocation } from "wouter";

interface BottomNavigationProps {
  currentPage: "home" | "quiz" | "analytics" | "profile" | "lessons" | "notes";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navigationItems = [
    {
      key: "home",
      path: "/",
      icon: "fas fa-home",
      label: "Home",
      ariaLabel: "Home page"
    },
    {
      key: "quiz",
      path: "/quiz",
      icon: "fas fa-question-circle",
      label: "Quiz",
      ariaLabel: "Quiz sections"
    },
    {
      key: "lessons",
      path: "/lessons",
      icon: "fas fa-video",
      label: "Videos",
      ariaLabel: "Video lessons"
    },
    {
      key: "notes",
      path: "/notes",
      icon: "fas fa-file-alt",
      label: "Notes",
      ariaLabel: "Study notes"
    },
    {
      key: "analytics",
      path: "/analytics",
      icon: "fas fa-chart-bar",
      label: "Stats",
      ariaLabel: "Performance analytics"
    },
    {
      key: "profile",
      path: "/profile",
      icon: "fas fa-user",
      label: "Me",
      ariaLabel: "User profile"
    }
  ];

  const handleNavigation = (path: string, label: string) => {
    setLocation(path);
    
    // Announce navigation for screen readers
    const announcement = document.getElementById("current-announcement");
    if (announcement) {
      announcement.textContent = `Navigated to ${label}`;
    }
  };

  return (
    <nav 
      className="bg-card border-t border-border px-6 py-3" 
      role="navigation" 
      aria-label="Main navigation"
      data-testid="bottom-navigation"
    >
      <div className="flex justify-around items-center">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors touch-target ${
              currentPage === item.key 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleNavigation(item.path, item.label)}
            aria-label={item.ariaLabel}
            aria-current={currentPage === item.key ? "page" : undefined}
            data-testid={`nav-${item.key}`}
          >
            <i className={`${item.icon} text-xl`} aria-hidden="true"></i>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
