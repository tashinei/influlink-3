const PlasmaBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-100 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-plasma" />
      <div className="absolute top-1/3 right-1/4 w-96 h-100 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-plasma" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-100 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-plasma" style={{ animationDelay: "4s" }} />
    </div>
  );
};

export default PlasmaBackground;
