import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				outline:
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				"gateway-and":
					"bg-[#98FB98] text-foreground shadow hover:bg-[#98FB98]/90",
				"gateway-xor":
					"bg-[#87CEEB] text-foreground shadow hover:bg-[#87CEEB]/90",
				"gateway-mixed":
					"bg-[#FFB6C1] text-foreground shadow hover:bg-[#FFB6C1]/90",
				"gateway-default":
					"bg-[#DDDDDD] text-foreground shadow hover:bg-[#DDDDDD]/90",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, onClick, ...rest }, ref) => {
		const Comp = asChild ? Slot : "button";
		const buttonClass = useMemo(
			() => cn(buttonVariants({ variant, size, className })),
			[variant, size, className]
		);
		return (
			<Comp
				className={buttonClass}
				ref={ref}
				onClick={onClick}
				{...rest}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
