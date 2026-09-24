import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-3xl font-bold">This page doesn’t exist</h1>
      <p className="max-w-md text-muted-foreground">
        The link may be broken, or the course you’re looking for has been moved.
      </p>
      <Button onClick={() => navigate("/home")}>Back to home</Button>
    </div>
  );
}

export default NotFoundPage;
