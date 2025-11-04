import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminMediaList from "@/pages/AdminMediaList";
import AdminNewMedia from "@/pages/AdminNewMedia";
import AdminEditMedia from "@/pages/AdminEditMedia";
import AdminCategories from "@/pages/AdminCategories";
import AdminUsers from "@/pages/AdminUsers";
import AdminSettings from "@/pages/AdminSettings";
import AdminServices from "@/pages/AdminServices";
import AdminNewService from "@/pages/AdminNewService";
import AdminEditService from "@/pages/AdminEditService";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/media" component={AdminMediaList} />
      <Route path="/admin/new" component={AdminNewMedia} />
      <Route path="/admin/edit/:id" component={AdminEditMedia} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/services/new" component={AdminNewService} />
      <Route path="/admin/services/:id/edit" component={AdminEditService} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
