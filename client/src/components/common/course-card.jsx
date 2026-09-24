import { Badge } from "@/components/ui/badge";

function CourseCard({
  image,
  title,
  instructorName,
  pricing,
  level,
  lectures,
  students,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No thumbnail
          </div>
        )}
        {level ? (
          <Badge className="absolute left-3 top-3 capitalize">{level}</Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{instructorName}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          {pricing != null && pricing !== "" ? (
            <p className="text-lg font-bold text-primary">
              ${Number(pricing || 0).toFixed(0)}
            </p>
          ) : (
            <p className="text-sm font-medium text-primary">Continue</p>
          )}
          <p className="text-xs text-muted-foreground">
            {lectures != null ? `${lectures} lectures` : null}
            {students != null ? ` · ${students} students` : null}
          </p>
        </div>
      </div>
    </button>
  );
}

export default CourseCard;
