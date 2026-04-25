import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: ContainerProps) {

  return (

    <div className={`mx-auto max-w-7xl px-6 md:px-10 ${className}`}>
      {children}
    </div>

  );

}