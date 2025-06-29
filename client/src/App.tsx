import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
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
import DataManagement from "@/pages/DataManagement";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import ChatBot from "@/components/ChatBot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="로딩 중..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!isAuthenticated ? (
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      ) : (
        <>
          <Header />
          <Sidebar />
          <div className="md:pl-64 pt-16 md:pt-0">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/schedules" component={Schedules} />
              <Route path="/records" component={Records} />
              <Route path="/assessments" component={Assessments} />
              <Route path="/students/:studentId" component={StudentDetail} />
              <Route path="/classes" component={Classes} />
              <Route path="/reports" component={Reports} />
              <Route path="/student-reports" component={StudentReports} />
              <Route path="/parent-communications" component={ParentCommunications} />
              <Route path="/data-management" component={DataManagement} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <ChatBot />
        </>
      )}
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
