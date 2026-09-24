import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { BarChart, BookOpen, LogOut, GraduationCap, Sparkles, User, ShieldCheck, Briefcase } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import TwoFactorAuthDialog from "@/components/common/TwoFactorAuthDialog";
import StudentJobsPage from "../student/jobs";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { resetCredentials, auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard & Analytics",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: BookOpen,
      label: "Course Management",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Briefcase,
      label: "Job Placement Board",
      value: "jobs",
      component: <StudentJobsPage />,
    },
  ];

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Left Navigation Sidebar */}
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/90 backdrop-blur md:flex md:flex-col justify-between p-5">
        <div>
          {/* Brand logo */}
          <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-800 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">Elearn Adda</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Instructor Studio
              </span>
            </div>
          </div>

          {/* Instructor Profile Card */}
          <div className="mt-5 rounded-xl bg-slate-850 p-3 border border-slate-800 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white font-bold text-sm shadow">
              {auth?.user?.userName ? auth.user.userName[0].toUpperCase() : "I"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {auth?.user?.userName || "Instructor"}
              </p>
              <p className="truncate text-[11px] text-slate-400">{auth?.user?.userEmail}</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 space-y-1.5">
            {menuItems.map((menuItem) => (
              <button
                key={menuItem.value}
                onClick={() => setActiveTab(menuItem.value)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === menuItem.value
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <menuItem.icon className="h-4 w-4" />
                {menuItem.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <TwoFactorAuthDialog />
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent value={menuItem.value} key={menuItem.value}>
                {menuItem.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
