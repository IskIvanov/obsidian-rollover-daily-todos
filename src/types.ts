import type { moment, TFile } from "obsidian";

export interface RolloverSettings {
  templateHeading: string;
  deleteOnComplete: boolean;
  removeEmptyTodos: boolean;
  rolloverChildren: boolean;
  rolloverOnFileCreate: boolean;
  doneStatusMarkers: string;
  leadingNewLine: boolean;
}

export interface UndoDay {
  file: TFile | undefined;
  oldContent: string;
}

export interface UndoHistoryInstance {
  previousDay: UndoDay;
  today: UndoDay;
}

// Obsidian exposes these at runtime but leaves them out of its public typings
declare module "obsidian" {
  interface App {
    internalPlugins: {
      plugins: Record<string, { enabled: boolean } | undefined>;
    };
    plugins: {
      getPlugin(
        id: string
      ): { settings?: { daily?: { enabled?: boolean } } } | null;
    };
  }
}

declare global {
  interface Window {
    moment: typeof moment;
  }
}
