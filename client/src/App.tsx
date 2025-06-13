import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Schedules from "@/pages/Schedules";
import Records from "@/pages/Records";
import Assessments from "@/pages/Assessments";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import ParentCommunications from "@/pages/ParentCommunications";
import Notifications from "@/pages/Notifications";
import DataManagement from "@/pages/DataManagement";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import ChatBot from "@/components/ChatBot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="로딩 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header />}
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/schedules" component={Schedules} />
            <Route path="/records" component={Records} />
            <Route path="/assessments" component={Assessments} />
            <Route path="/students/:studentName" component={StudentDetail} />
            <Route path="/students" component={Students} />
            <Route path="/reports" component={Reports} />
            <Route path="/parent-communications" component={ParentCommunications} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/data-management" component={DataManagement} />
            <Route path="/settings" component={Settings} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      {isAuthenticated && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
