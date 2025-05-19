
import React from "react";
import { Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const contacts = [
    "ellix.estandian@gmail.com",
    "johncedrickalingod021@gmail.com",
    "Mamanaoadrian@gmail.com",
    "alvarezdenzell9@gmail.com"
  ];

  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} MASIG. All rights reserved.
            </p>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Contact Us</p>
            <div className="flex flex-col gap-1.5">
              {contacts.map((email, index) => (
                <a 
                  key={index} 
                  href={`mailto:${email}`}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  <span>{email}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
