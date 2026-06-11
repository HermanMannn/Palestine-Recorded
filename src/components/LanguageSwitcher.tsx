import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { language, switchLanguage } = useTranslation();

  return (
    <Select value={language} onValueChange={(value) => switchLanguage(value as 'en' | 'ar')}>
      <SelectTrigger className="w-[140px] flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
}
