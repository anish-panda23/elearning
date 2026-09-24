import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import StudentViewFooter from "./footer";
import { AICourseAssistantWidget } from "@/components/AICourseAssistantWidget";

function StudentViewCommonLayout() {
  const location = useLocation();
  const isPlayer = location.pathname.includes("course-progress");

  return (
    <div className="flex min-h-screen flex-col relative">
      {!isPlayer ? <StudentViewCommonHeader /> : null}
      <div className="flex-1">
        <Outlet />
      </div>
      {!isPlayer ? <StudentViewFooter /> : null}
      <AICourseAssistantWidget />
    </div>
  );
}

export default StudentViewCommonLayout;

