import { SelectItem } from "@/components/ui/select"
import states from "@/app/data/state.json"
export function StateSelectItems() {
  return Object.entries(states).map(([abbreviation, name]) => (
    <SelectItem key={abbreviation} value={abbreviation}>
      {name}
    </SelectItem>
  ))
}