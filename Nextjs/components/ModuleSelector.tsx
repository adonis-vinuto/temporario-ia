import { useModule } from "@/lib/context/ModuleContext";
import { Module, ModuleLabels, ModuleIcons } from "@/lib/enums/module";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModuleSelector() {
  const { currentModule, setCurrentModule } = useModule();

  return (
    <div className="flex items-center text-foreground">
      <Select
        value={String(currentModule)}
        onValueChange={(value) => setCurrentModule(Number(value) as Module)}
      >
        <SelectTrigger className="w-full px-5 py-2 rounded-md border-0 bg-white text-blue-950">
          <SelectValue placeholder="Select module" />
        </SelectTrigger>
        <SelectContent className="bg-card">
          {Object.values(Module)
            .filter((value) => typeof value === "number")
            .map((moduleValue) => {
              const value = moduleValue as number;
              const Icon = ModuleIcons[value];
              return (
                <SelectItem
                  key={value}
                  value={String(value)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {ModuleLabels[value]}
                  </div>
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    </div>
  );
}
