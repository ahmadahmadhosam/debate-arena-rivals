
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸', dialCode: '+970' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦', dialCode: '+966' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪', dialCode: '+971' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬', dialCode: '+20' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴', dialCode: '+962' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧', dialCode: '+961' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾', dialCode: '+963' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶', dialCode: '+964' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼', dialCode: '+965' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦', dialCode: '+974' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'عمان', flag: '🇴🇲', dialCode: '+968' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪', dialCode: '+967' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦', dialCode: '+212' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳', dialCode: '+216' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾', dialCode: '+218' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩', dialCode: '+249' },
  { code: 'TR', name: 'تركيا', flag: '🇹🇷', dialCode: '+90' },
  { code: 'IR', name: 'إيران', flag: '🇮🇷', dialCode: '+98' },
  { code: 'PK', name: 'باكستان', flag: '🇵🇰', dialCode: '+92' },
  { code: 'AF', name: 'أفغانستان', flag: '🇦🇫', dialCode: '+93' },
  { code: 'BD', name: 'بنغلاديش', flag: '🇧🇩', dialCode: '+880' },
  { code: 'ID', name: 'إندونيسيا', flag: '🇮🇩', dialCode: '+62' },
  { code: 'MY', name: 'ماليزيا', flag: '🇲🇾', dialCode: '+60' },
  { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'المملكة المتحدة', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'فرنسا', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'ألمانيا', flag: '🇩🇪', dialCode: '+49' },
  { code: 'CA', name: 'كندا', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'أستراليا', flag: '🇦🇺', dialCode: '+61' },
];

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country) => void;
}

const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  return (
    <Select
      value={selectedCountry?.code || ''}
      onValueChange={(code) => {
        const country = countries.find(c => c.code === code);
        if (country) {
          onCountryChange(country);
        }
      }}
    >
      <SelectTrigger className="w-full border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600">
        <SelectValue placeholder="اختر البلد">
          {selectedCountry && (
            <div className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <span className="text-gray-500">({selectedCountry.dialCode})</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-gray-500">({country.dialCode})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
export type { Country };
