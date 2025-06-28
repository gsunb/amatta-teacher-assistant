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
import Classes from "@/pages/Classes";
import StudentDetail from "@/pages/StudentDetail";
import Reports from "@/pages/Reports";
import StudentReports from "@/pages/StudentReports";
import Settings from "@/pages/Settings";
import ParentCommunications from "@/pages/ParentCommunications";
import Attendance from "@/pages/Attendance";
import DataManagement from "@/pages/DataManagement";
import Sidebar from "@/components/Sidebar";
import LoadingOverlay from "@/components/LoadingOverlay";
import ChatBot from "@/components/ChatBot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="로딩 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Sidebar />
            <div className="md:pl-64">
              <Route path="/" component={Home} />
              <Route path="/schedules" component={Schedules} />
              <Route path="/records" component={Records} />
              <Route path="/assessments" component={Assessments} />
              <Route path="/students/:studentName" component={StudentDetail} />
              <Route path="/classes" component={Classes} />
              <Route path="/reports" component={Reports} />
              <Route path="/student-reports" component={StudentReports} />
              <Route path="/parent-communications" component={ParentCommunications} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/data-management" component={DataManagement} />
              <Route path="/settings" component={Settings} />
            </div>
            <ChatBot />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
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
