import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Made by <span className="font-medium text-foreground">Kumar Sahil</span> (Dwary Intech)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a 
              href="https://www.linkedin.com/in/sahil-dwary/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn Profile
            </a>
            <span className="text-border">•</span>
            <a 
              href="mailto:sahilcharandwary@gmail.com"
              className="hover:text-primary transition-colors"
            >
              Suggestions: sahilcharandwary@gmail.com
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {currentYear} ImageLens Pro
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
