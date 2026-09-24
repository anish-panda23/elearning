import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDownIcon, Search, SlidersHorizontal } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";

function createSearchParamsHelper(filterParams, searchQuery) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams || {})) {
    if (Array.isArray(value) && value.length > 0) {
      queryParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
    }
  }

  if (searchQuery) {
    queryParams.push(`q=${encodeURIComponent(searchQuery)}`);
  }

  return queryParams.join("&");
}

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    const cpyFilters = { ...filters };
    const indexOfCurrentSeection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSeection === -1) {
      cpyFilters[getSectionId] = [getCurrentOption.id];
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  async function fetchAllStudentViewCourses(currentFilters, currentSort, query) {
    setLoadingState(true);
    const params = new URLSearchParams({
      ...currentFilters,
      sortBy: currentSort,
    });
    if (query) params.set("q", query);

    const response = await fetchStudentViewCourseListService(params);
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
    }
    setLoadingState(false);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    setSearchQuery((current) => (current ? current : qFromUrl));
  }, []);

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(
      filters,
      searchQuery
    );
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters, searchQuery]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort, searchQuery);
  }, [filters, sort, searchQuery]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  const results = studentViewCoursesList || [];

  return (
    <div className="page-wrap py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course catalog</h1>
          <p className="mt-1 text-muted-foreground">
            Filter by skill, level, and language
          </p>
        </div>
        <form
          className="relative w-full md:max-w-sm"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title"
            className="pl-9"
          />
        </form>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border bg-white p-4 shadow-sm md:w-64">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          {Object.keys(filterOptions).map((ketItem) => (
            <div className="border-b py-4 last:border-b-0" key={ketItem}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {ketItem}
              </h3>
              <div className="grid gap-2">
                {filterOptions[ketItem].map((option) => (
                  <Label
                    className="flex items-center gap-3 font-medium"
                    key={option.id}
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[ketItem] &&
                        filters[ketItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() =>
                        handleFilterOnChange(ketItem, option)
                      }
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {results.length} results
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDownIcon className="h-4 w-4" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {loadingState ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))
            ) : results.length > 0 ? (
              results.map((courseItem) => (
                <Card
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="cursor-pointer overflow-hidden transition hover:shadow-md"
                  key={courseItem?._id}
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-52">
                      <img
                        src={courseItem?.image}
                        alt={courseItem?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-xl">
                        {courseItem?.title}
                      </CardTitle>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Created by{" "}
                        <span className="font-semibold text-foreground">
                          {courseItem?.instructorName}
                        </span>
                      </p>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {courseItem?.level}
                        </Badge>
                        <Badge variant="outline">
                          {courseItem?.curriculum?.length || 0} lectures
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        ${courseItem?.pricing}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No courses found"
                description="Try another search term or clear your filters."
                actionLabel="Clear search"
                onAction={() => setSearchQuery("")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
