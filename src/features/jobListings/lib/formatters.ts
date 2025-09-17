import { ExperienceLevel, JobListingStatus, JobListingType, LocationRequirement, WageInterval } from "@/app/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
    switch (interval) {
        case 'hourly':
            return 'Hour';
        case 'monthly':
            return 'Month';
        case 'yearly':
            return 'Year';
        default:
                throw new Error(`Invalid wage interval: ${interval}`);
    }
}

export function formatLocationRequirement(requirement: LocationRequirement) {
    switch (requirement) {
        case 'on-site':
            return 'On-Site';
        case 'hybrid':
            return 'Hybrid';
        case 'remote':
            return 'Remote';
        default:
            throw new Error(`Invalid location requirement: ${requirement}`);
    }
}

export function formatJobType(type: JobListingType) {
    switch (type) {
        case 'full-time':
            return 'Full-Time';
        case 'part-time':
            return 'Part-Time';
        case 'internship':
            return 'Internship';
        default:
            throw new Error(`Invalid job type: ${type}`);
    }
}

export function formatExperienceLevel(level: ExperienceLevel) {
    switch (level) {
        case 'junior':
            return 'Junior';
        case 'mid-level':
            return 'Mid-Level';
        case 'senior':
            return 'Senior';
        default:
            throw new Error(`Invalid experience level: ${level}`);
    }
}
export function formatJoblistingStatus(status: JobListingStatus) {
    switch (status) {
        case 'draft':
            return 'Draft';
        case 'published':
            return 'Active';
        case 'delisted':
            return 'Delisted';
        default:
            throw new Error(`Invalid job listing status: ${status}`);
    }
}

export function formatWage(wage: number, wageInterval: WageInterval) {
    const wageFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    })
  
    switch (wageInterval) {
      case "hourly": {
        return `${wageFormatter.format(wage)} / hr`
      }
      case "monthly": {
        return `${wageFormatter.format(wage)} / month`
      }
      case "yearly": {
        return wageFormatter.format(wage)
      }
      default:
        throw new Error(`Unknown wage interval: ${wageInterval satisfies never}`)
    }
  }
  
  export function formatJobListingLocation({
    stateAbbreviation,
    city,
  }: {
    stateAbbreviation: string | null
    city: string | null
  }) {
    if (stateAbbreviation == null && city == null) return "None"
  
    const locationParts = []
    if (city != null) locationParts.push(city)
    if (stateAbbreviation != null) {
      locationParts.push(stateAbbreviation.toUpperCase())
    }
  
    return locationParts.join(", ")
  }

  /**
   * Normalizes salary to annual equivalent for comparison
   * @param wage - The wage amount
   * @param wageInterval - The wage interval (hourly, monthly, yearly)
   * @returns Annual salary equivalent
   */
  export function normalizeToAnnualSalary(wage: number, wageInterval: WageInterval): number {
    switch (wageInterval) {
      case "hourly":
        // Assuming 40 hours/week * 52 weeks = 2080 hours/year
        return wage * 2080
      case "monthly":
        // 12 months per year
        return wage * 12
      case "yearly":
        return wage
      default:
        throw new Error(`Unknown wage interval: ${wageInterval satisfies never}`)
    }
  }