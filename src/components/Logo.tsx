
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-16"
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-primary rounded-lg p-3 mb-2">
        <img 
          src={localStorage.getItem('clinicLogo') || "/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png"}
          alt="My Clinic Logo" 
          className={`${sizeClasses[size]} w-auto mx-auto filter brightness-0 invert`}
        />
      </div>
      {showText && (
        <div className="text-blue-900 font-bold text-sm">
          My Clinic
        </div>
      )}
    </div>
  );
}
