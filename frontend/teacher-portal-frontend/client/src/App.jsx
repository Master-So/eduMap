import { Route, Switch, Redirect } from "wouter";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import CreateQuizPage from "./pages/CreateQuizPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Quiz from './Quiz.jsx';
import Analytics from './Analytics.jsx';

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/overview"><ProtectedRoute><DashboardLayout><OverviewPage /></DashboardLayout></ProtectedRoute></Route>
      <Route path="/dashboard/students"><ProtectedRoute><DashboardLayout><StudentsPage /></DashboardLayout></ProtectedRoute></Route>
      <Route path="/dashboard/create-quiz"><ProtectedRoute><DashboardLayout><CreateQuizPage /></DashboardLayout></ProtectedRoute></Route>
      <Route path="/dashboard/reports"><ProtectedRoute><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute></Route>
      <Route path="/404" component={NotFoundPage} />
      <Route><NotFoundPage /></Route>
    </Switch>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
