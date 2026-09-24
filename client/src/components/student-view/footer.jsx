function StudentViewFooter() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="page-wrap flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-semibold text-foreground">Elearn Adda</p>
        <p>Learn in-demand skills with structured video courses.</p>
        <p>© {new Date().getFullYear()} Elearn Adda</p>
      </div>
    </footer>
  );
}

export default StudentViewFooter;
