import { GraduationCap, Search } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import TwoFactorAuthDialog from "../common/TwoFactorAuthDialog";


function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials, auth } = useContext(AuthContext);
  const [query, setQuery] = useState("");

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="page-wrap flex items-center gap-4 py-3">
        <Link to="/home" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-sm font-extrabold tracking-tight md:text-lg">
            Elearn Adda
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:block">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses, skills, or topics"
              className="h-10 rounded-full bg-muted/60 pl-9"
              aria-label="Search courses"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-3">
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `hidden rounded-md px-3 py-2 text-sm font-medium sm:inline-flex ${
                isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/student-courses"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`
            }
          >
            My learning
          </NavLink>
          <NavLink
            to="/certificates"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`
            }
          >
            Certificates
          </NavLink>
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 font-bold ${
                isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`
            }
          >
            Job Board 💼
          </NavLink>
          {auth?.user?.userName ? (
            <span className="hidden max-w-[120px] truncate text-sm text-muted-foreground lg:inline">
              Hi, {auth.user.userName}
            </span>
          ) : null}
          {auth?.authenticate ? <TwoFactorAuthDialog /> : null}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}


export default StudentViewCommonHeader;
