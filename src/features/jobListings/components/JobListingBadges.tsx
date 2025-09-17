import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatWage,
  formatJobListingLocation,
} from "../lib/formatters"
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCapIcon,
  HourglassIcon,
  MapPinIcon,
} from "lucide-react"
import { JobListingTable } from "@/app/drizzle/schema"

export function JobListingBadges({
  jobListing: {
    wage,
    wageInterval,
    stateAbbreviation,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured,
    skills,
  },
  className,
  showSkills = true,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "stateAbbreviation"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
    | "isFeatured"
    | "skills"
  >
  className?: string
  showSkills?: boolean
}) {
  const badgeProps = {
    variant: "outline",
    className,
  } satisfies ComponentProps<typeof Badge>

  return (
    <>
      {isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            "border-featured bg-featured/50 text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {wage != null && wageInterval != null && (
        <Badge {...badgeProps}>
          <BanknoteIcon className="size-5"      />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}
      {(stateAbbreviation != null || city != null) && (
        <Badge {...badgeProps}>
          <MapPinIcon className="size-4" />
          {formatJobListingLocation({ stateAbbreviation, city })}
        </Badge>
      )}
      <Badge {...badgeProps}>
        <BuildingIcon className="size-4" />
        {formatLocationRequirement(locationRequirement)}
      </Badge>
      <Badge {...badgeProps}>
        <HourglassIcon className="size-4" />
        {formatJobType(type)}
      </Badge>
      <Badge {...badgeProps}>
        <GraduationCapIcon className="size-5" />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
      {showSkills && skills && skills.length > 0 && (
        <>
          {skills.slice(0, 3).map((skill, index) => (
            <Badge 
              key={index} 
              {...badgeProps}
              className={cn(
                className,
                "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
              )}
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge 
              {...badgeProps}
              className={cn(
                className,
                "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400"
              )}
            >
              +{skills.length - 3} more
            </Badge>
          )}
        </>
      )}
    </>
  )
}