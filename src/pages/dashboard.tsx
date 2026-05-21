import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, Wand2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskBoard } from "@/components/TaskBoard";
import { CalendarBoard } from "@/components/CalendarBoard";
import { UserMenu } from "@/components/UserMenu";
import { PROFILE_KEY } from "@/components/UserMenu";
import { DragProvider } from "@/context/DragContext";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [findFreeCounter, setFindFreeCounter] = useState(0);

  const handleFindFreeClose = useCallback(() => {
    setFindFreeCounter(0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLocation("/auth");
      return;
    }
    queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
  }, [setLocation, queryClient]);

  return (
    <DragProvider>
    <div className="min-h-screen bg-mesh flex flex-col relative">
      {/* Top Nav */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Intelligent Scheduler</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-white/20">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming in Sprint 5</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFindFreeCounter((c) => c + 1)}
                className="rounded-full w-9 h-9 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 hover:from-emerald-400/30 hover:to-teal-500/30 border border-emerald-300/30 hover:border-emerald-300/60 hover:shadow-md hover:shadow-emerald-300/20 transition-all duration-200"
              >
                <Wand2 className="w-4.5 h-4.5 text-emerald-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="glass-card text-gray-800">
              <p>Find free time</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="h-8 w-px bg-white/30 mx-1" />
          
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 h-[calc(100vh-64px)]">
        {/* Left Pane - Backlog */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Backlog</h2>
          </div>
          <div className="flex-1 glass-card p-4 overflow-hidden relative">
             <TaskBoard />
          </div>
        </div>

        {/* Right Pane - Calendar */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Weekly Schedule</h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <CalendarBoard findFreeTrigger={findFreeCounter} onFindFreeClose={handleFindFreeClose} />
          </div>
        </div>
      </main>

    </div>
    </DragProvider>
  );
}
