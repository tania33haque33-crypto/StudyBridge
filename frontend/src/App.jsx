import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import Applications from './pages/dashboard/Applications';
import CreateApplication from './pages/dashboard/CreateApplication';
import ApplicationDetail from './pages/dashboard/ApplicationDetail';
import SavedUniversities from './pages/dashboard/SavedUniversities';
import SavedScholarships from './pages/dashboard/SavedScholarships';
import Notifications from './pages/dashboard/Notifications';
import MyStudyProfile from './pages/dashboard/MyStudyProfile';
import MyDiscussions from './pages/dashboard/MyDiscussions';
import UniversitySearch from './pages/universities/UniversitySearch';
import UniversityDetail from './pages/universities/UniversityDetail';
import CompareUniversities from './pages/universities/CompareUniversities';
import ScholarshipSearch from './pages/scholarships/ScholarshipSearch';
import ScholarshipDetail from './pages/scholarships/ScholarshipDetail';
import VisaGuides from './pages/visa/VisaGuides';
import VisaGuideDetail from './pages/visa/VisaGuideDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UniversityManagement from './pages/admin/UniversityManagement';
import ReviewModeration from './pages/admin/ReviewModeration';
import Analytics from './pages/admin/Analytics';
import DiscussionHub from './pages/discussions/DiscussionHub';
import DiscussionDetail from './pages/discussions/DiscussionDetail';
import UniversityFinder from './pages/finder/UniversityFinder';
import StudentCommunity from './pages/community/StudentCommunity';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="universities" element={<UniversitySearch />} />
        <Route path="universities/:slug" element={<UniversityDetail />} />
        <Route path="compare-universities" element={<CompareUniversities />} />
        <Route path="scholarships" element={<ScholarshipSearch />} />
        <Route path="scholarships/:id" element={<ScholarshipDetail />} />
        <Route path="visa-guides" element={<VisaGuides />} />
        <Route path="visa-guides/:country" element={<VisaGuideDetail />} />
        <Route path="discussions" element={<DiscussionHub />} />
        <Route path="discussions/:id" element={<DiscussionDetail />} />
        <Route path="university-finder" element={<UniversityFinder />} />
        <Route path="community" element={<StudentCommunity />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/new" element={<CreateApplication />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="saved-universities" element={<SavedUniversities />} />
          <Route path="saved-scholarships" element={<SavedScholarships />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="study-profile" element={<MyStudyProfile />} />
          <Route path="my-discussions" element={<MyDiscussions />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="universities" element={<UniversityManagement />} />
          <Route path="reviews" element={<ReviewModeration />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;