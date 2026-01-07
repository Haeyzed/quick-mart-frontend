"use client"

import { fonts } from "@/config/fonts"
import { cn } from "@/lib/utils"
import { useFont } from "@/context/font-provider"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fontLabels: Record<string, string> = {
  'outfit': 'Outfit',
  'inter': 'Inter',
  'noto-sans': 'Noto Sans',
  'figtree': 'Figtree',
  'roboto': 'Roboto',
  'raleway': 'Raleway',
  'dm-sans': 'DM Sans',
  'public-sans': 'Public Sans',
  'jetbrains-mono': 'JetBrains Mono',
}

export function FontSelector({ className }: React.ComponentProps<"div">) {
  const { font, setFont } = useFont()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor="font-selector" className="sr-only">
        Font
      </Label>
      <Select value={font} onValueChange={(value) => setFont(value as typeof font)}>
        <SelectTrigger
          id="font-selector"
          className="bg-secondary text-secondary-foreground border-secondary justify-start shadow-none w-full"
        >
          <span className="font-medium">Font:</span>
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent align="end" className="w-[200px]">
          {fonts.map((fontOption) => (
            <SelectItem
              key={fontOption}
              value={fontOption}
              className="cursor-pointer"
            >
              <div className="text-sm font-medium">
                {fontLabels[fontOption] || fontOption}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

