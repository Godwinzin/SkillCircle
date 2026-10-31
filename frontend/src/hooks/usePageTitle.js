import { useEffect } from "react";

const DEFAULT_TITLE = "SkillCircle – Learn together, grow faster";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · SkillCircle` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}