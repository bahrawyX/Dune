import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { ReactNode } from "react";

export function RatingIcons({
    rating,
    className,
}:{
    rating: number | null,
    className?: string,
}){
    if (rating === null || rating <1 || rating >5) return "Unrated";
    const stars : ReactNode[] = [];
    for (let i = 0; i < rating; i++) {
        stars.push(<StarIcon key={i} className={cn("size-4",rating >= i &&"fill-current",className)} />);
        <Separator key={i} className="size-4" />
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {stars}
            <div className="sr-only">{rating} Stars Out Of 5</div>
        </div>
    )
}