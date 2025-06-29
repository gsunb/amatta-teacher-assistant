import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import type { Class } from "@shared/schema";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Schedules from "@/pages/Schedules";
import Records from "@/pages/Records";
import Assessments from "@/pages/Assessments";
import Classes from "@/pages/Classes";
import StudentDetail from "@/pages/StudentDetail";
import Reports from "@/pages/Reports";
import StudentReports from "@/pages/StudentReports";
import Settings from "@/pages/Settings";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ParentCommunications from "@/pages/ParentCommunications";
import DataManagement from "@/pages/DataManagement";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay";
import ChatBot from "@/components/ChatBot";
import ConsentModal from "@/components/ConsentModal";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch user's classes to check if onboarding is needed
  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
  });

  if (isLoading || (isAuthenticated && classesLoading)) {
    return <LoadingOverlay message="로딩 중..." />;
  }

  // Check if authenticated user needs to complete consent
  const needsConsent = isAuthenticated && user && (user as any).hasRequiredConsents === false;
  
  // Check if user needs onboarding (no classes created yet)
  const needsOnboarding = isAuthenticated && !needsConsent && classes.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!isAuthenticated ? (
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route component={NotFound} />
        </Switch>
      ) : needsConsent ? (
        <>
          <ConsentModal 
            isOpen={true} 
            onConsentComplete={() => {
              // Refresh user data after consent completion
              queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              // Show onboarding after consent completion
              setShowOnboarding(true);
            }} 
          />
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amatta 서비스 이용 동의</h2>
              <p className="text-gray-600 mb-6">안전한 서비스 이용을 위해 약관 및 개인정보 처리방침 동의가 필요합니다.</p>
              <div className="text-sm text-gray-500">
                문의: amatta.edu@gmail.com
              </div>
            </div>
          </div>
        </>
      ) : needsOnboarding || showOnboarding ? (
        <Onboarding 
          onComplete={() => {
            setShowOnboarding(false);
            queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
          }} 
        />
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
              <Route path="/privacy-policy" component={PrivacyPolicy} />
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
