"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"


export function Filter({
  available,
  selected,
  setSelected,
  name
}) {
  

  const [open, setOpen] = useState(false)
  const togglePlatform = (platform) => {
    if (selected.includes(platform)) {
      // Se tutte le piattaforme stanno per essere deselezionate, non fare nulla
      if (selected.length === 1) {
        return
      }
      setSelected(selected.filter((p) => p !== platform))
    } else {
      setSelected([...selected, platform])
    }
  }

  return (
    <div className="mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selected.length === available.length
              ? "Tutte le " + name 
              : `${selected.length} ${name} selezionate`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Cerca ${name}...`} />
            <CommandList>
              <CommandEmpty>Nessuna {name} trovata.</CommandEmpty>
              <CommandGroup>
                {available.map((platform) => (
                  <CommandItem key={platform} value={platform} onSelect={() => togglePlatform(platform)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selected.includes(platform) ? "opacity-100" : "opacity-0")}
                    />
                    {platform}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

